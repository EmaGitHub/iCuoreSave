import { Component } from '@angular/core';

import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { ViewController, Platform, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { trigger, state, style, transition, animate } from '@angular/core'; 
import { DeviceService } from '@app/core/device';
import { UserService } from '@app/core/user';
import { LoggerService } from '@app/core/logger';
import { AuthService } from '@app/core/auth';
import { HomePage } from '../../../home/pages/home/home';

const storageKeys = {
  token: 'token',
  jwt: 'jwt',
  firstAccess: 'firstAccess'
};

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    animations: [
      trigger('elementState', [
        state('transparent', style({
          opacity: 1,
          top: 0
         
        })),
        state('opaque', style({
          opacity: 1,
          top: '8vh'
        })),
        transition('opaque => transparent', animate('500ms ease-in')),
        transition('transparent => opaque', animate('500ms ease-out'))
      ])
    ]
})
export class LoginPage {

    scanSub: any;

    constructor(
                private platform: Platform,
                private viewCtrl: ViewController, 
                private qrScanner: QRScanner,
                private deviceService: DeviceService,
                private userService: UserService,
                private loggerService: LoggerService,
                private navCtrl: NavController,
                private authService: AuthService,
                private storage: Storage){

                  this.platform.registerBackButtonAction(()=>{
                    this.goBack();
                  })
                }

    ionViewWillEnter(){

      /* if (this.deviceService.isCordova() && !this.deviceService.isVirtual()){      //COMMENTED FOR SPEED UP TEST
        this.qrScanner.prepare()
          .then((status: QRScannerStatus) => {
            if (status.authorized) {
              console.log('Camera Permission Given');
               this.scanSub = this.qrScanner.scan().subscribe((otp: string) => {
                  this.deviceService.showLoading();
                  this.deviceService.showToast( 'code scanned: '+otp);
                  this.login(otp);
                  this.qrScanner.hide();
                  this.scanSub.unsubscribe(); 
              });
      
              this.qrScanner.show(); 

            } else if (status.denied) {
              console.log('Camera permission denied');
            } else {
              console.log('Permission denied for this runtime.');
            }
          })
          .catch((e: any) => console.log('Error is', e));

        }
        else { */
          this.authService.setJwt('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIiLCJjb2RGaXNjYWxlIjoiTEJSRk5DODJUMjJGODM5QSIsImNvZ25vbWUiOiJGaW5hY2NpIiwiaXNzIjoiaWN1b3JlLWF1dGgiLCJub21lIjoiTGliZXJ0byIsImV4cCI6MzE3MDcxNzIzMTY4LCJpYXQiOjE1MzM3MzkxNjh9.P0Ls631Dc0JWvE3mLkbzNwutzC8h6g9yNEM1Be86SA0');
          this.userService.simulatorStartSession();
          this.storage.set(storageKeys.firstAccess, true);
          this.navCtrl.pop(); 
          this.deviceService.hideLoading();

        //}
      }

      login(otp: string){

          this.userService.login(otp).then(
            () => {
                //this.viewCtrl.dismiss().catch(() => {});
                //this.navCtrl.pop();
                this.goBack()
                this.deviceService.hideLoading();
                //this.navCtrl.setRoot(HomePage, {}, { animate: false });
              },
            (err: Error) => {
                this.loggerService.error("LoginScreen:login", err);
                //this.viewCtrl.dismiss().catch(() => {}); 
                //this.navCtrl.pop();   
                this.goBack();
                this.deviceService.hideLoading();
                //this.navCtrl.setRoot(HomePage, {}, { animate: false });

                /* this.$deviceService.alert(this.$i18nService.$t(err.message), () => {
                    this.subscribeScan();
                }); */
            }
        );
      }

      goBack() {
        this.navCtrl.pop();
        this.qrScanner.destroy();   
      }
  
}
