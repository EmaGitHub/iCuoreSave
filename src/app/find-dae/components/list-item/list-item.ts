import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { DaeDetailPage } from '../../pages/dae-detail/dae-detail';

/**
 * Generated class for the ListItemComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'list-item',
  templateUrl: 'list-item.html'
})
export class ListItemComponent implements OnInit {

  @Input()dae: any;

  constructor(private modalCtrl: ModalController,
              private navCtrl: NavController) {

  }

  ngOnInit() {

    let length = parseInt(this.dae._distanza).toString().length;
    if(length >= 4){ 
      let dist = (parseInt(this.dae._distanza)).toString(); 
      this.dae._distanza = dist.slice(0, length-3) + ((dist.slice(0, length-3)=='1')? ' chilometro' : ' chilometri' );
    }
    else this.dae._distanza = parseInt(this.dae._distanza).toString() + ' metri';
  }

  navigateToDaeDetail() {

    /* let myModal = this.modalCtrl.create( DaeDetailPage, {
      data: this.dae,
    });    
    myModal.present(); */
    this.navCtrl.push(DaeDetailPage, {data: this.dae}, {animate: true});
  }

}
