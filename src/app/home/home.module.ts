import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { IonicModule } from 'ionic-angular';

import { HomePage } from './pages/home/home';
import { ComponentsModule } from '@app/components/components.module';
import { DaeBlockComponent } from './components/dae-block/dae-block';
import { EmergenciesBlockComponent } from './components/emergencies-block/emergencies-block';
import { InfoBlockComponent } from './components/info-block/info-block';

@NgModule({
    declarations: [

        // Components
        DaeBlockComponent,
        EmergenciesBlockComponent,
        InfoBlockComponent,

        // Pages list
        HomePage
        
    ],
    imports: [
        IonicModule,
        SharedModule,  
        ComponentsModule,
    ],
    entryComponents : [

        // Components
        DaeBlockComponent,
        EmergenciesBlockComponent,
        InfoBlockComponent,

        // Pages list
        HomePage

    ]
})
export class HomeModule { }
