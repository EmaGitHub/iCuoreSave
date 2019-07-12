import { Component, Input, OnInit } from '@angular/core';
import { DeviceService } from '@app/core/device';
import { DaeServiceProvider } from '../../../../providers/dae-service/dae-service';
import { EmergenciesServiceProvider } from '../../../../providers/emergencies-service/emergencies-service';
import { GeolocationServiceProvider } from '../../../../providers/geolocation-service/geolocation-service';
import { ILatLng } from '@ionic-native/google-maps';
import { ModalController, NavController } from 'ionic-angular';
import { EmergencyDetailPage } from '@app/emergencies/pages/emergency-detail/emergency-detail';
import { BlankPage } from '@app/login/pages/blank-page/blank-page';

/**
 * Generated class for the EmergencyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'emergency',
    templateUrl: 'emergency.html'
})
export class EmergencyComponent implements OnInit {

    @Input() emergency: any;

    desc: string = "Uomo in probabile arresto cardiaco";

    currentPosition: any;
    distanceObj: { distance: string, walkingDuration: string, carDuration: string } = { distance: "", walkingDuration: "", carDuration: "" };

    proximityDAECounter?: number | null = null;

    isLoading: boolean = true;

    constructor(
        private geolocationService: GeolocationServiceProvider,
        private emergenciesService: EmergenciesServiceProvider,
        private deviceService: DeviceService,
        private daeService: DaeServiceProvider,
        private modalCtrl: ModalController,
        private navCtrl: NavController
    ) {}

    ngOnInit() {

        setTimeout(() => {
            if(this.currentPosition == undefined) {         //if GPS location is not enabled
                this.deviceService.hideLoading();
                this.deviceService.showToast("Please enable GPS");
            }
        }, 2000);

        this.geolocationService.getPosition().then((position) => {

            this.currentPosition = position;
            //controllo i DAE presenti nelle vicinanze
            if(this.deviceService.isCordova())
            this.daeService.getNearbyDAE({
                position: {
                    lat: position.latitude,
                    lng: position.longitude,
                    equals(other: ILatLng): boolean{ return true;},
                    toUrlValue(precision?: number): string{ return ' ';}             
                }
                ,
                radius: 800
            }, {
                position: {
                    lat: this.emergency['luogo']['latitudine'],      //con notazione puntata . non funziona
                    lng: this.emergency['luogo']['longitudine'],
                    equals(other: ILatLng): boolean{ return true;},
                    toUrlValue(precision?: number): string{ return ' ';}
                    
                }
                ,
                radius: 800
            }).subscribe(
                    (DAEList: any) => {
                        this.proximityDAECounter = DAEList.length;
                    },
                    () => {
                        console.log('Proximity dae error');
                    }
                );

            //controllo la distanza dal DAE e il tempo per percorrere il tragitto
            this.emergenciesService.calculateDistanceMatrixInfo(position.latitude, position.longitude, this.emergency['luogo']['latitudine'], this.emergency['luogo']['longitudine']).then(
                (matrixInfo) => {
                    this.distanceObj = matrixInfo;
                    this.isLoading = false;
                }
            );
        });
    }

    interviene() {

        //this.navCtrl.push(BlankPage, {}, { animate: false });
        this.deviceService.showLoading();
        /* let myModal = this.modalCtrl.create(EmergencyDetailPage, {emergency: this.emergency, position: this.currentPosition});
        myModal.onDidDismiss(() => {
            this.navCtrl.pop();
        })
        myModal.present(); */
        this.navCtrl.push(EmergencyDetailPage,  {emergency: this.emergency, position: this.currentPosition}, {animate: true});
    }

    notInterviene() {

    }

}
