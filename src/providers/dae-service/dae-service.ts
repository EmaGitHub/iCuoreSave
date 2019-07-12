import { LatLng } from "@ionic-native/google-maps";
import { DAECoordRegion } from "../../app/find-dae/models/DAECoordRegion";
import { DeviceService } from "@core/device/device.service";
import { ApiService } from "@app/core/api";
import { Injectable } from "@angular/core";
import { DAE } from "@app/find-dae/models/DAE";
import { Platform } from "ionic-angular";
import { GeolocationServiceProvider } from "../geolocation-service/geolocation-service";

declare const plugin: any;

const metisApiKey = '8b4VVILAaIQok605rbbaGtfb4Gc2gSlN';

@Injectable()
export class DaeServiceProvider {

    private currentPosition!: LatLng;
    private countForRetry: number = 0;

    constructor(private apiService: ApiService,
        private deviceService: DeviceService,
        private platform: Platform,
        private geolocationService: GeolocationServiceProvider) {
    }

    fetchByCoord(minLat: number, minLng: number, maxLat: number, maxLng: number): Promise<any> {

        return new Promise((resolve, reject) => {

            this.apiService.callApi('getListaDAEByLatLng', {
                params: { minLat, minLng, maxLat, maxLng }
                , headers: { apiKey: metisApiKey }
            }).subscribe(
                (resp) => {

                    let daeModelList = this.getDaeModelList(resp);
                    this.countForRetry = 0;
                    resolve(daeModelList)
                },
                (err) => {
                    
                    this.countForRetry++;
                    console.log("Error getting daes with count for retry ",this.countForRetry);

                    if(this.countForRetry < 5) this.fetchByCoord(minLat, minLng, maxLat, maxLng);
                    else reject(err);
                    
                }
            )
        })
    }

    /**
     * Ritorna i DAE nelle vicinanze del punto richiesto
     * @param  {position: LatLng} from.position Posizione del punto principale
     * @param  {number} radius? Raggio in metri dal punto principale
     */
    getMyRegion(myPosition: LatLng, radius: number = 800): DAECoordRegion {

        let region: DAECoordRegion = {
            minLat: 0,
            minLng: 0,
            maxLat: 0,
            maxLng: 0
        };

        if (this.deviceService.isCordova()) {

            // Calcolo la metà della diagonale del quadrato circoscritto al cerchio
            // in modo da poter avere l'intorno del punto from
            // http://www.ilcalibro.it/images/quadrato2.gif
            const distance = radius * Math.sqrt(2);

            // Calcolo le 4 coordinate del punto from per avere l'intorno
            // utilizzando il plugin di Google Maps
            let square = {
                max: plugin.google.maps.geometry.spherical.computeOffset(myPosition, distance, 45),
                min: plugin.google.maps.geometry.spherical.computeOffset(myPosition, distance, 225),
            };

            region = {
                minLat: square.min.lat,
                minLng: square.min.lng,
                maxLat: square.max.lat,
                maxLng: square.max.lng
            };
        }

        return region;
    }

    getDaeModelList(daeList: any): Promise<any>{

        let daes: DAE[] = [];

        return this.geolocationService.getPosition().then((coords: any) => {

            this.currentPosition = new LatLng(coords['latitude'], coords['longitude']);

            for(let dae of daeList) {

                let daeLat = dae.ubicazione.latitudine;
                let daeLng = dae.ubicazione.longitudine;
                let distanza = '348';
                if (this.platform.is('cordova'))    {
                    var daeLatLng = new plugin.google.maps.LatLng(daeLat, daeLng);

                    distanza = plugin.google.maps.geometry.spherical.computeDistanceBetween(this.currentPosition, daeLatLng);
                }

                daes.push( new DAE(
                    dae.daeIdentificativo.defibrillatoreId,
                    dae.postazioneFissa,
                    dae.daeIdentificativo.competenza.co118.denominazione,
                    dae.ubicazione.descrizione,
                    dae.ubicazione.indirizzo,
                    daeLat,
                    daeLng,
                    distanza
                ));
            }
            return daes;

        });

    }
    
    /**
     * Ritorna i DAE nelle vicinanze del punto richiesto, oppure nell'intorno dei due punti richiesti
     * @param  {position: LatLng} from.position Posizione del punto principale
     * @param  {number} radius? Raggio in metri dal punto principale
     * @param  {position:LatLng} to? Posizione del punto secondario
     * @param  {number} radius? Raggio in metri dal punto secondario
     */
    getNearbyDAE(from: {position: LatLng, radius?: number}, to: {position: LatLng, radius?: number}){
        let fromRegion: DAECoordRegion;
        let toRegion: DAECoordRegion;
        let finalRegion: DAECoordRegion;

        fromRegion = this.getMyRegion(from.position, from.radius);

        // Se mi è stata richiesta anche un punto secondario
        // ripeto il calcolo anche per il secondo punto
        if(to.position.lat && to.position.lng){

            toRegion = this.getMyRegion(to.position, to.radius);

            // Confronto le nuove coordinate prendendo le lat/lng minime e massime finali
            finalRegion = {
                minLat: (fromRegion.minLat < toRegion.minLat)? fromRegion.minLat : toRegion.minLat,
                minLng: (fromRegion.minLng < toRegion.minLng)? fromRegion.minLng : toRegion.minLng,
                maxLat: (fromRegion.maxLat > toRegion.maxLat)? fromRegion.maxLat : toRegion.maxLat,
                maxLng: (fromRegion.maxLng > toRegion.maxLng)? fromRegion.maxLng : toRegion.maxLng,
            }
        }
        else {
            finalRegion = fromRegion;
        }

        
        return this.apiService.callApi('getListaDAEByLatLng', {
            params : {
                minLat : finalRegion.minLat,
                minLng : finalRegion.minLng,
                maxLat : finalRegion.maxLat,
                maxLng : finalRegion.maxLng
            },
            headers: { apikey : metisApiKey }
        });
    }

}