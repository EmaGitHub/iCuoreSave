import { enableProdMode } from '@angular/core';
import { ENV } from '@env';

import { AppModule } from './app.module';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import './polyfills';

if(ENV.productionMode){
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
