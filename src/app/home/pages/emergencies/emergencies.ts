import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the EmergenciesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-emergencies',
  templateUrl: 'emergencies.html',
})
export class EmergenciesPage {


  emergencies = [{"title": "Emergenza cardiaca", "dist": "3000", "city": "Firenze", "address": "Piazza della Repubblica, 12", "desc": "Uomo in probabile arresto cardiaco"}, {"title": "Emergenza cardiaca", "dist": "3000", "city": "Firenze", "address": "Piazza della Repubblica, 12", "desc": "Uomo in probabile arresto cardiaco"}, {"title": "Emergenza cardiaca", "dist": "3000", "city": "Firenze", "address": "Piazza della Repubblica, 12", "desc": "Uomo in probabile arresto cardiaco"}];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

}
