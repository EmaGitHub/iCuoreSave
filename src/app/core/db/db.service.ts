import { Injectable } from '@angular/core';
import { DeviceService } from '@core/device';
import LokiJS, { Collection } from 'lokijs';

import { DBModuleOptions } from './models/DBModuleOptions';
import { LokiConfigOptions } from './models/LokiConfigOptions';

declare var require: any;
var LokiIndexedAdapter = require('./loki-indexed-adapter');

@Injectable()
export class DBService {
    private dbName: string = '';
    private db: LokiJS|null = null;
    public initCompleted: Promise<any>;

    constructor(
        public options: DBModuleOptions,
        private deviceService: DeviceService
    ) {
        const DB = this;
        DB.dbName = options.dbName;
        let lokiConfig = new LokiConfigOptions({
            autosave: false,
            autoload: false,
            verbose: true,
            env: 'BROWSER',
            persistenceMethod: 'localStorage'
        });
        this.initCompleted = new Promise((resolve, reject) => {
            if (this.deviceService.isCordova()) {
                document.addEventListener('deviceready', () => {
                    DB.initLokiDB(lokiConfig).then(resolve, reject);
                }, true);
            }
            else {
                DB.initLokiDB(lokiConfig).then(resolve, reject);
            }
        });
    }

    /**
     * Create new LokiJS db
     * If the app runs on browser it persists data on localStorage
     * while in a real device it persists data on file system,
     * using the LokiCordovaFSAdapter and the cordova-plugin-file
     * @param  {string} dbName
     * @param  {Partial<LokiConfigOptions>} lokiOptions?
     */
    createLokiDB(dbName:string, lokiOptions?: Partial<LokiConfigOptions>): LokiJS {

        lokiOptions = new LokiConfigOptions(lokiOptions);

        if (!lokiOptions.adapter) {
            lokiOptions.adapter = new LokiIndexedAdapter(dbName, { closeAfterSave: true });
        }

        return new LokiJS(dbName, lokiOptions);
    }

    /**
     * Get the collection from its name,
     * or, if not exists, create it and returns
     * @param  {string} name
     */
    getOrCreateCollection(name: string): Collection{
        let newCollection = (this.db as LokiJS).getCollection(name);
        if (newCollection === null) {
            newCollection = this.createCollection(name);
        }
        return newCollection;
    }

    /**
     * Create a new collection form name and return it
     * @param  {string} name
     */
    createCollection(name: string): Collection{
        return (this.db as LokiJS).addCollection(name);
    }

    /**
     * Create and load the LokiJS database
     * @returns Promise
     */
    initLokiDB(lokiOptions?: Partial<LokiConfigOptions>): Promise<LokiJS>{
        return new Promise((resolve, reject) => {

            // Create a LokiJS DB
            this.db = this.createLokiDB(this.dbName, lokiOptions);

            // Define options for LokiDB load
            let options = {};

            // Load database
            this.db.loadDatabase(options, (data: any) => {
                if(data instanceof Error){
                    reject(data);
                }
                else {
                    resolve(<LokiJS>this.db);
                }
            });
        });
    }

    getDB(): LokiJS{
        return <LokiJS>this.db;
    }

    saveDB() {
        if(this.db){
            this.db.saveDatabase();
        }
    }
}
