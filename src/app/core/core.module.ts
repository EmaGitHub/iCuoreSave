import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ResponseErrorInterceptor, ResponseInterceptor } from '@core/api';
import { ApiModule } from '@core/api/api.module';
import { AuthInterceptor, AuthService } from '@core/auth';
import { ConfigModule } from '@core/config/config.module';
import { DBModule } from '@core/db/db.module';
import { DeepLinkService } from '@core/deeplink';
import { DeviceModule } from '@core/device/device.module';
import { LoggerModule } from '@core/logger/logger.module';
import { NavigationModule } from '@core/navigation/navigation.module';
import { PushNotificationsModule } from '@core/push-notifications/push-notifications.module';
import { UserModule } from '@core/user/user.module';
import { VersioningModule } from '@core/versioning';
import { ENV } from '@env';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@NgModule({
    imports : [
        ConfigModule.forRoot({
            remote: ENV.configUrl,
            storePrefix: ENV.storePrefix
        }),
        ApiModule,
        DeviceModule.forRoot({
            modalTitle : ENV.appName,
            dialogsMode : 'native'
        }),
        LoggerModule,
        DBModule.forRoot({
            dbName: 'ionic_db'
        }),
        UserModule.forRoot({
            storePrefix: ENV.storePrefix
        }),
        VersioningModule,
        NavigationModule,
        PushNotificationsModule
    ],
    providers: [
        AuthService,
        DeepLinkService,
        InAppBrowser,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi : true },
        { provide: HTTP_INTERCEPTORS, useClass: ResponseErrorInterceptor, multi : true },
        { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi : true }
    ]
})
export class CoreModule {

}
