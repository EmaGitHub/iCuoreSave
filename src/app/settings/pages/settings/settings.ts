import { Component, OnInit } from '@angular/core';

import { I18nService } from '@app/shared/i18n';
import { PopoverController, Platform } from 'ionic-angular';
import { LanguagesPopover } from '../languages-popover/languages-popover';

import { AppVersion } from '@ionic-native/app-version';
import { DeviceService } from '@app/core/device';
import { UserService } from '@app/core/user';
import { StorageServiceProvider } from '../../../../providers/storage-service/storage-service';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit {

    currentLanguage: any;
    currentVersion: any;

    isLogged: boolean = false;

    pushNotificationsEnabled: boolean = false;
    animationsEnabled: boolean = false;

    constructor(
        private i18nService: I18nService,
        public popoverCtrl: PopoverController,
        private appVersion: AppVersion,
        private platform: Platform,
        private deviceService: DeviceService,
        private userService: UserService,
        private storageServiceProvider: StorageServiceProvider
    ) {

        this.currentLanguage = this.i18nService.getCurrentLanguage();
        this.currentLanguage = this.currentLanguage.label;

        this.userService.userDataObservable$.subscribe((userData) => {
            this.isLogged = this.userService.isLogged();
        })

        this.getCurrentVersion();
    }

    ngOnInit() {
        if (this.userService.isLogged()) this.isLogged = true;

        this.storageServiceProvider.getFromStorage('notifications').subscribe((val) => {
            if (val) {
              var boolValue = val.toLowerCase() == 'true' ? true : false;
              this.pushNotificationsEnabled = boolValue;
            }
          });

          this.storageServiceProvider.getFromStorage('animations').subscribe((val) => {
            if (val) {
              var boolValue = val.toLowerCase() == 'true' ? true : false;
              this.animationsEnabled = boolValue;
            }
            else 
              this.animationsEnabled = true;

            this.deviceService.hideLoading();
          });
        
    }

    getLogged() {
        return this.isLogged;
    }

    presentPopover() {
        let popover = this.popoverCtrl.create(LanguagesPopover, {
            currentLanguage: this.currentLanguage,
        });
        popover.present();
        popover.onDidDismiss(() => {

            this.currentLanguage = this.i18nService.getCurrentLanguage();
            this.currentLanguage = this.currentLanguage.label;
            this.deviceService.hideLoading();
        });
    }

    langIT() {
        let langs = this.i18nService.getAllLanguages();
        this.i18nService.setLanguage(langs[0]);
    }

    langEN() {
        let langs = this.i18nService.getAllLanguages();
        this.i18nService.setLanguage(langs[1]);
    }

    getCurrentVersion() {

        if (this.platform.is('cordova')) {

            this.appVersion.getVersionNumber().then(version => {
                this.currentVersion = version;
            })

        } else {
            this.currentVersion = 'x.x.x';
        }


    };

    toggleSwitchNotif() {

        this.storageServiceProvider.putInStorage('notifications', this.pushNotificationsEnabled.toString());
    }

    toggleSwitchAnim() {

        this.storageServiceProvider.putInStorage('animations', this.animationsEnabled.toString());
    }

    /**
     * Verify push notification permission in order to show a different message
     */
    checkPushNotificationPermission() {

        /*  if(this.deviceService.isCordova()){
             FCMService.hasPermission().then((isEnabled) => {
                 this.hasPushPermissions = isEnabled;
             });
         } */
        return true
    }
}
