import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { IonicModule } from 'ionic-angular';
import { FindDaePage } from './pages/find-dae/find-dae';
import { ListItemComponent } from './components/list-item/list-item';
import { DaeDetailPage } from './pages/dae-detail/dae-detail';
import { PipesModule } from './pipes/pipes.module';
import { ComponentsModule } from '@app/components/components.module';

@NgModule({
    declarations: [

        // Components
        ListItemComponent,

        // Pages list
        FindDaePage,
        DaeDetailPage

        ],
    imports: [
        IonicModule,
        SharedModule,
        PipesModule,
        ComponentsModule
    ],
    entryComponents : [

        // Components
        ListItemComponent,

        // Pages list
        FindDaePage,
        DaeDetailPage
    ]
})
export class FindDaeModule { }
