import { Component } from '@angular/core';
import { UserService, User } from '@app/core/user';
import { SHA256 } from 'crypto-js';

/**
 * Generated class for the UserComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'user',
  templateUrl: 'user.html'
})
export class UserPage {

  user?: User;

  constructor(
    private userService: UserService
  ) {

    this.user = this.userService.getUser();
  }

  get avatarUrl() {
    return `https://avatars.dicebear.com/v2/identicon/${SHA256(this.user!.codFiscale!)}.svg`;
}

get showResidence() {
    return !!this.checkAddressObj(this.user!.residenza);
}

get showDomicile() {
    return !!this.checkAddressObj(this.user!.domicilio);
}

checkAddressObj(address: any) {
    if( address )
    return address && (address.via || address.codComune || address.codProvincia || address.cap);
}

}
