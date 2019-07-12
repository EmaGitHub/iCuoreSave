import { NgModule } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { SharedModule } from '@shared/shared.module';
import { IonicModule } from 'ionic-angular';

import { PushNotificationsPopover } from './components/push-notifications-popover';
import { PushNotificationsService } from './push-notifications.service';

@NgModule({
    declarations: [
        PushNotificationsPopover
    ],
    imports: [
        IonicModule,
        SharedModule
    ],
    providers : [
        Firebase,
        PushNotificationsService
    ],
    entryComponents: [
        PushNotificationsPopover
    ]
})
export class PushNotificationsModule { }
