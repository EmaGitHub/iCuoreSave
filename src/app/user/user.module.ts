import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { UserPage } from './pages/user/user';
import { ComponentsModule } from '@app/components/components.module';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
    declarations: [

        // Components

        // Pages list
        UserPage,
        
    ],
    imports: [
        IonicModule,
        ComponentsModule,
        SharedModule
    ],
    entryComponents : [

        // Components

        // Pages list
        UserPage,
    ]

})
export class UserModule { }
