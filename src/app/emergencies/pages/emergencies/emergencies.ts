import { Component, OnInit } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { trigger, transition, style, animate, query, stagger, state } from '@angular/animations';

import { DeviceService } from '../../../core/device/device.service';
import { EmergenciesServiceProvider } from '../../../../providers/emergencies-service/emergencies-service';
import { StorageServiceProvider } from '../../../../providers/storage-service/storage-service';

/**
 * Generated class for the EmergenciesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-emergencies',
  templateUrl: 'emergencies.html',
  animations: [
    trigger('emergenciesState', [
      state('invisible', style({
        transform: 'translateY(200%)'

      })),
      state('opaque', style({
        transform: 'translateY(0px)'
      })),
      transition('invisible => opaque', animate('500ms ease-out'))
    ]),
    trigger('labelState', [
      state('invisible', style({
        transform: 'translateX(100%)'
      })),
      state('opaque', style({
        transform: 'translateX(0px)'
      })),
      transition('invisible => opaque', animate('500ms ease-out'))
    ])
  ]
})

export class EmergenciesPage implements OnInit {

  private emergencies: any[] = [];
  private refreshEmergenciesVisible: boolean = false;
  private emergenciesLoaded: boolean = false;

  private items: any = [];

  private state = "invisible";

  private isLoaded: boolean = false;
  private animations: boolean = false;

  constructor(private navParams: NavParams,
    private deviceService: DeviceService,
    private emergenciesService: EmergenciesServiceProvider,
    private storageServiceProvider: StorageServiceProvider) {

    this.emergencies = this.navParams.get('emergencies');
  }

  ngOnInit() {

    this.storageServiceProvider.getFromStorage('animations').subscribe((val) => {
        if (val) {
          var boolValue = val.toLowerCase() == 'true' ? true : false;
          this.animations = boolValue;}
          else this.animations = true;
        this.isLoaded = true;

        if (!this.deviceService.isOnline()) {
          this.deviceService.showToast("Please, connect to internet");
          this.refreshEmergenciesVisible = true;
          this.deviceService.hideLoading();
          }
    
        else {                            // se c'è connessione
         
          if (!this.emergencies) this.fetchEmergencies();    //se accedo dal sidemenu
          else {
            this.deviceService.hideLoading()
            setTimeout(() => {
              this.state = 'opaque';
              this.deviceService.hideLoading();
            }, 100);
          }
        }
    });
  }

  callbackConnProblem() {
    this.emergencies = [];
    this.state = 'opaque';
    this.deviceService.showToast("Error fetching emergencies");
  }

  fetchEmergencies() {

    this.deviceService.showLoading();
    this.refreshEmergenciesVisible = false;
    setTimeout(() => {
      if (!this.emergenciesLoaded) this.refreshEmergenciesVisible = true;
    }, 8000);
    this.emergenciesService.fetchEmergencies().then((emergencies) => {

      this.emergencies = emergencies;
      console.log("emerg ",this.emergencies)
      this.emergenciesLoaded = true;
      setTimeout(() => {
        this.state = 'opaque';
        this.deviceService.hideLoading();
      }, 100);

    }).catch((error: any) => {

      console.log("Error fetching emergencies",error);
      if (this.deviceService.isCordova())
        this.deviceService.showToast("Error fetching emergencies");
        this.deviceService.hideLoading();
        this.refreshEmergenciesVisible = true;
    });
  }

}
