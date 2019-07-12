import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { DeviceService } from '@app/core/device';


/*
  Generated class for the StorageServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageServiceProvider {

  constructor(
              private deviceService: DeviceService,
              private storage: Storage) {}

  putInStorage(key: string, value: string) {

    this.storage.set(key, value);
  }

  getFromStorage(key: string): Observable<string> {

    return Observable.fromPromise(
      this.storage.get(key).then((val) => {
        //if(!this.deviceService.isCordova() && key == 'jwt') return 'fake JWT';
        return val;
      })
    )
     
  }

}
