import { Injectable } from '@angular/core';
import { DeviceService } from '@core/device/device.service';
import { Subscription } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { DeepLinkPaths } from './models/DeepLinkPaths';
import { EventData } from './models/EventData';
import { ParsedURL } from './models/ParsedURL';

declare var universalLinks: any;

@Injectable()
export class DeepLinkService {
    public onDeepLinking$: Subject<string> = new Subject<string>();
    private deepLinkIsReady$!: Subscription;

    constructor(
        private deviceService: DeviceService
    ){
        if (this.deviceService.isCordova()) {
            document.addEventListener('deviceready', () => {
                this.initSubscriptions();
            }, true);
        }
    }

    private initSubscriptions() {
        // Subscription for all deeplink
        universalLinks.subscribe('ul_deeplink', (eventData: EventData) => {
            const url = this.parseURL(eventData.url);
            this.detectDeepLinkPath(url);
        });
    }

    private detectDeepLinkPath(url: ParsedURL){
        const paths = url.pathname.split('/');

        switch(paths[1]){
            case DeepLinkPaths.LINK:
                // If a subscription is already started unsubscribe it
                if(this.deepLinkIsReady$ && !this.deepLinkIsReady$.closed){
                    this.deepLinkIsReady$.unsubscribe();
                }
        }
    }

    /**
     * Parsed url and return a special HTMLAnchorElement with searchObject params
     * @param  {string} url
     * @returns ParsedURL
     */
    private parseURL(url: string): ParsedURL {
        var parser = document.createElement('a'),
            searchObject: any = {},
            queries, split, i;
        // Let the browser do the work
        parser.href = url;
        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return new ParsedURL(parser, searchObject);
    }
}
