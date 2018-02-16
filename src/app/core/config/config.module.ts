import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';

import { ConfigModuleConfig } from './config.config';
import { ConfigService } from './config.service';

/**
* @name ConfigModule
* @description
* ConfigModule is an ngModule that imports a service to manage the external JSON config file
*/
@NgModule({
    imports: [
        IonicStorageModule.forRoot(),
        HttpClientModule
    ],
    providers: [
        ConfigService
    ]
})
export class ConfigModule {
    constructor (@Optional() @SkipSelf() parentModule: ConfigModule) {
        if (parentModule) {
            throw new Error('ConfigModule is already loaded');
        }
    }


    /**
    * Allow to pass a <ConfigModuleConfig> configuration to services in ConfigModule
    * @param  {ConfigModuleConfig} config all available configuration for <ConfigModule>
    * @returns {ModuleWithProviders}
    */
    static forRoot(config: ConfigModuleConfig): ModuleWithProviders {
        return {
            ngModule: ConfigModule,
            providers: [
                { provide: ConfigModuleConfig, useValue: config }
            ]
        }
    }
}
