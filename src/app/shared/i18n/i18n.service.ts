import 'moment/min/locales';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http/src/response';
import { Injectable, Optional } from '@angular/core';
import { DeviceService } from '@core/device/device.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import * as Moment from 'moment';

import { I18n } from './models/I18n';
import { I18nModuleOptions } from './models/I18nModuleOptions';
import { Language } from './models/Language';

const storageKeys = {
    i18n: 'i18n',
    lastLang: 'last_lang',
    lang: 'lang_{CODE}'
};

@Injectable()
export class I18nService {
    private url: string = '';
    private i18n: I18n | undefined;
    private storage: Storage;
    public initCompleted: Promise<any>;

    constructor(
        @Optional() public options: I18nModuleOptions,
        private deviceService: DeviceService,
        private translateService: TranslateService,
        private http: HttpClient
    ) {
        this.storage = new Storage({
            name : options.storePrefix || 'storage',
            storeName : 'i18n',
            driverOrder : ['localstorage']
        });
        this.initCompleted = this.init(options);
    }

    public Moment = Moment;

    /**
     * Returns the last i18n file stored in localStorage with last modified date
     * @returns {Promise<I18n>}
     */
    private getLastI18n(): Promise<I18n> {
        return this.storage.get(storageKeys.i18n)
    }

    /**
     * Download the i18n config file and init default language
     */
    private init(options: I18nModuleOptions) {
        return new Promise<any>((resolve, reject) => {
            // If requested i18n is a remote one => download it
            if(options.remote){
                this.url = options.remote;
                this.download().then(
                    (i18n: I18n) => {
                        this.initI18N(i18n);
                        // Init default i18n and download all other languages
                        this.initLangs().then(
                            resolve,
                            reject
                        );
                    },
                    reject
                );
            }
            // Otherwise use the local one (if exists)
            else if(options.local && options.local.i18n && options.local.langs){
                this.initI18N(options.local.i18n);
                // Init default i18n and store all other languages
                this.initLocalLangs(options.local.langs).then(
                    resolve,
                    reject
                );
            }
            else {
                reject(new Error('NO_I18N_CONFIG_DEFINED'));
            }
        });
    }

    /**
     * Init the i18n config
     * @returns {Promise<any>}
     */
    private initI18N(i18n: I18n): void {
        // Create the I18n
        this.i18n = new I18n(i18n);
        // Save i18n in storage
        this.storage.set(storageKeys.i18n, i18n);
    }

    /**
     * Download the external i18n config file and store it in localStorage
     * @returns {Promise<any>}
     */
    private download(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.getLastI18n().then(
                lastI18n => {
                    if(this.deviceService.isOnline()){
                        // Try to download the new i18n config file only if it was modified
                        let headers = new HttpHeaders().set('Content-Type', 'application/json');
                        if(lastI18n && lastI18n.lastModified){
                            //headers = headers.set('If-Modified-Since', lastI18n.lastModified);
                        }
                        this.http.get<I18n>(`${this.url}?t=${new Date().getTime()}`, {headers, observe: 'response'}).subscribe(
                            (res: HttpResponse<I18n>) => {
                                // If i18n json was modified, update the lastModified property
                                (<I18n>res.body).lastModified = <string>res.headers.get('Last-Modified');
                                resolve(res.body);
                            },
                            (err: HttpErrorResponse) => {
                                // If the HTTP call fails but I have a local I18n
                                // initialize it with localStorage version
                                if(lastI18n){
                                    resolve(lastI18n);
                                }
                                // The download fails and a local i18n config doesn't exists, so throw an error
                                else {
                                    console.error(err);
                                    reject(new Error('ERR_MISSING_I18N_CONFIG_FILE'));
                                }
                            });
                    }
                    // If the device is offline but I have a local I18n
                    // initialize it with localStorage version
                    else {
                        if(lastI18n){
                            resolve(lastI18n);
                        }
                        // The download fails and a local i18n config doesn't exists, so throw an error
                        else {
                            reject(new Error('DEVICE_OFFLINE'));
                        }
                    }
                }
            );
        });
    }

    /**
    * Set default (fallback) language
    * Download all remote language files and store them in LocalStorage
    * @returns {Promise<any>}
    */
    private initLangs(): Promise<any> {
        return new Promise((resolve, reject) => {
            // Set the default language
            this.setDefaultLanguage();
            // Get the last used language if exists, or system one, or default one
            this.getLastLanguage().then(
                (lastLang: Language) => {
                    // Set the main language as default
                    // The CustomTranslateLoader will automatically download the json language
                    this.setLanguage(lastLang, true);
                    // Resolve the promise
                    resolve();
                    // And start to download for other languages (background mode)
                    const otherLanguages = (<I18n>this.i18n).langs.filter((l: Language) => {
                        return l.code !== lastLang.code;
                    });
                    this.downloadLangs(otherLanguages);
                },
                reject
            );
        });
    }

    /**
    * Set default (fallback) language
    * Use the local language files and store them in LocalStorage
    * @returns {Promise<any>}
    */
    private initLocalLangs(langs: Language[]): Promise<any> {
        return new Promise((resolve, reject) => {
            (this.i18n as I18n).langs.forEach((lang: Language) => {
                if(langs[lang.code as any]){
                    lang.translations = langs[lang.code as any];
                    this.translateService.setTranslation(lang.code, lang.translations);
                    this.storage.set(storageKeys.lang.replace('{CODE}', lang.code), lang);
                }
            });
            // Set the default language
            this.setDefaultLanguage();
            // Get the last used language if exists, or system one, or default one
            this.getLastLanguage().then(
                (lastLang: Language) => {
                    // Set the main language as default
                    // The CustomTranslateLoader will automatically download the json language
                    this.setLanguage(lastLang, true);
                    // Resolve the promise
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get the last used language if exists
     * If there is no last language set fetch the system language or defaut one if not available
     *
     * @returns {Promise<Language>}
     */
    private getLastLanguage(): Promise<Language> {
        return new Promise((resolve, reject) => {
            // Search last used language in localStorage
            this.storage.get(storageKeys.lastLang).then((lastLang: Language) => {
                // If last used language doesn't exists or the last used language was automatically set
                if(!lastLang || lastLang.isAutomatic){
                    // Get the system language
                    this.deviceService.getPreferredLanguage().then((systemLang: string) => {
                        // Search the system language in available languages
                        let lang = (<I18n>this.i18n).getConfig(systemLang);
                        // If lang doesn't exist
                        if(!lang){
                            // Get the default language from Config
                            lang = (<I18n>this.i18n).getDefault();
                        }
                        resolve(lang);
                    })
                }
                else {
                    resolve(lastLang);
                }
            });
        });
    }

    /**
     * Set the default language as fallback when a translation isn't found in the current language
     * @param  {Language} lang Language to set as default
     * @returns {void}
     */
    private setDefaultLanguage(): void {
        const lang = (<I18n>this.i18n).getDefault();
        Moment.locale(lang.code);
        this.translateService.setDefaultLang(lang.code);
    }

    /**
     * @param  {Language[]} langs
     * @returns Promise
     */
    private downloadLangs(langs: Language[]): Promise<any> {
        return new Promise((resolve, reject) => {
            if(langs.length > 0){
                let lang = langs.pop();
                this.downloadLang(<Language>lang).then(
                    () => {
                        this.downloadLangs(langs);
                    },
                    () => {
                        this.downloadLangs(langs);
                    }
                );
            }
            else {
                resolve();
            }
        });
    }

    /**
     * Download the json of requested language
     * @param  {Language|string} lang Language or code of lang to download
     * @returns {Promise}
     */
    downloadLang(lang: Language|string): Promise<any> {
        if(typeof lang === 'string'){
            lang = <Language>(<I18n>this.i18n).getConfig(lang);
        }
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        // If the lang file was already downloaded append the 'If-Modified-Since' header
        if(lang && lang.lastModified){
            //headers = headers.set('If-Modified-Since', lang.lastModified);
        }
        return new Promise((resolve, reject) => {
            if(this.deviceService.isOnline()){
                this.http.get<object>(`${(<Language>lang).url}?t=${new Date().getTime()}`, {headers, observe: 'response'}).subscribe(
                    (res: HttpResponse<object>) => {
                        (<Language>lang).lastModified = <string>res.headers.get('Last-Modified');
                        (<Language>lang).translations = res.body;
                        this.storage.set(storageKeys.lang.replace('{CODE}', (<Language>lang).code), lang);
                        resolve(lang);
                    },
                    (err: HttpErrorResponse) => {
                        // If the HTTP call fails but I have a local language
                        // initialize it with localStorage version
                        this.getLanguage(<Language>lang).then(
                            (lang: Language|null) => {
                                if(lang !== null){
                                    resolve(lang);
                                }
                                // The download fails and a local language doesn't exists, so throw an error
                                else {
                                    console.error(err);
                                    reject(new Error('ERR_MISSING_LANG_FILE'));
                                }
                            }
                        );
                    });
            }
            // If the device is offline but I have a local language
            // initialize it with localStorage version
            else {
                this.getLanguage(<Language>lang).then(
                    (lang: Language|null) => {
                        if(lang !== null){
                            resolve(lang);
                        }
                        // The download fails and a local language doesn't exists, so throw an error
                        else {
                            reject(new Error('DEVICE_OFFLINE'));
                        }
                    }
                );
            }
        });
    }

    /**
     * Get the current used language
     * @returns {Language}
     */
    getCurrentLanguage(): Language | undefined {
        return (<I18n>this.i18n).getConfig(this.translateService.currentLang);
    }

    /**
     * Get the default language
     * @returns {Language}
     */
    getDefaultLanguage(): Language | undefined {
        return (<I18n>this.i18n).getConfig(this.translateService.getDefaultLang());
    }

    /**
     * Set the last used language for the next app bootstrap
     * @param  {Language} lang Language to set as last
     * @param  {boolean} automatic If false or undefined the selection request is made by user, if true is automatic
     * @returns {void}
     */
    setLanguage(lang: Language|string, automatic: boolean = false): void {
        if(typeof lang === 'string'){
            lang = <Language>(<I18n>this.i18n).getConfig(lang);
        }
        if(lang){
            if(!automatic){
                lang.isAutomatic = false;
            }

            Moment.locale(lang.code, {});
            this.storage.set(storageKeys.lastLang, lang);
            this.translateService.use(lang.code);
        }
    }

    /**
     * Get the language with its translations from storage, if exists
     * @param  {Language} lang Language to set as last
     * @returns {void}
     */
    public getLanguage(lang: Language): Promise<Language|null> {
        return this.storage.get(storageKeys.lang.replace('{CODE}', lang.code));
    }

    /**
     * Get the list of all available languages
     */
    getAllLanguages() {
        return (<I18n>this.i18n).langs;
    }

    /**
     * @param  {string} key
     * @returns string
     */
    translate(key: string): string {
        return this.translateService.instant(key);
    }

    onLangChange$ = this.translateService.onLangChange

}
