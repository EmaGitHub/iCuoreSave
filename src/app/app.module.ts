import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { App } from '@app/app.component';
import { HomeModule } from '@app/home';
import { IonicConfig } from '@app/ionic.config';
import { Starter } from '@app/starter/starter';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { SettingsModule } from './settings/settings.module';
import { FindDaeModule } from './find-dae';
import { IonicStorageModule } from '@ionic/storage';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginModule } from './login/login.module';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { StorageServiceProvider } from '../providers/storage-service/storage-service';
import { GeolocationServiceProvider } from '../providers/geolocation-service/geolocation-service';
import { DaeServiceProvider } from '../providers/dae-service/dae-service';
import { GoogleMaps } from '@ionic-native/google-maps';
import { InfoModule } from './info';
import { EmergenciesModule } from './emergencies';
import { EmergenciesServiceProvider } from '../providers/emergencies-service/emergencies-service';
import { UserModule } from './user';

import { FcmServiceProvider } from '../providers/fcm-service/fcm-service';
import { Firebase } from '@ionic-native/firebase';
import { BGGeolocationServiceProvider } from '../providers/BG-geolocation-service/BG-geolocation-service';
import { CallNumber } from '@ionic-native/call-number/ngx';

@NgModule({
    declarations: [
        App,
        Starter
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(App, IonicConfig),
        IonicStorageModule.forRoot(),
        CoreModule,
        SharedModule,
        LoginModule,
        HomeModule,
        SettingsModule,
        FindDaeModule,
        InfoModule,
        EmergenciesModule,
        BrowserAnimationsModule,
        UserModule
        ],
    bootstrap: [IonicApp],
    entryComponents: [
        App,
        Starter
    ],
    providers: [
        QRScanner,
        CallNumber,
        StorageServiceProvider,
        GeolocationServiceProvider,
        BGGeolocationServiceProvider,
        DaeServiceProvider,
        GoogleMaps,
        EmergenciesServiceProvider,
        Firebase,
        FcmServiceProvider,
        {provide: ErrorHandler, useClass: IonicErrorHandler}    
]
})
export class AppModule {}
