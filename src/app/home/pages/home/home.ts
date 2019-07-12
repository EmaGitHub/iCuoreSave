import { Component, ViewChild, OnInit } from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from "@angular/animations";
import { EmergenciesBlockComponent } from '@app/home/components/emergencies-block/emergencies-block';
import { UserService } from '@app/core/user';
import { StorageServiceProvider } from '../../../../providers/storage-service/storage-service';
import { GeolocationServiceProvider } from '../../../../providers/geolocation-service/geolocation-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  animations: [
    trigger('elementState', [
      state('transparent', style({
        top: '-150px',
        opacity: 0
      })),
      state('opaque', style({
        top: '55px',
        opacity: 1
      })),
      transition('opaque => transparent', animate('600ms ease-in')),
      transition('transparent => opaque', animate('600ms ease-out'))
    ]),
    trigger('elementStateFind', [
      state('transparent', style({
        top: '-100px ',
      })),
      state('opaque', style({
        top: '50px '
      })),
      transition('opaque => transparent', animate('600ms ease-in')),
      transition('transparent => opaque', animate('600ms ease-out'))
    ])
  ]
})

export class HomePage implements OnInit {

  @ViewChild('emergenciesBlock') ebc?: EmergenciesBlockComponent;

  constructor(
    private userService: UserService,
    private storageServiceProvider: StorageServiceProvider,
    private geolocationServiceProvider: GeolocationServiceProvider
  ) {

    if (HomePage.animForLogout) {
      this.state = "opaque";
      this.stateFind = "opaque";
    }
    else {
      this.state = "transparent";
      this.stateFind = "transparent";
    }
  }

  private state?: string;
  private stateFind?: string;
  static animForLogout: boolean = false;

  private animations = true;
  private beforeLogout = true;

  ngOnInit() {
    this.userService.userDataObservable$.subscribe((userData) => {
      this.checkIfLogged();
    });

    this.storageServiceProvider.getFromStorage('animations').subscribe((val) => {
      if (val) {
        var boolValue = val.toLowerCase() == 'true' ? true : false;
        this.animations = boolValue;
      }
    });
  }

  ngAfterViewInit() {

    if (HomePage.animForLogout) this.animationForLogout();
    else this.checkIfLogged();
  }

  makeOpaque() {
    this.state = "opaque";
    this.stateFind = "opaque";
  }

  makeTransparent() {
    this.state = 'transparent';
    this.stateFind = "transparent"
  }

  checkIfLogged() {

    if (this.userService.isLogged()) {

      setTimeout(() => {
        this.beforeLogout = true;
        this.makeOpaque();
      }, 300);
    }
    else {
      this.beforeLogout = false;
    }
  }

  animationForLogout() {
    setTimeout(() => {
      this.makeTransparent();
    }, 300);
    HomePage.animForLogout = false;
  }
}
