import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { IonicModule } from 'ionic-angular';
import {SettingsPage} from './pages/settings/settings';
import { ComponentsModule } from '@app/components/components.module';
import { LanguagesPopover } from './pages/languages-popover/languages-popover';

@NgModule({
    declarations: [

        // Components
        LanguagesPopover,

        // Pages list
        SettingsPage,
    ],
    imports: [
        IonicModule,
        SharedModule,
        ComponentsModule
    ],
    entryComponents : [

        // Components
        LanguagesPopover,

        // Pages list
        SettingsPage,
    ]
})
export class SettingsModule { }
