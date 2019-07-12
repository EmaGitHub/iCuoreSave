import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageServiceProvider } from '../../../../providers/storage-service/storage-service';
import { AuthService } from '@app/core/auth';
import { UserService } from '@app/core/user';

/**
 * Generated class for the InfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-info',
  templateUrl: 'info.html',
})
export class InfoPage {

jwt : string|null = "";
key:string = "";
value:string = "";
store:string = "";

userInfo: string = "";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private storageService: StorageServiceProvider,
              private userService: UserService) {
  }

  ionViewDidLoad() {}

    submit(){
      this.storageService.putInStorage(this.key, this.value);
    }
    get(){
      this.storageService.getFromStorage(this.key).subscribe((val:string) => {
        this.store = val;
      });
    }

}
