import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional, SkipSelf, Injector } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { I18nService } from './i18n.service';
import { I18nModuleOptions } from './models/I18nModuleOptions';
import { CustomTranslateHttpLoader } from './models/CustomTranslateHttpLoader';

/**
* @name I18nModule
* @description
* I18nModule is an ngModule that imports a service to manage the external JSON language file
* and initialize the ngx-translate library
*/
@NgModule({
    imports: [
        IonicStorageModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: CustomTranslateHttpLoader,
                deps: [Injector]
            }
        }),
        HttpClientModule
    ],
    providers: [
        I18nService
    ],
    exports : [
        TranslateModule
    ]
})
export class I18nModule {
    constructor (@Optional() @SkipSelf() parentModule: I18nModule) {
        if (parentModule) {
            throw new Error('I18nModule is already loaded');
        }
    }

    /**
    * Allow to pass a <I18nModuleOptions> configuration to services in I18nModule
    * @param  {I18nModuleOptions} options all available configuration for <I18nModule>
    * @returns {ModuleWithProviders}
    */
    static forRoot(options?: I18nModuleOptions): ModuleWithProviders {
        return {
            ngModule: I18nModule,
            providers: [
                { provide: I18nModuleOptions, useValue: options }
            ]
        }
    }
}
