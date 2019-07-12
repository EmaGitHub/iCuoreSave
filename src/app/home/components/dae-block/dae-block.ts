import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FindDaePage } from '@app/find-dae';
import { DeviceService } from '@app/core/device';

/**
 * Generated class for the FindDaeBlockComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dae-block',
  templateUrl: 'dae-block.html'
})
export class DaeBlockComponent {

  constructor(private navCtrl: NavController,
    private deviceService: DeviceService) {
  }

  navigateToFindDaeMap() {

    this.deviceService.showLoading();
    this.navCtrl.setRoot(FindDaePage, { selected: 'Map' });
  }

  navigateToFindDaeList() {

    this.deviceService.showLoading();
    this.navCtrl.setRoot(FindDaePage, { selected: 'List' });
  }
}
