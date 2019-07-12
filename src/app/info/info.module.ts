import { InfoPage } from "./pages/info/info";
import { NgModule } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { ComponentsModule } from "@app/components/components.module";

@NgModule({
    declarations: [

        // Components

        // Pages list
        InfoPage,
        
    ],
    imports: [
        IonicModule,
        ComponentsModule
    ],
    entryComponents : [

        // Components

        // Pages list
        InfoPage,
    ]
})
export class InfoModule { }