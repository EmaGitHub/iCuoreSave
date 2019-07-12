import { Component, Input, OnInit } from '@angular/core';

import { I18nService } from '@app/shared/i18n';
import { ViewController, NavParams } from 'ionic-angular';
import { DeviceService } from '@app/core/device';

@Component({
    selector: 'languages-popover',
    templateUrl: 'languages-popover.html'
})
export class LanguagesPopover implements OnInit {

    ENactive!: boolean;
    ITactive!: boolean;


    constructor(
        private i18nService: I18nService,
        private viewController: ViewController,
        private params: NavParams,
        private deviceService: DeviceService
    ){

    }

    ngOnInit() {
        
        if(this.params.get('currentLanguage') == 'English'){
            this.ENactive = true;
            this.ITactive = false;
        }
        else {
            this.ENactive = false;
            this.ITactive = true;
        }
    }

    langIT(){
        this.deviceService.showLoading();
        let langs = this.i18nService.getAllLanguages();
        this.i18nService.setLanguage(langs[0]);
        this.ENactive = false;
        this.ITactive = true;
    }

    langEN(){
        this.deviceService.showLoading();
        let langs = this.i18nService.getAllLanguages();
        this.i18nService.setLanguage(langs[1]);
        this.ENactive = true;
        this.ITactive = false;
    }

    close(){
        this.viewController.dismiss();
    }
}
