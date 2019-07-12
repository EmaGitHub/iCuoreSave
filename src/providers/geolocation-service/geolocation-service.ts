import { Geolocation } from '@ionic-native/geolocation';

import { Injectable } from '@angular/core';

/*
  Generated class for the GeolocationServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GeolocationServiceProvider {



  constructor(
                private geolocation: Geolocation) {  }

  getPosition(): Promise<any> {

    return this.geolocation.getCurrentPosition().then((resp) => {

      // resp.coords.latitude
      // resp.coords.longitude

      let coords = {
        latitude: resp.coords.latitude,
        longitude: resp.coords.longitude,
      };

      
      return coords;


    }).catch((error) => {
      
      console.log('Error getting position', error);
      return null;
    });

  }

  watchPosition() {

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
      
    });

  }

  getAccuracy(): Promise<any> {

    return this.geolocation.getCurrentPosition().then((resp) => {

      return JSON.stringify(resp.coords.accuracy);

    }).catch((error) => {

      console.log('Error getting location', error);
    })
  }

  isGpsLocationEnabled(){
  
   /*  let p = this.diagnostic.isLocationAvailable();
    p.then(function (available) {

      alert("Location is " + (available ? "available" : "not available"));
      return available ? true : false
      
    }).catch(function (error) {
      alert("The following error occurred: " + error);
    });

    return false; */
  } 

}
