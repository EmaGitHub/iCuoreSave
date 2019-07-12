import { Component, Input, OnInit, Injectable, Output, EventEmitter, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/core'; 
import { NavController, Navbar } from 'ionic-angular';

/**
 * Generated class for the NavbarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'navbar',
  templateUrl: 'navbar.html',
  animations: [
    trigger('elementState', [
      state('transparent', style({
        top: '-10vh'
       
      })),
      state('opaque', style({
        top: 0
      })),
      transition('opaque => transparent', animate('500ms ease-in')),
      transition('transparent => opaque', animate('500ms ease-out'))
    ])
  ]
})

export class NavbarComponent implements OnInit {

  @Input('page') page!: string;
  @ViewChild(Navbar) navBar?: Navbar;

  title:string='';
  menu:boolean= true;
  back:boolean= false;

  //Observable to back
  @Output() backEvent : EventEmitter<any> = new EventEmitter<any>();

  @Input('state') state: string = 'opaque';

  constructor(private navCtrl: NavController) {

  }

  onViewDidLoad() {
    this.navBar!.backButtonClick = (e:UIEvent)=>{
      console.log("back")
      this.navCtrl.pop({animate: true});
    }
  }

  goBack() {

    if(this.page === 'EMERGENCY' || this.page === 'DAE_DETAILS')   //for avoid pop animation
        this.backEvent.emit();
    else 
        this.navCtrl.pop();
  }

  ngOnInit() {

    if( this.page === 'DAE_DETAILS' || this.page === 'EMERGENCY' ) {
      this.menu = false;
      this.back = true;
    }
    else this.menu = true;
  }

}
