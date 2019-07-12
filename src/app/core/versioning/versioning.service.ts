import { Injectable } from '@angular/core';
import { DeviceService } from '@core/device';
import { LoggerService } from '@core/logger';
import { AppVersion } from '@ionic-native/app-version';
import { find } from 'lodash';
import Semver from 'semver';

import { Versioning } from './models/Versioning';

@Injectable()
export class VersioningService {
    private versioning: Versioning[] = [];

    constructor(
        private logger: LoggerService,
        private deviceService: DeviceService,
        private appVersion: AppVersion
    ) { }

    /**
     * Init the module with the remote conf
     * @param  {Versioning[]} versioning
     * @returns void
     */
    public setVersioning(versioning: Versioning[]): void {
        this.versioning = versioning;
    }

    /**
     * Get the installed app version for
     * @return {Promise<string>}
     * @public
     */
    public getAppVersion(): Promise<string> {
        return new Promise((resolve, reject) => {
            // Se sto girando su device recupero la versione utilizzando il plugin nativo
            if (this.deviceService.isCordova()) {
                this.appVersion.getVersionNumber().then((version: string) => {
                    resolve(version);
                });
            }
            else {
                resolve('x.x.x');
            }
        });
    }

    /**
     * Check if the installed app is the available last version
     * @param configLastVersion the last version available (declared on the remote conf)
     * @return {Promise<boolean>}
     * @private
     */
    private isLastVersion(configLastVersion: string) : Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getAppVersion().then((appVersion: string) => {
                if (
                    Semver.valid(configLastVersion) &&
                    Semver.valid(appVersion as string)
                ) {
                    resolve(Semver.lte(configLastVersion, appVersion as string));
                }
                else {
                    reject(new Error('Versioning.isLastVersion app version not checked'));
                }
            });
        });
    }

    /**
     * Check the conditions app update
     * @return {Promise<any>}
     * @private
     */
    public checkVersioning(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.deviceService.isCordova()) {
                let platform = this.deviceService.getOS().toLowerCase();
                let platformVersioning = find(this.versioning, { platform : platform });
                if(platformVersioning){
                    this.isLastVersion(platformVersioning.lastVersion).then(
                        (isLastVersion : boolean) => {
                            // Se non è l'ultima versione disponibile
                            if (isLastVersion === false) {
                                const storeLink = (platformVersioning as Versioning).storeLink;
                                // Verifico se l'aggiornamento è obbligatorio
                                // e in tal caso mostro un alert e vado allo storeLink
                                if ((platformVersioning as Versioning).isMandatoryUpdate) {
                                    this.logger.debug(`App mandatory update ${platform}`);
                                    return this.mandatoryUpdate(storeLink);
                                }
                                else {
                                    // Se invece l'aggiornamento non è obbligatorio mostro una richiesta di aggiornamento
                                    // che può essere anche ignorata dall'utente
                                    this.logger.debug(`App optional update ${platform}`);
                                    return this.askUserConfirm(storeLink);
                                }
                            }
                            else {
                                this.logger.debug('App alredy update');
                                resolve();
                            }
                        },
                        reject
                    );
                }
                else {
                    this.logger.debug(`No versioning details for ${platform} platform`);
                    resolve();
                }
            }
            else {
                this.logger.debug('Bypass checkVersioning browser platform');
                resolve();
            }
        });
    }

    /**
     * Redirect app on store link for download and update the app
     * @param storeLink
     * @return {Promise<any>}
     * @private
     */
    private mandatoryUpdate(storeLink: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.deviceService.alert(
                'NEW_APP_VERSION_AVAILABLE_MANDATORY_UPDATE',
                {
                    handler: () => {
                        window.open(storeLink, '_system');
                        reject(new Error('UPDATING'));
                    },
                    title: 'APP_MANDATORY_UPDATE'
                }
            );
        })
    }

    /**
     * Ask to the user to update the app
     * @param storeLink
     * @return {Promise<any>}
     * @private
     */
    private askUserConfirm(storeLink: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.deviceService.confirm(
                'NEW_APP_VERSION_AVAILABLE',
                {
                    title: 'APP_UPDATE_AVAILABLE',
                    buttons: [
                        {
                            text : 'UPDATE',
                            handler : () => {
                                window.open(
                                    storeLink,
                                    '_system'
                                );
                                reject(new Error('UPDATING'));
                            }
                        },
                        {
                            text : 'NOT_UPDATE',
                            handler: () => {
                                resolve();
                            }
                        }
                    ]
                }
            );
        });
    }
}