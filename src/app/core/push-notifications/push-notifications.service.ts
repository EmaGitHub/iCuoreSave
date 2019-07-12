import { Injectable } from '@angular/core';
import { ApiService } from '@core/api';
import { DBCollections, DBService } from '@core/db';
import { DeviceService } from '@core/device';
import { LoggerService } from '@core/logger';
import { LoginStates, UserService } from '@core/user';
import { ENV } from '@env';
import { Firebase } from '@ionic-native/firebase';
import { Storage } from '@ionic/storage';
import { PopoverController } from 'ionic-angular';
import { remove, sortBy, union } from 'lodash';
import LokiJS, { Collection } from 'lokijs';
import { Subject } from 'rxjs/Subject';

import { PushNotificationsPopover } from './components/push-notifications-popover';
import { FirebaseNotification } from './models/FirebaseNotification';
import { Notification } from './models/Notification';
import { TopicNames } from './models/TopicNames';
import { TopicTypes } from './models/TopicTypes';

const storageKeys = {
    infoEnabled: 'infoEnabled',
    subscriptions: 'subscriptions'
};

@Injectable()
export class PushNotificationsService {
    // LokiJS Collections
    private notificationsCollection: Collection|null = null;

    private storage!: Storage;
    private infoEnabled: boolean = true;
    private subscriptions: string[] = [];
    public onInfoPushArrives$: Subject<any> = new Subject<any>();
    public onAgendaPushArrives$: Subject<{meetingId: string, agendaItemId?: string}> = new Subject<{meetingId: string, agendaItemId?: string}>();
    public onNewPushCouterUpdated$: Subject<number> = new Subject<number>();

    public initCompleted: Promise<any>;

    constructor(
        private apiService: ApiService,
        private dbService: DBService,
        private logger: LoggerService,
        private firebase: Firebase,
        private deviceService: DeviceService,
        private userService: UserService,
        private popoverCtrl: PopoverController
    ){
        this.initCompleted = new Promise((resolve, reject) => {
            if (this.deviceService.isCordova()) {
                document.addEventListener('deviceready', () => {
                    this.init().then(resolve, reject);
                }, true);
            }
            else {
                this.init().then(resolve, reject);
            }
        });
    }

    /**
     * Wait for LokiJS DB loaded and init the notifications collection
     */
    private init(): Promise<any> {
        const PushNotification = this;

        this.storage = new Storage({
            name : ENV.appName.replace(/ /g, ''),
            storeName : 'push',
            driverOrder : ['localstorage']
        });
        this.storage.get(storageKeys.infoEnabled).then((infoSecEnabled: boolean) => {
            if(typeof infoSecEnabled === 'undefined' || infoSecEnabled === null){
                this.hasPermission().then((permissions) => {
                    this.setInfoEnabled(true);
                });
            }
            else {
                this.infoEnabled = infoSecEnabled;
                this.setInfoEnabled(this.infoEnabled);
            }
        });
        this.storage.get(storageKeys.subscriptions).then((subscriptions: string[]) => {
            if(subscriptions){
                this.subscriptions = subscriptions;
            }
            else {
                this.storage.set(storageKeys.subscriptions, []);
            }
        });

        if(this.deviceService.isCordova()){
            this.firebase.getToken().then(
                (token: any) => {
                    PushNotification.setToken(token);
                },
                (err: Error) => {
                    this.logger.error(err.message);
                }
            )
            this.firebase.onTokenRefresh().subscribe(
                (token: string) => {
                    PushNotification.setToken(token);
                },
                (err: Error) => {
                    this.logger.error(err);
                }
            );
            this.firebase.onNotificationOpen().subscribe((notification: FirebaseNotification) => {
                // Parse and sent event with new the notification
                PushNotification.parseNotification(notification);
                // If the use is logged also check API to get the latest push in order to update DB and tab's counter
                if(this.userService.isLogged()){
                    this.getLatestPush();
                }
            });
        }

        // When the use makes a new login => get the latest push in order to update DB and tab's counter
        this.userService.onSessionChanges$
            .filter((loginState: number) => {
                return (loginState !== LoginStates.LOGOUT && loginState !== LoginStates.THROW_OUT)
            })
            .subscribe(() => {
                this.getLatestPush();
            }
        );

        // When the app resumes => get the latest push in order to update DB and tab's counter
        this.deviceService.onResume.subscribe((loginState: number) => {
            this.getLatestPush();
        });

        return new Promise<any>((resolve, reject) => {

            this.dbService.initCompleted.then(
                (db: LokiJS) => {
                    // Init the notifications collection
                    PushNotification.notificationsCollection = this.dbService.getOrCreateCollection(DBCollections.NOTIFICATIONS);

                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Set the Firebase push token
     * @param  {string} token
     */
    private setToken(token: string) {
        this.startSubscriptions();
    }

    /**
     * Start subscription to all previously activated topic
     */
    private startSubscriptions(){
        // If INFO_SEC topic is enabled subscribe to that topic
        if(this.infoEnabled){
            this.subscribeToInfo();
        }
        // Subscribe to all other agenda/agenda-item topics
        this.subscriptions.forEach((topic: string) => {
            this.firebase.subscribe(topic);
        });
    }

    /**
     * Subscribe to INFO general topic
     */
    private subscribeToInfo(){
        this.firebase.subscribe(TopicNames.INFO);
    }

    /**
     * Unsubscribe from INFO general topic
     */
    private unsubscribeFromInfoSec(){
        this.firebase.unsubscribe(TopicNames.INFO);
    }

    /**
     * Parse push notification in order to show the correct text
     * @param  {any} notification
     */
    public parseNotification(notification: FirebaseNotification){
        this.logger.debug('PushNotificationsService:parseNotification', notification);
        const PushNotification = this;
        if(this.deviceService.isCordova()){
            try{
                const notificationType = notification.type;
                switch(notificationType){

                    case TopicTypes.INFO:
                        // If the push notification arrived when the app is in background
                        // and the user tapped the push notification
                        if(notification.tap){
                            this.processInfoNotification(notification);
                        }
                        // Otherwise the push notification arrived when the ap is in foreground
                        else {
                            this.openForegroundPopoverPush(notification, () => {
                                PushNotification.processInfoNotification(notification);
                            });
                        }

                        break;
                }
            }catch(err){
                this.logger.error(err);
            }
        }
    }

    private openForegroundPopoverPush(notification: FirebaseNotification, openPushOpen: Function){
        let popover = this.popoverCtrl.create(
            PushNotificationsPopover,
            {
                notification: notification,
                onOpen: openPushOpen
            },
            {
                cssClass: 'push-notifications-popover', showBackdrop: false, enableBackdropDismiss: false
            });

        popover.present({
            ev: {
                target : {
                    getBoundingClientRect : () => {
                        return {
                            top: 0,
                            left: 0
                        };
                    }
                }
            }
        });
    }

    private processInfoNotification(notification: FirebaseNotification){
        this.onInfoPushArrives$.next();
    }

    /**
     * Check the push notification permission
     * @returns {Promise<{isEnabled: boolean}>}
     */
    hasPermission(): Promise<{isEnabled: boolean}> {
        if(this.deviceService.isCordova()){
            return this.firebase.hasPermission();
        }
        else {
            return Promise.resolve({isEnabled: true});
        }
    }

    /**
     * Get if INFO topic is enabled in preferences panel
     */
    getEnabled(){
        return this.infoEnabled;
    }

    /**
     * Enable/Disable INFO push notifications from preferences panel
     * @param  {boolean} areEnabled
     */
    setInfoEnabled(areEnabled: boolean){
        this.infoEnabled = areEnabled;
        this.storage.set(storageKeys.infoEnabled, this.infoEnabled);
        if(this.deviceService.isCordova()){
            if(areEnabled){
                this.subscribeToInfo();
            }
            else {
                this.unsubscribeFromInfoSec();
            }
        }
    }

    /**
     * Subscribe for push notification's topic
     * @param  {string} topic
     * @returns Promise
     */
    subscribeToTopic(topic: string): Promise<any> {
        return this.firebase.subscribe(topic).then(
            () => {
                this.subscriptions = union(this.subscriptions, [topic]);
                this.storage.set(storageKeys.subscriptions, this.subscriptions);
                return Promise.resolve();
            },
            (err: Error|string) => {
                if(typeof err === 'string'){
                    err = new Error(err);
                }
                this.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * unsubscribe for push notification's topic
     * @param  {string} topic
     * @returns Promise
     */
    unsubscribeFromTopic(topic: string) {
        return this.firebase.unsubscribe(topic).then(
            () => {
                this.subscriptions = remove(this.subscriptions, (t: string) => {
                    return t === topic;
                });
                this.storage.set(storageKeys.subscriptions, this.subscriptions);
                return Promise.resolve();
            },
            (err: Error|string) => {
                if(typeof err === 'string'){
                    err = new Error(err);
                }
                this.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * Fetch latest push from API
     * and add/update DB data
     */
    private fetchLatestPush(){
        return this.apiService.callApi('getLatestPush').map(
            (notifications: any) => {
                this.updateLatestPush(notifications);
                return Promise.resolve();
            },
            (err: Error) => {
                this.logger.error(err);
                return Promise.reject(err);
            }
        );
    }

    /**
     * Update latest push data in DB
     * @param {Notification[]} notifications Notifications list to update
     */
    private updateLatestPush(notifications: Notification[]) {
        // Insert (only) the new notifications in DB
        notifications.map((n: Notification) => {
            let oldNotification = (this.notificationsCollection as Collection).find({ id: n.id })[0];
            if(!oldNotification){
                // Set isNew flag as true
                n.isNew = true;
                // Insert the new meeting in DB
                (this.notificationsCollection as Collection).insert(n);
            }
        });
    }

    /**
     * Get the new push notifications inside the DB and sent event with counter
     */
    private updateNewPushCounter(){
        const newNotificationsCounter = (this.notificationsCollection as Collection).find({isNew: true}).length;
        this.onNewPushCouterUpdated$.next(newNotificationsCounter);
    }

    /**
     * Fetch from DB all notifications
     * @returns Promise
     */
    public getNotificationsFromDB(): Notification[]{
        let notifications = sortBy((this.notificationsCollection as Collection).find(), 'sentDate').reverse();
        return notifications;
    }

    /**
     * Fetch from server or DB all notifications
     * @param  {string} month
     * @returns Promise
     */
    getLatestPush(): Promise<Notification[]>{
        const PushNotification = this;
        return new Promise((resolve, reject) => {
            // If device is online fetch data from API and update DB
            if (this.deviceService.isOnline()) {
                this.fetchLatestPush().subscribe(
                    () => {
                        this.updateNewPushCounter();
                        resolve(PushNotification.getNotificationsFromDB());
                    },
                    () => {
                        this.updateNewPushCounter();
                        resolve(PushNotification.getNotificationsFromDB());
                    }
                );
            }
            // Otherwise get data from DB
            else {
                this.updateNewPushCounter();
                resolve(PushNotification.getNotificationsFromDB());
            }
        });
    }

    /**
     * Set all notifications as readed
     */
    setNotificationsReaded(){
        (this.notificationsCollection as Collection).findAndUpdate({}, (notification: Notification) => { notification.isNew = false; });
        this.updateNewPushCounter();
    }

    /**
     * Reset the native push counter in os launcher
     */
    resetAppBadge(){
        if(this.deviceService.isCordova()){
            this.firebase.setBadgeNumber(0);
        }
    }
}
