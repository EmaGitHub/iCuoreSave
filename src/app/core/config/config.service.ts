import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http/src/response';
import { Injectable } from '@angular/core';
import { ApiService } from '@core/api';
import { DeviceService } from '@core/device';
import { LoggerService } from '@core/logger';
import { VersioningService } from '@core/versioning';
import { Storage } from '@ionic/storage';

import { Config } from './models/Config';
import { ConfigModuleOptions } from './models/ConfigModuleOptions';

const storageKeys = {
    lastConfig: 'last'
};

@Injectable()
export class ConfigService {
    private url: string = '';
    private config: Config | undefined;
    private storage: Storage;
    public initCompleted: Promise<any>;

    constructor(
        public options: ConfigModuleOptions,
        private http: HttpClient,
        private logger: LoggerService,
        private deviceService: DeviceService,
        private apiService: ApiService,
        private versioningService: VersioningService
    ) {
        this.storage = new Storage({
            name : options.storePrefix || 'storage',
            storeName: 'config',
            driverOrder : ['localstorage']
        });
        this.initCompleted = this.init(options);
    }

    /**
     * Returns the last config file stored in localStorage with last modified date
     * @returns {Promise<Config>}
     */
    private getLastConfig(): Promise<Config> {
        return this.storage.get(storageKeys.lastConfig)
    }

    /**
     * Download config file and init the app
     */
    private init(options: ConfigModuleOptions) {
        return new Promise<any>((resolve, reject) => {
            // If requested config is a remote one => download it
            if(options.remote){
                this.url = options.remote;
                this.download().then(
                    (config: Config) => {
                        this.initConfig(config);
                        resolve();
                    },
                    reject
                );
            }
            // Otherwise use the local one (if exists)
            else if(options.local){
                this.initConfig(options.local);
                resolve();
            }
            else {
                reject(new Error('NO_CONFIG_DEFINED'));
            }
        });
    }

    private initConfig(config: Config) {
        this.config = new Config(config);
        // Init the api service
        this.apiService.init(this.config.backend);
        // Update the logger service
        this.logger.changeLevel(this.config.loggerLevel);
        // Init the versioning service
        this.versioningService.setVersioning(this.config.versioning);
        this.storage.set(storageKeys.lastConfig, config);
    }

    /**
     * Download the external config file and store it in localStorage
     * @returns {Promise<Config>}
     */
    private download(): Promise<Config> {
        return new Promise<any>((resolve, reject) => {
            this.getLastConfig().then(
                lastConfig => {
                    if(this.deviceService.isOnline()){
                        // Try to download the new config file only if it was modified
                        let headers = new HttpHeaders().set('Content-Type', 'application/json');
                        if(lastConfig && lastConfig.lastModified){
                            //headers = headers.set('If-Modified-Since', lastConfig.lastModified);
                        }
                        this.http.get<Config>(`${this.url}?t=${new Date().getTime()}`, {headers, observe: 'response'}).subscribe(
                            (res: HttpResponse<Config>) => {
                                // If config.json was updated initialize it and update the lastModified property
                                (<Config>res.body).lastModified = <string>res.headers.get('Last-Modified');
                                resolve(res.body);
                            },
                            (err: HttpErrorResponse) => {
                                // If the HTTP call fails but I have a local config
                                // initialize it with localStorage version
                                if(lastConfig){
                                    resolve(lastConfig);
                                }
                                // The download fails and a local config doesn't exists, so throw an error
                                else {
                                    console.error(err);
                                    reject(new Error('ERR_APP_MISSING_CONFIG_FILE'));
                                }
                            });
                    }
                    // If the device is offline but I have a local config
                    // initialize it with localStorage version
                    else {
                        if(lastConfig){
                            resolve(lastConfig);
                        }
                        // The download fails and a local config doesn't exists, so throw an error
                        else {
                            reject(new Error('DEVICE_OFFLINE'));
                        }
                    }
                }
            );
        });
    }
}
