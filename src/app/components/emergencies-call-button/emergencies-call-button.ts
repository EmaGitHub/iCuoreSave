import { Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

/**
 * Generated class for the EmergenciesCallButtonComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'emergencies-call-button',
  templateUrl: 'emergencies-call-button.html'
})
export class EmergenciesCallButtonComponent {

  constructor(private callNumber: CallNumber) {
  }

  callRescue() {

    
    this.callNumber.callNumber("118", true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

}
