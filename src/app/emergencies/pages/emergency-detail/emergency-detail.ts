import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { NavParams, Platform, NavController, ModalController, Navbar } from 'ionic-angular';
import { EmergenciesServiceProvider } from '../../../../providers/emergencies-service/emergencies-service';
import { DeviceService } from '@app/core/device';
import { DAE } from '@app/find-dae/models/DAE';
import { UserService, User } from '@app/core/user';
import { LatLng, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, ILatLng, Polyline, Marker, MarkerCluster, GoogleMap } from '@ionic-native/google-maps';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { DaeServiceProvider } from '../../../../providers/dae-service/dae-service';
import { StorageServiceProvider } from '../../../../providers/storage-service/storage-service';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { TrackingData, Dae } from '@app/emergencies/models/TrackingData';
import { DaeDetailPage } from '@app/find-dae';

declare const plugin: any;
declare var google: any;

/**
 * Generated class for the EmergencyDetailComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'page-emergency-detail',
  templateUrl: 'emergency-detail.html',
  animations: [
    trigger('elementState', [
      state('transparent', style({
        opacity: '0'

      })),
      state('opaque', style({
        opacity: '1'
      })),
      transition('opaque => transparent', animate('300ms ease-in')),
      transition('transparent => opaque', animate('400ms ease-out'))
    ]),
    trigger('loadingProblem', [
      state('false', style({
        opacity: '0',
        top: '-50px'
      })),
      state('true', style({
        opacity: '1',
        top: '10px'
      })),
      transition('false => true', animate('500ms ease-in')),
      transition('true => false', animate('500ms ease-out'))
    ])
  ]
})
export class EmergencyDetailPage implements OnInit {

  @ViewChild(Navbar) navBar?: Navbar;

  private user: User = this.userService.getUser();
  private emergency: any;

  private previousPosition: any = null;
  private previousZoom: number | null = null;

  private distanceObj = { carDuration: '', walkingDuration: '' };

  private map?: GoogleMap;
  private directionMode: 'driving' | 'walking' = 'driving';
  private currentPosition: any;
  private refreshMapVisible: boolean = false;
  private directionsPolyline: any;
  private daes: DAE[] | null = null;

  private directions: any;

  private daeClusterMap: any | null = null;
  private positions: { title: string, position: { lat: number, lng: number }, icon: string, disableAutoPan: boolean }[] = [];      //for MarkerCluster
  private visibleRegion: any;

  private forwardNavigation: boolean = false;
  private htmlInfoWindow: any;

  private loadProblem = 'false';

  constructor(
    private platform: Platform,
    private navParams: NavParams,
    private emergenciesService: EmergenciesServiceProvider,
    private deviceService: DeviceService,
    private userService: UserService,
    private navCtrl: NavController,
    private launchNavigator: LaunchNavigator,
    private daeService: DaeServiceProvider,
    private modalCtrl: ModalController,
    private emergencyServiceProvider: EmergenciesServiceProvider,
    private callNumber: CallNumber) {

    this.emergency = this.navParams.get('emergency');
    this.currentPosition = this.navParams.get('position');

    this.platform.registerBackButtonAction(() => {

      this.backEvent();
    })
  }

  ngOnInit() {

    this.refreshMapVisible = false;
    setTimeout(() => {
      if (!this.map && !this.forwardNavigation) this.refreshMapVisible = true;       //bottone per refresh della mappa
      //if (true)  this.loadProblem = 'true'            //bottone per refresh
    }, 8000);

    //controllo tempo per percorrere il tragitto
    this.emergenciesService.calculateDistanceMatrixInfo(this.currentPosition.latitude, this.currentPosition.longitude, this.emergency['luogo']['latitudine'], this.emergency['luogo']['longitudine']).then(
      (matrixInfo) => {
        this.distanceObj = matrixInfo;
      }
    ).catch((err: any) => {
      this.loadProblem = 'true';
      console.log("error: ", err);
      this.deviceService.hideLoading();
    });;

    if (this.deviceService.isCordova()) {
      this.initMap();
      this.trackVolunteer();
    }
    else {
      this.deviceService.hideLoading();
      this.refreshMapVisible = true;
      setTimeout(() => {
        this.loadProblem = 'true';
      }, 1000);
    }
  }

  ionViewDidEnter() {

    if (this.forwardNavigation) {       

      this.deviceService.showLoading();
      this.drawMapContent();
      this.forwardNavigation = false;
    }
  }

  initMap() {

      let mapOptions: GoogleMapOptions = {

        mapType: plugin.google.maps.MapTypeId.ROADMAP,
        camera: {
          target: {
            lat: this.currentPosition.latitude,
            lng: this.currentPosition.longitude
          }
        },
        controls: {
          compass: false,
          myLocationButton: true,
          myLocation: true,
          zoom: true
        }
      };

      this.map = GoogleMaps.create('map_canvas', mapOptions);

      /* this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(() => {

        console.log("moved region", this.map!.getVisibleRegion());
      }); */

      this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {

        this.drawMapContent();
      });
  }

  carSelected() {
    if (this.directionMode == 'walking') {
      this.deviceService.showLoading();
      this.directionMode = 'driving';
      this.drawMapContent();
    }
  }
  walkSelected() {
    if (this.directionMode == 'driving') {
      this.deviceService.showLoading();
      this.directionMode = 'walking';
      this.drawMapContent();
    }
  }

  drawMapContent() {

    if (this.deviceService.isCordova()) {
      this.map!.clear();
      this.directionsPolyline = [];

      // per inizializzare i Marker di partenza e destinazione
      this.drawEndPointsMarkers();

      // get route from A to B
      this.fetchDirection();
    }
    else this.deviceService.hideLoading();

  }

  drawEndPointsMarkers() {

    this.map!.addMarkerSync({
      title: 'Position',
      icon: 'red',
      animation: 'DROP',
      position: {
        lat: this.currentPosition.latitude,
        lng: this.currentPosition.longitude
      }
    });

    this.map!.addMarkerSync({
      title: 'Emergency',
      icon: 'assets/imgs/icons/pin_emergency_resized.png',
      animation: 'DROP',
      position: {
        lat: this.emergency['luogo']['latitudine'],
        lng: this.emergency['luogo']['longitudine']
      }
    });
  }

  fetchDirection() {
    /* let daeLatLng = null;
    if(this.selectedDAEMarker){
        let dae: DAE = this.selectedDAEMarker.get('dae');
        daeLatLng = `${dae.ubicazione.latitudine},${dae.ubicazione.longitudine}`;
    } */

    this.emergenciesService.getDirectionsInfo(
      this.currentPosition.latitude, this.currentPosition.longitude,
      this.emergency['luogo']['latitudine'], this.emergency['luogo']['longitudine']
      //,daeLatLng
    ).then(
      (directions) => {
        this.directions = directions;
        this.drawDirectionsToEmergency();
      }).catch(
        (err: Error) => {
          console.log("Error: ", err)
          this.loadProblem = 'true';
          //this.refreshMapVisible = true;
          this.deviceService.hideLoading();
        }
      )
  }

  drawDirectionsToEmergency() {

    this.addPolyline();

    this.map!.moveCamera({
      target: this.directions[this.directionMode].bounds
    }).then(() => {

      this.updateDAESFromMapRegion(); //this.directions[this.directionMode].bounds
    }).catch((err: any) => {

      this.loadProblem = 'true';
      console.log("error: ", err);
      this.deviceService.hideLoading();
    });
  }

  addPolyline() {

    this.map!.addPolyline({
      points: this.directions[this.directionMode].points,
      color: '#2196F3',
      width: 8,
      geodesic: true
    });
  }

  /**
     * Avvia l'aggiornamento della lista DAE relativamente alla posizione corrente
     */
  updateDAESFromMapRegion() {

    if (this.map) {

      if (!this.visibleRegion) this.visibleRegion = this.map.getVisibleRegion();

      this.updateDAESList({
        minLat: this.visibleRegion.southwest.lat,
        minLng: this.visibleRegion.southwest.lng,
        maxLat: this.visibleRegion.northeast.lat,
        maxLng: this.visibleRegion.northeast.lng
      });
    }
  }

  /**
   * Recupera la lista dei DAE relativamente alla regione che gli viene passata
   */
  updateDAESList(region: { minLat: number, minLng: number, maxLat: number, maxLng: number }) {

    if (!this.deviceService.isOnline()) {
      this.deviceService.showToast("Please, connect to internet");
      this.deviceService.hideLoading();
    }

    else this.daeService.fetchByCoord(
      region.minLat,
      region.minLng,
      region.maxLat,
      region.maxLng
    )
      .then(
        (DAElist) => {
          this.daes = DAElist;
          this.showDAESInMap();
        }).catch(
          (err: Error) => {
            this.updateDAESFromMapRegion();  
            console.log("Error: ", err)
          }
        );
  }

  showDAESInMap() {

    this.positions = [];
    this.daes!.forEach((dae: DAE) => {

      this.positions.push({ title: dae.desc, position: { lat: dae.lat, lng: dae.lng }, icon: 'assets/imgs/icons/pin_dae_on.png', disableAutoPan: true });
    });

    this.addCluster();
  }

  addCluster() {

    //Aggiungo il cluster di DAE
    this.daeClusterMap = this.map!.addMarkerCluster({
      boundsDraw: false,
      markers: this.positions,
      icons: [
        { min: 2, max: 1000, url: "assets/imgs/icons/cluster_pin.png" },
        { min: 1000, max: 2000, url: 'static/img/icons/cluster_pin.png', anchor: { x: 24, y: 24 } },
        { min: 2000, url: 'static/img/icons/cluster_pin.png', anchor: { x: 32, y: 32 } }
      ]
    }).then((markerCluster: MarkerCluster) => {

      if (this.previousPosition != null) {                            //per posizionare la mappa sull'ultima posizione prima di andare nel dettaglio dae
        this.map!.moveCamera(this.previousPosition);
        this.map!.setCameraZoom(this.previousZoom!);
        this.previousPosition = null;
        this.previousZoom = null;
      }
      this.deviceService.hideLoading();

      markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params: any) => {
        let latLng: LatLng = params[0];
        let marker: Marker = params[1];

        marker.one(GoogleMapsEvent.INFO_CLICK).then(() => {
          console.log('info-click', latLng);
        }).catch((err) => {
          console.log("error: ", err)
        });
        marker.one(GoogleMapsEvent.MARKER_CLICK).then(() => {
          console.log('marker-click lat-lng: ', latLng, ' marker: ', marker);

          for (let i = 0; i < this.daes!.length; i++) {

            if (latLng.lat == this.daes![i].lat && latLng.lng == this.daes![i].lng) {

              this.forwardNavigation = true;
              this.previousPosition = this.map!.getCameraPosition();
              this.previousZoom = this.map!.getCameraZoom();
              this.navCtrl.push(DaeDetailPage, { data: this.daes![i] }, { animate: true });


              /* this.selectDAE(marker);
              this.htmlInfoWindow = new plugin.google.maps.HtmlInfoWindow();
        
              // Chiudi il tooltip
              let closeInfoWindow: HTMLElement = document.createElement('button');
              closeInfoWindow.classList.add('close-info-window');
              let html = [
                '<i class="icon ics-close" style="font-size: 16px;"></i>',
              ].join('');
              closeInfoWindow.innerHTML = html;
              closeInfoWindow.addEventListener('click', (event: Event) => {
                this.deselectDAE();
                this.htmlInfoWindow.close();
              });
        
              // Naviga al DAE
              let navigateToDAE: HTMLElement = document.createElement('li');
              navigateToDAE.classList.add('navigate-to-dae');
              html = [
                '<div class="content">',
                '   <div class="media">',
                '       <i class="icon ics-heart color-secondary" style="font-size: 24px;"></i>',
                '   </div>',
                '   <div class="inner">',
                '       <div class="title"> ' + "NAVIGATE TO DAE (trad)" + ' </div>',   //I18nService.$t('NAVIGATE_TO_DAE')
                '   </div>',
                '</div>'
              ].join('');
              navigateToDAE.innerHTML = html;
              navigateToDAE.addEventListener('click', (event: Event) => {
                let dae = marker.get('dae');
                this.goToEmergency(dae);
              });
        
              // Dettaglio DAE
              let DAEDetails: HTMLElement = document.createElement('li');
              DAEDetails.classList.add('dae-details');
              html = [
                '<div class="content">',
                '   <div class="media">',
                '       <i class="icon ics-dae color-secondary" style="font-size: 24px;"></i>',
                '   </div>',
                '   <div class="inner">',
                '       <div class="title"> ' + "DAE DETAILS (trad)" + ' </div>',   //I18nService.$t('DAE_DETAILS')
                '   </div>',
                '</div>'
              ].join('');
              DAEDetails.innerHTML = html;
              DAEDetails.addEventListener('click', (event: Event) => {
                let dae = marker.get('dae');
                
                //this.forwardNavigation = true;
                //this.previousPosition = this.map!.getCameraPosition();
                //this.previousZoom = this.map!.getCameraZoom(); 

                this.navCtrl.push(DaeDetailPage, {data: this.daes![i]}, {animate: true});
              });
        
              let frame: HTMLElement = document.createElement('ul');
              frame.classList.add('action-list');
              frame.appendChild(closeInfoWindow);
              frame.appendChild(navigateToDAE);
              frame.appendChild(DAEDetails);
        
              this.htmlInfoWindow.setContent(frame, {width: "250px"});
              this.htmlInfoWindow.open(marker); */
            }
          }
        }).catch((err: any) => {
          this.loadProblem = 'true';
          console.log("error: ", err);
          this.deviceService.hideLoading();
        });

      });
    }).catch((err: any) => {
      this.loadProblem = 'true';
      console.log("error: ", err);
      this.deviceService.hideLoading();
    });
  }

  goToEmergency(dae: any) {

    /* this.activateVolunteer(this.).then(
      () => { // success
          if(this.$deviceService.isCordova()) {
              this.activateBgGeolocation();
          }
          this.launchNavigator.navigate([this.emergency['luogo']['latitudine'], this.emergency['luogo']['longitudine']], {
            start: "" + this.currentPosition.latitude + "," + this.currentPosition.longitude + ""
          });      },
      (err) => {
          // Chiamata di attiva volontario già fatta
          if(err.status === 412) {
            this.launchNavigator.navigate([this.emergency['luogo']['latitudine'], this.emergency['luogo']['longitudine']], {
              start: "" + this.currentPosition.latitude + "," + this.currentPosition.longitude + ""
            });          }
          else {
              this.$deviceService.alert('GO_TO_EMERGENCY_ERROR');
          }
      }
  ); */
  }

  /* activateVolunteer(dae: DAE | null = null): Promise<void> {
    return new Promise((resolve, reject) => {
        const user: User = this.userService.getUser();

        this.emergenciesService.activateVolunteer(
            this.emergency.co118,
            this.emergency.cod_emergenza,
            this.getTrackingData(dae)
        ).then(
            (message) => {
                resolve();
                this.$logger.debug(message);
            },
            error => {
                this.$logger.error(
                    "Si è verificato un errore durante il l'attivazione del volontario",
                    error
                );
                reject(error);
            }
        );
    });
} */

  sonoSulPosto() {
    /*    this.volunteerOnSite().then(
         () => {
             this.call118();
             BGGeolocationService.stopTracking();
         },
         err => {
             this.$deviceService.alert('ARRIVED_ON_SITE_ERROR');
         }
     ); */
  }

  private volunteerOnSite() {                              //return typre : Promise<any> 
    /* return new Promise((resolve, reject) => {
        const user: User = this.userService.getUser();
 
        this.emergenciesService.volunteerOnSite(
            this.emergency.co118,
            this.emergency.cod_emergenza,
            this.getTrackingData()
        ).then(
            (message: any) => {
                resolve();
            },
            (error: any) => {
                console.log(
                    "Si è verificato un errore durante l'ap volontario sul posto"
                );
                reject(error);
            }
        );
    }); */
  }

  selectDAE(marker: any) {

  }

  deselectDAE() {

  }

  trackVolunteer() {

    let latLng: LatLng = {
      lat: this.currentPosition.latitude,
      lng: this.currentPosition.longitude,
      equals(other: ILatLng): boolean { return true; },
      toUrlValue(precision?: number): string { return ' '; }
    };
    this.emergenciesService.trackingVolunteer(
      this.emergency.co118,
      this.emergency.cod_emergenza,
      this.user.codFiscale!,
      latLng
    ).then(
      (error: any) => {
        console.log("Tracciamento avvenuto con successo: ", error);
      }).catch(
        (error: any) => {
          console.log(
            "Si è verificato un errore durante il tracciamento del volontario",
            error
          );
        }
      );
  }

  call118() {
    this.callNumber.callNumber("118", true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  reloadMap() {

    this.loadProblem = 'false';
    this.refreshMapVisible = false;
    this.deviceService.showLoading();
    if (this.deviceService.isCordova()) {
      this.initMap();
      this.trackVolunteer();
    }
    else {
      this.deviceService.hideLoading();
      setTimeout(() => {
        this.loadProblem = 'true';
        this.refreshMapVisible = true;
      }, 1000);
    }
  }

  private getTrackingData(dae?: DAE) {                  // tipo ritorno :TrackingData
    /*  const user: User = this.userService.getUser();
     let td: TrackingData = {
         timestamp_evento: this.emergency.timestamp_evento,
         volontario: {
             idVolontario: user.codFiscale,
             identificativo: user.codFiscale,
             nome: user.nome,
             cognome: user.cognome,
             // cellulare: user.telefono || '0763313316', // a scopo di sviluppo, in produzione commentare la riga corrente e deccomentare la seguente
             cellulare: user.telefono,
             esecutore: user.isPerformer()
         },
         latitudine: this.currentPosition.lat,
         longitudine: this.currentPosition.lng
     };
 
     if(dae) {
         try{
             td.dae = {
                 id: dae.daeIdentificativo.defibrillatoreId,
                 co118: dae.daeIdentificativo.competenza.co118.codice,
                 codiceCo118: dae.daeIdentificativo.codiceDae118
             };
         }
         catch(e){
             this.deviceService.alert(e.message);
         }
     }
 
     return td; */
  }

  backEvent() {
    if(this.map) this.map!.clear();
    this.navCtrl.pop({ animate: true, animation: 'md-transition' });
  }
}
