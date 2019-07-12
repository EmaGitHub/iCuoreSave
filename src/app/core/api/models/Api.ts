import { HttpHeaders } from '@angular/common/http';

import { RequestMethods } from './RequestMethods';

export class Api {
    public name: string;
    public url: string;
    public method: string;
    public headers?: HttpHeaders;
    public timeout?: number;

    constructor(
        api: Api
    ) {
        this.name = api.name || '';
        this.url = api.url;
        this.method = (api.method || RequestMethods.GET).toUpperCase();
        this.headers = new HttpHeaders()
            .set('Content-Type', 'application/json; charset=UTF-8');
        if(api.headers){
            for (let key in api.headers){
                this.headers = this.headers.set(key, (<any>api.headers)[key].toString());
            }
        }
        this.timeout = api.timeout || 30000;
    }
}
