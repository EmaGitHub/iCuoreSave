import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';

import { ApiStatuses } from './models/ApiStatuses';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        return next
            .handle(req)
            .pipe(
                tap((response: HttpEvent<any>) => {
                    if (response instanceof HttpResponse) {

                        if(response.body.esito){
                            try {
                                // The API always return with 200 OK status
                                // The `status` attribute inside the API body give us the feedback
                                // If the `status.code` is ApiStatuses.OK return the correct API response
                                if(response.body.status.code === ApiStatuses.OK){
                                    return response;
                                }
                                // otherwise the API was gone on error
                                // so thorw an Error with `status.desc` as message
                                else {
                                    throw new Error(response.body.status.desc);
                                }
                            } catch (err) {
                                throw err;
                            }
                        }
                        else {
                            return response;
                        }
                    }
                })
            );
    }
}
