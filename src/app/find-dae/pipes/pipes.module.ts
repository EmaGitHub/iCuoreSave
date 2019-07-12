import { NgModule } from '@angular/core';
import { AvailabilityPipe } from './availability/availability';
@NgModule({
	declarations: [AvailabilityPipe],
	imports: [],
	exports: [AvailabilityPipe]
})
export class PipesModule {}
