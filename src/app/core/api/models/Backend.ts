import { Api } from './Api';
import { RequestMethods } from './RequestMethods';

export class Backend {
    public baseUrl: string;
    public api: Api[];
    public environment?: string;

    constructor(
        backend: Partial<Backend>
    ) {
        this.baseUrl = <string>backend.baseUrl;
        this.api = (backend.api as Api[]).map((a: Api) => { return new Api(a); });
        this.environment = backend.environment || 'PROD';
    }

    public getApi(apiName:string): Api|null {
        let api;
        try {
            api = <Api>this.api.find(api => api.name === apiName);
            api.url = this.prepareUrl(api.url);
        }
        catch(err){
            api = null;
        }
        return api;
    }

    /**
     * Get api configuration from the config.json file
     * @param url string HTTP request's url
     * @param method string HTTP request's method
     * @returns {Api|null}
     */
    public createNewApi(url: string, method: string = RequestMethods.GET): Api {
        url = this.prepareUrl(url);
        let api = new Api({
            name : 'newApi',
            url : url,
            method : method
        });
        return api;
    }

    /**
     * Add baseUrl as prefix if the api url is relative
     * @param {string} url Relative api url
     */
    private prepareUrl(url: string): string {
        if (url.trim().indexOf('http') !== 0) {
            url = (this.baseUrl + url).trim();
        }
        return url;
    }
}
