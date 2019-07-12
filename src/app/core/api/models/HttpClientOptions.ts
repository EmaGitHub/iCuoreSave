import { HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpObserve } from '@angular/common/http/src/client';

import { ResponseTypes } from './ResponseTypes';

export class HttpClientOptions {

    constructor(
        public body?: any,
        public headers?: HttpHeaders | {
            [header: string]: string | string[];
        },
        public observe: HttpObserve = 'body',
        public params?: HttpParams | {
            [param: string]: string | string[];
        },
        public reportProgress?: boolean,
        public responseType: ResponseTypes = ResponseTypes.JSON,
        public withCredentials?: boolean
    ) { }
}
