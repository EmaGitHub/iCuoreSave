import { Component, ViewChild, NgZone, OnInit } from '@angular/core';
import { NavParams, Content, Platform, ModalController } from 'ionic-angular';

import { trigger, transition, style, animate, query, stagger, state } from '@angular/animations';

import { GeolocationServiceProvider } from '../../../../providers/geolocation-service/geolocation-service';
import { DaeServiceProvider } from '../../../../providers/dae-service/dae-service';
import { DeviceService } from '@core/device/device.service';

import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    CameraPosition,
    MarkerOptions,
    Marker,
    Environment,
    MarkerCluster,
    LatLng,
    GoogleMapsAnimation
} from '@ionic-native/google-maps';
import { DAE } from '../../models/DAE';
import { DaeDetailPage } from '../dae-detail/dae-detail';
import { StorageServiceProvider } from '../../../../providers/storage-service/storage-service';
import { timeout } from 'rxjs/operators';

declare const plugin: any;

@Component({
    selector: 'find-dae-page',
    templateUrl: 'find-dae.html',
    animations: [
        trigger('elementState', [
            state('transparent', style({
                top: '-8px'

            })),
            state('opaque', style({
                top: '8vh'
            })),
            transition('opaque => transparent', animate('500ms ease-in')),
            transition('transparent => opaque', animate('500ms ease-out'))
        ]),
        trigger('underBar', [
            state('left', style({
                left: '0vw'

            })),
            state('right', style({
                left: '50vw'
            })),
            transition('left => right', animate('300ms ease-in')),
            transition('right => left', animate('300ms ease-out'))
        ]),
        trigger('listAnimation', [
            transition('* => *', [ 
                query(':enter', [
                    style({ transform: 'translateX(200px)', opacity: 0 }),
                    stagger(150, [
                        animate('0.3s', style({ transform: 'translateX(0px)', opacity: '1' }))
                    ])
                ], { optional: true })
            ])
        ])
    ]
})

export class FindDaePage implements OnInit {

    @ViewChild(Content) content?: Content;

    private selected: string = 'List';

    private hideEnabled: boolean = false;
    private currentScroll: any;

    private lastScrollValue: any;
    private state = "opaque";
    private barState = "right";
    private triggered: boolean = false;

    private map?: GoogleMap | null = null;
    private currentPosition: any;
    private lastCameraPosition: { lat: number, lng: number, zoom: number, tilt: number } = { lat: 0, lng: 0, zoom: 0, tilt: 0 };
    private daes: DAE[] = [];

    private items: any = [];
    private refreshListVisible: boolean = false;
    private loadingDaesVisible: boolean = true;

    private animations: boolean = true;
    private iOsAnimationFix: boolean = false;

    /* daeClusterMap : any | null = null;
    positions: { "title": string, "position": { "lat": number, "lng": number }, "icon": string }[] = [];      //for MarkerCluster */

    constructor(
        private navParams: NavParams,
        private zone: NgZone,
        private geoLoc: GeolocationServiceProvider,
        private platform: Platform,
        private deviceService: DeviceService,
        private daeService: DaeServiceProvider,
        private modalCtrl: ModalController,
        private storageServiceProvider: StorageServiceProvider) { }


    ngOnInit() {

        this.storageServiceProvider.getFromStorage('animations').subscribe((val) => {
            if (val) {
                var boolValue = val.toLowerCase() == 'true' ? true : false;
                this.animations = boolValue;
            }
        });

        if (this.navParams.get('selected') == 'Map') {
            this.selected = 'Map';
            this.barState = "left";
        }
        else {
            this.selected = 'List';
            this.barState = 'right';
            setTimeout(() => {
                if (this.daes.length == 0) this.refreshListVisible = true;       //bottone per refresh nella lista
            }, 8000);
        }

        //Se si tratta di applicazione Cordova avvia configurazione posizione e mappa
        if (this.platform.is('cordova')) {
            if (!this.deviceService.isOnline()) {    //se non c'è connessione non viene fatto niente
                this.deviceService.showToast("Please, connect to internet");
                this.deviceService.hideLoading();
            }
            else this.initLocation();
        }

        //Altrimenti se sono su browser uso posizione di test
        else {
            let region = {
                minLat: 43.77132810454115,
                minLng: 11.232320601387626,
                maxLat: 43.785717229767045,
                maxLng: 11.252249596585349
            }
            this.updateDAESList(region);
        }
    }
    showItems() {
        this.getNumbersArray().map((i) => {
            this.items.push(this.daes[i])
        });
        setTimeout(() => {
            this.iOsAnimationFix = true;  
        }, 50);
        this.deviceService.hideLoading();
    }

    hideItems() {
        this.items = [];
    }

    getNumbersArray() {

        let array: any[] = []
        for (let i = 0; i < this.daes.length; i++) {
            array.push(i);
        }
        return array;
    }

    makeOpaque() {
        if (this.triggered) {
            this.state = "opaque";
            this.triggered = false;
        }
    }

    makeTransparent() {
        if (!this.triggered) {
            this.triggered = true;
            this.state = 'transparent';
        }
    }

    ionViewWillEnter() {
        this.state = 'opaque';
        this.triggered = false;
    }

    ngAfterViewInit() {

        this.content!.ionScroll.subscribe(() => {                   //gestione animazione toolbar se attiva

            this.currentScroll = this.content!.scrollTop;

            this.zone.run(() => {
                if (this.currentScroll > 50) {
                    this.hideEnabled = true;
                } else {
                    this.hideEnabled = false;
                }

                if (this.currentScroll > this.lastScrollValue && this.hideEnabled == true)
                    this.makeTransparent();

                else if (this.currentScroll < this.lastScrollValue)
                    this.makeOpaque();

                this.lastScrollValue = this.currentScroll;
            })
        });
    }

    segmentSelected(segment: string) {

        if (this.selected == segment) return;
        this.state = 'opaque';
        this.triggered = false;
        this.selected = segment;

        if (this.platform.is('cordova')) {

            if (this.selected == 'Map') {

                this.barState = 'left';
                setTimeout(() => {
                    this.deviceService.showLoading();
                    this.refreshListVisible = false;
                    this.hideItems();
                    this.initMap();
                }, 200);
                this.iOsAnimationFix = false;  
            }
            else {
                this.barState = 'right';
                this.refreshListVisible = false;
                setTimeout(() => {
                    if (this.daes.length == 0) this.refreshListVisible = true;
                    setTimeout(() => {
                        this.showItems();
                    }, 100);
                    this.lastCameraPosition = {
                        lat: this.map!.getCameraPosition()["target"]!["lat"],
                        lng: this.map!.getCameraPosition()["target"]!["lng"],
                        zoom: this.map!.getCameraPosition()["zoom"]!,
                        tilt: this.map!.getCameraPosition()["tilt"]!
                    };
                    this.map = null;
                }, 200);

            }
        }

        else if (this.selected == 'List') {         //if not on device
            this.barState = 'right';
            setTimeout(() => {

                this.hideItems();
                setTimeout(() => {
                    this.showItems();
                }, 100);
            }, 200);
        } else {
            this.barState = 'left';
            setTimeout(() => {
                this.hideItems();
            }, 200);

        }
    }

    /**
     * Inizializza la posizione dell'utente e avvia la procedura di aggiornamento lista/mappa
     */
    initLocation() {

        if (this.refreshListVisible == true) this.deviceService.showLoading();
        this.refreshListVisible = false;

        setTimeout(() => {
            if (!this.daes) this.refreshListVisible = true;
        }, 8000);

        setTimeout(() => {
            if(this.currentPosition == undefined) {         //if GPS location is not enabled
                this.deviceService.hideLoading();
                this.deviceService.showToast("Please enable GPS");
                this.refreshListVisible = true;
            }
        }, 2000);

        this.geoLoc.getPosition().then((coords: any) => {

            let latitude = coords['latitude'];
            let longitude = coords['longitude'];
            // Aggiorno la mia posizione corrente da inviare anche alla lista dei DAE per calcolarne le distanze
            this.currentPosition = {
                lat: latitude,
                lng: longitude,
                zoom: 15,
                tilt: 30
            };
            this.useCoords();
        }).catch(
            (err: Error) => {
                this.deviceService.showToast("Localization error: " + err)
            });

    }

    useCoords() {

        // Se è stata richiesta la tab mappa allora inizializzo la mappa DAE
        if (this.selected == 'Map') {
            this.initMap();
        }
        // Altrimenti inizializzo la lista DAE usando solo la mia posizione
        else this.updateDAESFromRegion();
    }

    /**
     * Inizializza la mappa Google e gli eventi per la gestione dell'aggiornamento DAE
     */
    initMap() {

        if (this.deviceService.isCordova() && this.deviceService.isOnline()) {

            if (this.lastCameraPosition.lat == 0) {
                this.lastCameraPosition = {
                    lat: this.currentPosition.lat,
                    lng: this.currentPosition.lng,
                    zoom: this.currentPosition.zoom,
                    tilt: this.currentPosition.tilt,
                }
            }

            let mapOptions: GoogleMapOptions = {
                camera: {
                    target: {
                        lat: this.lastCameraPosition.lat,
                        lng: this.lastCameraPosition.lng
                    },
                    zoom: this.lastCameraPosition.zoom,
                    tilt: this.lastCameraPosition.tilt,
                },
                controls: {
                    compass: false,
                    myLocationButton: true,
                    myLocation: true,
                    zoom: true
                }
            };

            this.map = GoogleMaps.create('map_canvas', mapOptions);

            this.map.addMarkerSync({
                title: 'Position',
                icon: 'red',
                animation: 'DROP',
                position: {
                    lat: this.currentPosition.lat,
                    lng: this.currentPosition.lng
                }
            });

            // Listemer in ascolto sulle operazioni di movimento della mappa
            // per aggiornare la lista dei DAE visibili in mappa
            this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(() => {

                //this.deviceService.showLoading();               //se si vuole evitare che si prema il bottone per la lista prima che sia completato il render mappa
                this.updateDAESFromMapRegion();
            });
            // Mi metto in ascolto sull'evento di inizializzazione della mappa
            // per inizializzare i DAE della porzione di mappa iniziale
            this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {

                setTimeout(() => {
                    this.updateDAESFromMapRegion();         //ritardo necessario????? per rendere regione visibile su mappa
                }, 100);

            });
        }
    }

    /**
     * Avvia l'aggiornamento della lista DAE relativamente alla posizione corrente
     */
    updateDAESFromMapRegion() {

        let visibleRegion;

        if (this.map) {

            visibleRegion = this.map.getVisibleRegion();
            console.log("visible region: ",visibleRegion);
            if (visibleRegion.southwest.lat == 0) {
                this.deviceService.hideLoading();         //se mappa non è stata configurata correttamente
                this.deviceService.showToast("Problemi nel caricamento della mappa, riprovare");
            }

            else this.updateDAESList({
                minLat: visibleRegion.southwest.lat,
                minLng: visibleRegion.southwest.lng,
                maxLat: visibleRegion.northeast.lat,
                maxLng: visibleRegion.northeast.lng
            });
        }
    }

    updateDAESFromRegion() {

        let myRegion = this.daeService.getMyRegion(this.currentPosition, 800);
        this.updateDAESList(myRegion);
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

                    this.refreshListVisible = false;
                    this.daes = DAElist;
                    if (this.selected == "List") this.showItems();
                    if (this.platform.is('cordova') && this.selected == "Map") this.showDAESInMap();
                    else this.deviceService.hideLoading();
                }).catch(
                (err: Error) => {
                    this.deviceService.hideLoading();
                    this.refreshListVisible = true;
                    console.log("Error: ", err);
                }
            );
    }

    showDAESInMap() {

        //TODO stop showing marker if segment changed to list

        for(let i=0; i<this.daes.length; i++){
            var dae = this.daes[i];

        //this.daes.forEach((dae: DAE) => {

            try {

            let marker: Marker = this.map!.addMarkerSync({
                title: dae.desc,
                'position': {
                    lat: dae.lat,
                    lng: dae.lng
                },
                icon: {
                    url: 'assets/imgs/icons/pin_dae_on.png',
                    size: {
                        width: 40,
                        height: 45
                    }
                }
            });

            marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
                let myModal = this.modalCtrl.create(DaeDetailPage, { data: dae });
                myModal.present();
            });

            if(i == this.daes.length-1) this.deviceService.hideLoading();

            }
            catch {
                console.log("Adding marker not completed");
            }

        };

        //this.deviceService.hideLoading();
        //this.addCluster();
    }

    /* addCluster() {

        // Rimuovo l'ultimo cluster di DAE
        if (this.daeClusterMap) {
            try {
                this.map!.clear();
                this.daeClusterMap.remove();
            } catch (e) {
            }
        }

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

            this.deviceService.hideLoading();

            markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params: any) => {
              let latLng: LatLng = params[0];
              let marker: Marker = params[1];

              console.log("PARAMS CLICKED ",JSON.stringify(params));
      
            });      
        }); 
        

        /* this.daeClusterMap.on(plugin.google.maps.event.MARKER_CLICK, (position: any, marker: any) => {
            console.log("marker<: ",marker);
            let myModal = this.modalCtrl.create(DaeDetailPage, { data: marker.dae });
            myModal.present(); 
        }); 

    }*/

    ionViewDidLeave() {
        this.map = null;
    }

}
