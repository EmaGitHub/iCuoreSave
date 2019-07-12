import { NgModule } from '@angular/core';
import { ENV } from '@env';
import { I18nModule } from '@shared/i18n/i18n.module';
import { ModalNavPageModule } from '@shared/modal-nav/modal-nav.module';
import { IonicModule } from 'ionic-angular';

@NgModule({
    imports : [
        IonicModule,
        ModalNavPageModule,
        I18nModule.forRoot({
            remote: ENV.translationsUrl,
            storePrefix: ENV.storePrefix
        })
    ],
    exports : [
        I18nModule,
        ModalNavPageModule
    ]
})
export class SharedModule { }
