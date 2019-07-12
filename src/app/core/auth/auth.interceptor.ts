import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private injector: Injector 
    ){ 
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
 

        let headersKeys = req.headers.keys();
        let clonedHeaders: {[name: string]: string } = {};
        headersKeys.forEach((header: string) => {
            clonedHeaders[header] = <string>req.headers.get(header);
        });

        if(!req.url.includes('mobileapp-coll.engds.it')){
            // Add the application key header
            clonedHeaders['X-Application-Key'] = this.injector.get(AuthService).getApplicationKey();

            // Add the access token header, if exists
            const accessToken = this.injector.get(AuthService).getAccessToken();
            if(accessToken){
                clonedHeaders['Authorization'] = `Bearer ${accessToken}`;
            }
        
        }

        let jwt = this.injector.get(AuthService).getJwt();
            
            if(jwt) clonedHeaders['X-Token'] = jwt!;
            
            const copiedReq = req.clone({ setHeaders: clonedHeaders});
            return next.handle(copiedReq);
    }
}

