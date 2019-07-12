import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { DBService } from './db.service';
import { DBModuleOptions } from './models/DBModuleOptions';

/**
* @name DBModule
* @description
* DBModule is an ngModule that imports a service to manage local DB storage
*/
@NgModule({
    providers: [
        DBService
    ]
})
export class DBModule {
    constructor (@Optional() @SkipSelf() parentModule: DBModule) {
        if (parentModule) {
            throw new Error('DBModule is already loaded. Import it in the AppModule only');
        }
    }

    /**
    * Allow to pass a <DBModuleOptions> configuration to DBService
    * @param  {DBModuleOptions} options all available configuration for <DBModule>
    * @returns {ModuleWithProviders}
    */
    static forRoot(options?: Partial<DBModuleOptions>): ModuleWithProviders {
        return {
            ngModule: DBModule,
            providers: [
                { provide: DBModuleOptions, useValue: options }
            ]
        }
    }
}
