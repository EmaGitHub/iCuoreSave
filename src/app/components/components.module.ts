import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { NavbarComponent } from './navbar/navbar';
import { TranslateModule } from '@ngx-translate/core';
import { EmergenciesCallButtonComponent } from './emergencies-call-button/emergencies-call-button';

@NgModule({
	declarations: [
		NavbarComponent,
		EmergenciesCallButtonComponent
],
	imports: [
		IonicModule,
		TranslateModule
	],
	exports: [
		NavbarComponent,
		EmergenciesCallButtonComponent
	],
	providers: [
		
	]
})
export class ComponentsModule {}
