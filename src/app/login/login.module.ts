import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { LoginPage } from './pages/login/login';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { ComponentsModule } from '@app/components/components.module';
import { OverlaidSquareComponent } from './components/overlaid-square/overlaid-square';
import { BlankPage } from './pages/blank-page/blank-page';

@NgModule({
    declarations: [

        // Components
        OverlaidSquareComponent,

        // Pages list
        LoginPage,
        BlankPage
        
    ],
    imports: [
        IonicModule,
        ComponentsModule
    ],
    entryComponents : [

        // Components
        OverlaidSquareComponent,

        // Pages list
        LoginPage,
        BlankPage
    ],
    providers: [
        QRScanner    
]
})
export class LoginModule { }
