
export class ParsedURL {
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    searchObject: any;
    protocol: string;

    constructor(
        parser: HTMLAnchorElement,
        searchObject: any
    ){
        this.protocol = parser.protocol || '';
        this.host = parser.host || '';
        this.hostname = parser.hostname || '';
        this.port = parser.port || '';
        this.pathname = parser.pathname || '';
        this.search = parser.search || '';
        this.hash = parser.hash || '';
        this.searchObject = searchObject || {};
    }

}
