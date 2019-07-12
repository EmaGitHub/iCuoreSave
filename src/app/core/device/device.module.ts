import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { KeyboardProvider } from '@core/device/models/IKeyboard';
import { Device } from '@ionic-native/device';
import { Dialogs } from '@ionic-native/dialogs';
import { Globalization } from '@ionic-native/globalization';
import { Network } from '@ionic-native/network';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { I18nModule } from '@shared/i18n/i18n.module';

import { DeviceService } from './device.service';
import { DeviceModuleOptions } from './models/DeviceModuleOptions';

/**
* @name DeviceModule
* @description
* DeviceModule is an ngModule that imports a lot of services and utils for a Cordova app
*/
@NgModule({
    imports: [
        I18nModule
    ],
    providers: [
        DeviceService,
        Network,
        SplashScreen,
        KeyboardProvider,
        SpinnerDialog,
        Dialogs,
        StatusBar,
        Globalization,
        ScreenOrientation,
        Device
    ]
})
export class DeviceModule {
    constructor (@Optional() @SkipSelf() parentModule: DeviceModule) {
        if (parentModule) {
            throw new Error('DeviceModule is already loaded. Import it in the AppModule only');
        }
    }

    /**
    * Allow to pass a <DeviceModuleOptions> configuration to DeviceService
    * @param  {DeviceModuleOptions} options all available configuration for <DeviceModule>
    * @returns {ModuleWithProviders}
    */
    static forRoot(options?: Partial<DeviceModuleOptions>): ModuleWithProviders {
        return {
            ngModule: DeviceModule,
            providers: [
                { provide: DeviceModuleOptions, useValue: options }
            ]
        }
    }
}
