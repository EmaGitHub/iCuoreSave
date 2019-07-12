import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { DaeServiceProvider } from '../../../../providers/dae-service/dae-service';
import { Platform, Content } from 'ionic-angular';
import { DeviceService } from '@app/core/device';

/**
 * Generated class for the ListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'list',
  templateUrl: 'list.html'
})
export class ListComponent implements OnInit{

  @ViewChild(Content) content?: Content;
  hideEnabled: boolean = false;
  lastScrollValue: any;

  daes: any=[];

  constructor(
    private platform: Platform,
    private deviceService: DeviceService,
    private daeService: DaeServiceProvider,
    private zone: NgZone) {

    
  }

  ionViewWillEnter() {
    /* FindDaePage.state = 'opaque';
    FindDaePage.triggered= false;  */
    
  }

  ngOnInit() {

    //Se si tratta di applicazione Cordova avvia configurazione posizione
    if (this.platform.is('cordova')) {
        if(!this.deviceService.isOnline()) {    //se non c'è connessione non viene fatto niente
            this.deviceService.showToast("Please, connect to internet");
        }
        //else daeService.initLocation();
    }
    
    //Altrimenti uso posizione di test
    else {
        let region = {
            minLat : 43.77132810454115 ,
            minLng : 11.232320601387626,
            maxLat : 43.785717229767045,
            maxLng : 11.252249596585349
        }
        /* this.daeService.updateDAESList(region).then(() => {
  
            this.daes = this.daeService.getDaes();
        }); */
    }
  }

  ngAfterViewInit() {

    this.content!.ionScroll.subscribe(() => {

        let currentScroll = this.content!.scrollTop;
        this.zone.run(() => {
            if (currentScroll > 50) {
                this.hideEnabled = true;
            } else {
                this.hideEnabled = false;
            }

            /* if (currentScroll > this.lastScrollValue && this.hideEnabled == true) {
                FindDaePage.makeTransparent();
        }
            else if (currentScroll < this.lastScrollValue && this.hideEnabled == true) 
                FindDaePage.makeOpaque(); */

            this.lastScrollValue = currentScroll;
        })
    });
}


}
