import { Injector } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Language } from './i18n.model';
import { I18nService } from './i18n.service';

export class CustomTranslateLoader implements TranslateLoader {

    constructor(
        private injector: Injector
    ){ }

    getTranslation(lang: string): Observable<any> {

        return Observable.create((observer: Observer<any>) => {

            this.injector.get(I18nService).downloadLang(lang).then(
                (res: Language) => {
                    observer.next(res.translations);
                    observer.complete();
                },
                (err: Error) => {
                    observer.next({});
                    observer.complete();
                }
            )
        });
    }
}
