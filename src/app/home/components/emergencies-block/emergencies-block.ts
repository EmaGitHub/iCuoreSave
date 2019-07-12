import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EmergenciesPage } from '../../../emergencies/pages/emergencies/emergencies';
import { GeolocationServiceProvider } from '../../../../providers/geolocation-service/geolocation-service';
import { DeviceService } from '@app/core/device';
import { EmergenciesServiceProvider } from '../../../../providers/emergencies-service/emergencies-service';
import { UserService } from '@app/core/user';

/**
 * Generated class for the EmergenciesBlockComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'emergencies-block',
  templateUrl: 'emergencies-block.html'
})
export class EmergenciesBlockComponent implements OnInit {

  emergencies: any[] = [];
  accuracy: number = 0;

  isLoading: boolean = true;

  constructor(private navCtrl: NavController,
    private geolocationService: GeolocationServiceProvider,
    private deviceService: DeviceService,
    private emergenciesService: EmergenciesServiceProvider,
    private userService: UserService) {
  }

  ngOnInit() {

    this.geolocationService.getAccuracy().then((acc: any) => {

      if (acc != null) this.accuracy = Math.floor(acc);
    });

    this.getEmergencies();
  }

  navigateToEmergencies() {

    this.deviceService.showLoading();
    this.navCtrl.setRoot(EmergenciesPage, { emergencies: this.emergencies }, { animate: false });
  }

  getEmergencies() {

    if (!this.deviceService.isOnline()) this.deviceService.showToast("Please connect to internet");

    else if (this.userService.isLogged()) {

          this.emergenciesService.fetchEmergencies().then((emergencies) => {

            this.emergencies = emergencies;
            this.isLoading = false;

          }).catch((error: any)=>{

            this.isLoading = false;
            this.deviceService.showToast("Error fetching emergencies");
          });

        }
     }

  refresh() {
    this.getEmergencies();
    this.isLoading = true;
  }

}
