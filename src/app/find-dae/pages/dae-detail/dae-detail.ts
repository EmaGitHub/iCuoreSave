import { Component, OnInit } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { GeolocationServiceProvider } from '../../../../providers/geolocation-service/geolocation-service';
import { DeviceService } from '@app/core/device';

/**
 * Generated class for the DaeDetailComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dae-detail-page',
  templateUrl: 'dae-detail.html'
})
export class DaeDetailPage {

  dae: any;

  constructor(private navParams: NavParams,
    private geoLoc: GeolocationServiceProvider,
    private launchNavigator: LaunchNavigator,
    private devService: DeviceService,
    private navCtrl: NavController) {

    this.dae = this.navParams.get('data');
  }

  navigateToDae() {

    if (this.devService.isCordova()) {

      this.geoLoc.getPosition().then((coords: any) => {

        let latitude = coords['latitude'];
        let longitude = coords['longitude'];

        this.launchNavigator.navigate([this.dae._lat, this.dae._lng], {
          start: "" + latitude + "," + longitude + ""
        });

      },
        (err: Error) => {
          console.log("Localization error: " + err)
        });

    }

  }

  backEvent() {

    this.navCtrl.pop({ animate: true, animation: 'md-transition' });
  }

}
