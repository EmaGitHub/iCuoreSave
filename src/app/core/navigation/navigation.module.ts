import { NgModule } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

import { NavigationService } from './navigation.service';

@NgModule({
    providers : [
        LaunchNavigator,
        Geolocation,
        NavigationService
    ]
})
export class NavigationModule { }
