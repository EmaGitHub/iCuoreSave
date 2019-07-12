import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AuthService } from '@core/auth';
import { DeviceService } from '@core/device';
import { LoginStates, UserService } from '@core/user';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ResponseErrorInterceptor implements HttpInterceptor {
    isRefreshingToken: boolean = false;
    tokenSubject: BehaviorSubject<string|null> = new BehaviorSubject<string|null>(null);

    constructor(
        private injector: Injector
    ){ }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .catch((error: any) => {
                const deviceService: DeviceService = this.injector.get(DeviceService);
                if(deviceService.isOnline()){
                    if (error instanceof HttpErrorResponse) {
                        switch ((<HttpErrorResponse>error).status) {
                            case 401:
                                return this.handle401Error(req, error, next);
                            default:
                                return this.handleError(error);
                        }
                    }
                    else {
                        return this.handleError(error);
                    }
                }
                else {
                    return this.handleError({
                        status: -1,
                        message: 'DEVICE_OFFLINE'
                    })
                }
            });
    }

    handleError(err: any) {
        if(err && err.error){
            return Promise.reject(err.error);
        }
        else {
            return Promise.reject(err);
        }
    }

    handle401Error(req: HttpRequest<any>, err: any, next: HttpHandler) {
        const authService: AuthService = this.injector.get(AuthService);
        const userService: UserService = this.injector.get(UserService);

        // If the user is logged the session was expired so I will try to refresh that token
        if(userService.isLogged()){
            if (!this.isRefreshingToken) {
                this.isRefreshingToken = true;

                // Reset here so that the following requests wait until the token
                // comes back from the refreshToken call.
                this.tokenSubject.next(null);

                return authService.fetchAccessToken()
                    .switchMap((newToken: string) => {
                          if (newToken) {
                              this.tokenSubject.next(newToken);
                              return next.handle(this.updateTokenInRequest(req, newToken));
                          }

                          // If we don't get a new token, we are in trouble so logout.
                          userService.logout(LoginStates.THROW_OUT);
                          return this.handleError(err);
                    })
                    .catch(error => {
                        // If there is an exception calling 'refreshToken', bad news so logout.
                        userService.logout(LoginStates.THROW_OUT);
                        return this.handleError(err);
                    })
                    .finally(() => {
                        this.isRefreshingToken = false;
                    });
            }
            else if(req.url.includes('getAccessToken')) {
                return this.handleError(err);
            }
            else {
                return this.tokenSubject
                    .filter(token => token != null)
                    .take(1)
                    .switchMap(token => {
                        return next.handle(this.updateTokenInRequest(req, <string>token));
                    });
            }
        }
        else {
            const isPublic = userService.isPublicAccess();
            // If the current "user" is a public user get a new accessToken
            if(isPublic){
                if (!this.isRefreshingToken) {
                    this.isRefreshingToken = true;

                    // Reset here so that the following requests wait until the token
                    // comes back from the refreshToken call.
                    this.tokenSubject.next(null);

                    // Get the new accessToken from server
                    return Observable.fromPromise(authService.fetchPublicAccess())
                        .switchMap((newToken: string) => {
                            // If its all ok, reply previous requests
                            if (newToken) {
                                this.tokenSubject.next(newToken);
                                return next.handle(this.updateTokenInRequest(req, newToken));
                            }
                            return this.handleError(err);
                        })
                        .catch((err: Error) => {
                            return this.handleError(err);
                        });
                }
                else if(req.url.includes('authentication/public')) {
                    return this.handleError(err);
                }
                else {
                    return this.tokenSubject
                        .filter(token => token != null)
                        .take(1)
                        .switchMap(token => {
                            return next.handle(this.updateTokenInRequest(req, <string>token));
                        });
                }
            }
            // Otherwise I'm trying to login, but the credentials are not correct
            else {
                return this.handleError(err);
            }
        }
    }

    /**
     * Clone the request updating the Authorization token header
     * @param  {HttpRequest<any>} req Old request to update and retry
     * @param  {string} token New token to add in the Authorization header
     * @returns HttpRequest
     */
    updateTokenInRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
        let headersKeys = req.headers.keys();
        let clonedHeaders: {[name: string]: string } = {};
        headersKeys.forEach((header: string) => {
            clonedHeaders[header] = <string>req.headers.get(header);
        });
        clonedHeaders['Authorization'] = `Bearer ${token}`;
        return req.clone({ setHeaders: clonedHeaders});
    }
}
