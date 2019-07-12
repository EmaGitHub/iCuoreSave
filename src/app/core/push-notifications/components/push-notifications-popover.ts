import { Component } from '@angular/core';
import { LoggerService } from '@core/logger/logger.service';
import { NavParams, ViewController } from 'ionic-angular';

import { FirebaseNotification } from '../models/FirebaseNotification';
import { TopicTypes } from '../models/TopicTypes';

@Component({
    selector: 'push-notifications-popover',
    templateUrl: 'push-notifications-popover.html',
})
export class PushNotificationsPopover {
    notification: FirebaseNotification;
    icon: string = 'home';
    title: string = 'title';
    message: string = 'Push test message';
    onOpen: Function;

    constructor(
        private logger: LoggerService,
        public navParams: NavParams,
        public viewCtrl: ViewController
    ) {
        this.notification = <FirebaseNotification>this.navParams.data.notification;
        this.title = this.notification.title;
        this.message = this.notification.body;

        switch(this.notification.type){
            case TopicTypes.INFO:
                this.icon = 'warning';
                break;
            case TopicTypes.AGENDA:
                this.icon = 'ca-icon-calendar';
                break;
        }
        this.onOpen = this.navParams.data.onOpen;
    }

    /**
     * Open push and execute its onOpen function
     */
    openPush(){
        this.logger.debug('PushNotificationsPopover:openPush');
        this.onOpen();
        setTimeout(() => {
            this.closePush();
        }, 500);
    }

    /**
     * Simply close the popover
     */
    closePush(){
        this.logger.debug('PushNotificationsPopover:closePush');
        this.viewCtrl.dismiss();
    }

}
