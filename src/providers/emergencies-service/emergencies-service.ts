import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '@app/core/api';
import { LatLng } from '@ionic-native/google-maps';
import { Directions } from 'providers/models/Directions';
import { MapUtils } from '../../utils/MapUtils';
import { DeviceService } from '@app/core/device';
import { TrackingData } from '../../app/emergencies/models/TrackingData';

/*
  Generated class for the EmergenciesServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class EmergenciesServiceProvider {

    constructor(private apiService: ApiService,
        private deviceService: DeviceService) {
    }

    fetchEmergencies(): Promise<any> {


        return new Promise((resolve, reject) => {

            this.apiService.callApi('getEmergencies', {
                paths: { state: 'ATTIVA' }
            }).subscribe(
                (resp) => {

                    resolve(resp)
                },
                (err) => {
                    reject(err);
                }
            )
        }).catch((error: any) => {
            throw error;
        });

    }

    calculateDistanceMatrixInfo(lat: any, lng: any, destLat: any, destLng: any) {
        let matrixInfo: any = {};
        return Promise.all([
            this.getDistanceAndDuration(lat, lng, destLat, destLng, "walking"),
            this.getDistanceAndDuration(lat, lng, destLat, destLng, "car")
        ]).then(result => {
            matrixInfo.distance = result[0].distance;
            matrixInfo.walkingDuration = result[0].duration;
            matrixInfo.carDuration = result[1].duration;
            return matrixInfo;
        });
    }

    private getDistanceAndDuration(
        lat: any,
        lng: any,
        destLat: any,
        destLng: any,
        mode: any
    ): Promise<any> {
        let distanceObject = {
            distance: "",
            duration: ""
        };
        let originLatLng = lat + "," + lng
        let destLatLng = destLat + "," + destLng
        let queryParams = {
            origins: originLatLng,
            destinations: destLatLng,
            mode: mode,
            language: "it-IT",
            key: "AIzaSyB_WEoNiEdisEgq-vpRt1jvzDIZnsmUq6Y"
        };

        return new Promise((resolve, reject) => {
            this.apiService.callApi("calculateDistance", {
                params: queryParams
            }).subscribe(
                (result: any) => {

                    if (result.status === "OK") {
                        if (result.rows[0].elements[0].status === "OK") {
                            distanceObject.distance =
                                result.rows[0].elements[0].distance.text;
                            distanceObject.duration =
                                result.rows[0].elements[0].duration.text;

                            resolve(distanceObject);
                        } else {
                            console.log("result status is no OK");
                        }
                    } else {
                        console.log("result status is no OK");
                    }
                },
            );
        });
    }

    trackingVolunteer(
        co118: string,
        codEmergenza: string,
        idVolontario: string,
        latLng: LatLng
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.apiService.callApi("trackingVolunteer", {
                params: {
                    co118: co118,
                    codEmergenza: codEmergenza,
                    idVolontario: idVolontario
                },
                body: latLng
            }).subscribe(() => resolve(),

                reject => { console.log("reject with error ", reject) });
        });
    }

    getDirectionsInfo(originLat: number, originLng: number, destinationLat: number, destinationLng: number, dae = null) {
        return Promise.all([

            this.getDirections(originLat, originLng, destinationLat, destinationLng, 'driving', dae),
            this.getDirections(originLat, originLng, destinationLat, destinationLng, 'walking', dae)
        ]).then(result => {

            let directionsInfo: {
                driving: Directions | null,
                walking: Directions | null
            } = {
                driving: null,
                walking: null
            };;
            directionsInfo.driving = result[0];
            directionsInfo.walking = result[1];
            return directionsInfo;
        }).catch((err) => {
            this.deviceService.hideLoading();
            this.deviceService.showToast("Error while executing getDirections");
            console.log("Error while executing getDirections(): ", err);
        });
    }

    private getDirections(
        originLat: number,
        originLng: number,
        destinationLat: number,
        destinationLng: number,
        mode: any,
        dae = null
    ): Promise<Directions> {
        let directions: Directions = {
            bounds: [],
            points: [],
            distance: '',
            duration: ''
        };

        let originLatLng = originLat + "," + originLng
        let destLatLng = destinationLat + "," + destinationLng
        let queryParams = {
            origin: originLatLng,
            destination: destLatLng,
            mode: mode,
            //waypoints: null,
            language: "it-IT",
            key: "AIzaSyB_WEoNiEdisEgq-vpRt1jvzDIZnsmUq6Y"
        };

        if (dae) {
            //queryParam.waypoints = dae;
        }
        return new Promise((resolve, reject) => {

            this.apiService.callApi('getDirections',
                { params: queryParams })
                .subscribe(
                    (result: any) => {
                        if (result.status === 'OK') {
                            directions.bounds.push(result.routes[0].bounds.northeast);
                            directions.bounds.push(result.routes[0].bounds.southwest);
                            directions.points = MapUtils.decodePolyline(result.routes[0].overview_polyline.points);
                            directions.distance = result.routes[0].legs[0].distance.text;
                            directions.duration = result.routes[0].legs[0].duration.text;
                            resolve(directions);
                        }
                        else {
                            this.deviceService.hideLoading();
                            reject(result.status);
                        }
                    },
                    reject
                );
        });
    }

    /* volunteerOnSite(
        co118: string,
        codEmergenza: string,
        trackingData: TrackingData
    ): Promise<string> {
        return new Promise((resolve, reject) => {

            // riferimento alla chiamata api
            const volunteerOnSiteApi = this.apiService.callApi.bind(ApiService, "volunteerOnSite", {
                params: {
                    co118: co118,
                    codEmergenza: codEmergenza,
                    idVolontario: trackingData.volontario.idVolontario
                }
            })

            // riferimento alla resolve
            const resolveVolunteerOnSiteApi = () => {
                // salva lo stato dell'attivazione dell'emergenza
                store.commit('emergency/setStatus', {
                    co118: co118,
                    cod_emergenza: codEmergenza,
                    userId: trackingData.volontario.idVolontario,
                    activated: true,
                    onPlace: true
                } as EmergencyStatus);
                resolve('Api volontario sul posto avvenuta con successo');
            }

            // controlla se il volontario ha già comunicato la presenza sull'emergenza
            if(this.isVolunteerAlreadyOnPlace(co118, codEmergenza, trackingData.volontario.idVolontario)) {
                return resolve('Api volontario sul posto già eseguita');
            }

            // controlla se l'emergenza è già stata attivata dall'utente
            // se non è stata ancora attivata, viene attivata adesso
            if(!this.isVolunteerAlreadyActived(co118, codEmergenza, trackingData.volontario.idVolontario)) {
                this.activateVolunteer(co118, codEmergenza, trackingData).then(
                    () => {
                        volunteerOnSiteApi().then(
                            resolveVolunteerOnSiteApi,
                            reject
                        );
                    },
                    err => {
                        if(err.status === 412) {
                            volunteerOnSiteApi().then(
                                resolveVolunteerOnSiteApi,
                                reject
                            );
                        }
                        else {
                            reject(err);
                        }
                    }
                );
            }
            // se è già stata attivata viene chiamata direttamente la volontario sul posto
            else {
                volunteerOnSiteApi().then(
                    resolveVolunteerOnSiteApi,
                    reject
                );
            }
        });
    } */

    
   /*  isVolunteerAlreadyActived(co118: string, cod_emergenza: string, userId: string): boolean {
        return store.getters['emergency/isEmergencyActivated'](co118, cod_emergenza, userId);
    }

    activateVolunteer(
        co118: string,
        codEmergenza: string,
        trackingData: TrackingData
    ): Promise<string> {

        const commitStore = () => {
            store.commit('emergency/setStatus', {
                co118: co118,
                cod_emergenza: codEmergenza,
                userId: trackingData.volontario.idVolontario,
                activated: true,
                onPlace: false
            } as EmergencyStatus);
        }

        return new Promise((resolve, reject) => {

            // controlla se l'emergenza è già stata attivata dall'utente
            if(this.isVolunteerAlreadyActived(co118, codEmergenza, trackingData.volontario.idVolontario)) {
                return reject({
                    message: 'Attivazione volontario già eseguita',
                    status: 412
                });
            }

            this.apiService.callApi("activateVolunteer", {
                params: { co118: co118, codEmergenza: codEmergenza },
                body: trackingData
            }).subscribe(
                () => {
                    // salva lo stato dell'attivazione dell'emergenza
                    commitStore()
                    resolve('Attivazione volontario avvenuta con successo');
                },
                error => {
                    // emergenza già attivata
                    // aggiorna lo status locale dell'emergenza
                    if(error.status === 412) {
                        commitStore();
                    }
                    reject(error);
                }
            );
        });
    } */
}
