import { Component, ViewChild, OnInit } from '@angular/core';
import { Starter } from '@app/starter/starter';
import { AutoUnsubscribe } from '@core/auto-unsubscribe';
import { DeviceService } from '@core/device';
import { UserService, LoginStates, User } from '@core/user';
import { Nav, Platform, ModalController, Config, MenuController, AlertController } from 'ionic-angular';

import { HomePage } from './home/pages/home/home';
import { SettingsPage } from './settings/pages/settings/settings';
import { FindDaePage } from './find-dae';
import { LoginPage } from './login/pages/login/login';
import { BlankPage } from './login/pages/blank-page/blank-page';
import { InfoPage } from './info';
import { EmergenciesPage } from './emergencies';
import { UserPage } from './user';
import { FcmServiceProvider } from '../providers/fcm-service/fcm-service';
import { StatusBar } from '@ionic-native/status-bar';
import { StorageServiceProvider } from '../providers/storage-service/storage-service';


@Component({
    templateUrl: 'app.html'
})
export class App extends AutoUnsubscribe implements OnInit {

    @ViewChild('content') mainNav!: Nav;
    rootPage: any = Starter;
    userIsLogged: boolean = false;  

    user?: User;
    private exitAlert: boolean = true;

    constructor(
        private platform: Platform,
        private deviceService: DeviceService,
        private userService: UserService,
        private modalCtrl: ModalController,
        private fcmServiceProvider: FcmServiceProvider,
        private config: Config,
        private menuCtrl: MenuController,
        private statusBar: StatusBar,
        private alertCtrl: AlertController,
        private storageServiceProvider: StorageServiceProvider
        ) {
        super();
        this.platform.ready().then(() => {
            this.initOrientation();
            this.initLogoutSubscriptions();
            this.statusBar.styleLightContent();
            this.statusBar.overlaysWebView(false);
            this.statusBar.backgroundColorByHexString("#df222e");
            try{
                this.fcmServiceProvider.initializeFirebase();
            }catch (error) {
                console.log("Fcm init error: ",error);
              }
        });

    }

    ngOnInit() {

/*         this.config.set('ios', 'statusbarPadding',false);
 */
        this.userService.userDataObservable$.subscribe((userData) => {
            this.user = userData;
            this.checkIfLogged();
        })

        this.platform.registerBackButtonAction(()=>{
            this.exitConfirm();
        });
    }

    /**
     * Initialize the native device orientation
     */
    initOrientation() {
        // If device is tablet activate split view and unlock orientation
        if (this.deviceService.isTablet()) {
            if (this.deviceService.isCordova()) {
                this.deviceService.unlockOrientation();
            }
        }
        // Otherwise deactivate split view and lock orientation in portrait
        else if (this.deviceService.isCordova()) {
            this.deviceService.lockOrientation(this.deviceService.ORIENTATIONS.PORTRAIT_PRIMARY);
        }
    }

    /**
     * Initialize subscription for logout events in order to hide the app's content
     */
    initLogoutSubscriptions() {
        this.userService.onSessionChanges$
            .takeUntil(this.destroy$)
            .subscribe((loginState: number) => {
                //this.userIsLogged = (loginState === LoginStates.LOGOUT || loginState === LoginStates.THROW_OUT);
            });
    }

    openHomePage() {
        this.menuCtrl.close();  
        this.mainNav.setRoot(HomePage, {}, { animate: false });
    }

    openLoginPage() {
        this.menuCtrl.close();  
        this.mainNav.push(BlankPage, {}, { animate: false });
        let myModal = this.modalCtrl.create(LoginPage);
        myModal.onDidDismiss(() => {
            this.checkIfLogged();
            this.mainNav.setRoot(HomePage, {}, { animate: false });
        })
        myModal.present();
    }

    openUserPage() {
        this.menuCtrl.close();  
        this.mainNav.setRoot(UserPage, {}, { animate: false });
    }

    openFindDaePage() {
        this.menuCtrl.close();  
        this.deviceService.showLoading();
        this.mainNav.setRoot(FindDaePage, { selected: 'List' }, { animate: false });
    }

    openSettingsPage() {
        this.menuCtrl.close(); 
        this.deviceService.showLoading(); 
        this.mainNav.setRoot(SettingsPage, {}, { animate: false });
    }

    openInfoPage() {
        this.menuCtrl.close();  
        this.mainNav.setRoot(InfoPage, {}, { animate: false });
    }

    openEmergenciesPage() {
        this.menuCtrl.close();  
        this.deviceService.showLoading();                        //menuClose automatico non funziona
        this.mainNav.setRoot(EmergenciesPage, {}, { animate: false }); 
    }

    logout() {

        this.menuCtrl.close();  
        this.deviceService.confirm(
            'ARE_YOU_SURE_YOU_WANT_LOGOUT',
            {
                title: 'ICUORE_SAVE',
                buttons: [
                    {
                        text: 'NO',
                        handler: () => {
                        }
                    },
                    {
                        text: 'YES',
                        handler: () => {
                            if(!this.deviceService.isOffline()){
                                this.userService.logout(LoginStates.LOGOUT);
                                this.userIsLogged = false;

                                this.storageServiceProvider.getFromStorage('animations').subscribe((val) => {
                                    if (val) {
                                    var boolValue = val.toLowerCase() == 'true' ? true : false;
                                    HomePage.animForLogout = boolValue;
                                    this.mainNav.setRoot(HomePage);
                                    }
                                });  
                            }
                            else this.deviceService.showToast("Please connect to internet");
                        }
                    }
                ]
            }
        );
    }

    checkIfLogged() {

        if (this.userService.isLogged()) {
            this.userIsLogged = true;
        }
    }

    exitConfirm() {

        let alert = this.alertCtrl.create({
          title: 'Confirm exit',
          message: 'Do you really want to close app?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                  this.exitAlert = true;
              }
            },
            {
              text: 'Close',
              handler: () => {
                this.platform.exitApp();
              }
            }
          ]
        });
        if(this.exitAlert) alert.present();
        this.exitAlert = false;
      }

}
