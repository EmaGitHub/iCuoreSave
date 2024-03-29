import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { LoggerService } from './logger.service';
import { LoggerModuleOptions } from './models/LoggerModuleOptions';

/**
* @name LoggerModule
* @description
* LoggerModule is an ngModule that imports the loggerService to log in browser or Cordova device
* with programmable level of log
*/
@NgModule({
    providers: [
        LoggerService
    ]
})
export class LoggerModule {
    constructor(@Optional() @SkipSelf() parentModule: LoggerModule) {
        if (parentModule) {
            throw new Error('LoggerModule is already loaded. Import it in the AppModule only');
        }
    }

    /**
    * Allow to pass a <LoggerModuleOptions> configuration to LoggerService
    * @param  {LoggerModuleOptions} options all available configuration for <LoggerModule>
    * @returns {ModuleWithProviders}
    */
    public static forRoot(options?: Partial<LoggerModuleOptions>): ModuleWithProviders {
        return {
            ngModule: LoggerModule,
            providers: [
                { provide: LoggerModuleOptions, useValue: options }
            ]
        }
    }
}
