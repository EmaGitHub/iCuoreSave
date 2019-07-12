import { Nav, Platform, AlertController } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DeviceService } from '@app/core/device';

//const iosNotificationsStyleOverride = require('./ios-notifications-style-override.scss');
declare const require: any;
//declare const FirebasePlugin: FirebasePlugin;

/*
  Generated class for the GeolocationServiceProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers 
  and Angular DI.
*/
@Injectable()
export class FcmServiceProvider {

  private storage?: Storage;
  private defaultTopic: string[] = ['EMERGENZA'];
  private subscriptions: string[] = [];
  //public onPushArrives$: BehaviorSubject<Notification> = new BehaviorSubject<Notification>(string);
  public onEnabledChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private firebase: Firebase,
    public platform: Platform,
    //When the app's open, we'll show them as Toasts, but feel free to use an Alert instead
    public alertCtrl: AlertController,
    private deviceService: DeviceService
  ) {}
  
  initializeFirebase() {
    if (!this.platform.is("core") && this.deviceService.isCordova()) {
      this.firebase.subscribe("all");
      this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    }
  }
  initializeFirebaseAndroid() {
    this.firebase.getToken().then(token => { console.log("FCM token received: ", token) });
    this.firebase.onTokenRefresh().subscribe(token => { console.log("FCM token refresh: ", token) })
    this.subscribeToPushNotifications();
  }
  initializeFirebaseIOS() {
    this.firebase.grantPermission()
      .then(() => {
        this.firebase.getToken().then(token => { console.log("FCM token received: ", token) });
        this.firebase.onTokenRefresh().subscribe(token => { console.log("FCM token refresh: ", token) })
        this.subscribeToPushNotifications();
      })
      .catch((error) => {
        this.firebase.logError(error);
      });
  }
  subscribeToPushNotifications() {
    this.firebase.onNotificationOpen().subscribe((response) => {
      if (response.tap) {

        this.presentToast("");

        //Received while app in background (this should be the callback when a system notification is tapped)
        //This is empty for our app since we just needed the notification to open the app
      } else {
        //received while app in foreground (show a toast)

        this.presentToast(response.body);
      }
    });
  }

  subscribe(topic: string) {

    this.firebase.subscribe(topic)
  }

  presentToast(message: string) {
    let alert = this.alertCtrl.create({
      title: 'iCuore-Save',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: () => {
          }
        }
      ]
    });
    alert.present();
  }
}