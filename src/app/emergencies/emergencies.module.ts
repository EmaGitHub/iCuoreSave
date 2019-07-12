import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SharedModule } from '@shared/shared.module';
import { EmergencyComponent } from './components/emergency/emergency';
import { EmergenciesPage } from './pages/emergencies/emergencies';
import { ComponentsModule } from '@app/components/components.module';
import { EmergencyDetailPage } from './pages/emergency-detail/emergency-detail';

@NgModule({
    declarations: [

        // Components
        EmergencyComponent,

        // Pages list
        EmergenciesPage,
        EmergencyDetailPage
        
        
    ],
    imports: [
        IonicModule,
        SharedModule,
        ComponentsModule
    ],
    entryComponents : [

        // Components
        EmergencyComponent,

        // Pages list
        EmergenciesPage,
        EmergencyDetailPage

    ]
})
export class EmergenciesModule { }
