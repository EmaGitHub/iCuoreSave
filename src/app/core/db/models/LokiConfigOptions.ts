
export class LokiConfigOptions {
    public env: 'NODEJS' | 'BROWSER' | 'CORDOVA' = 'CORDOVA';
    public adapter = null;
    public autoload: boolean = false;
    public autoloadCallback: (err: any) => void = () => {};
    public autosave: boolean = false;
    public autosaveCallback: (err?: any) => void = () => {};
    public autosaveInterval: string | number = 5000;
    public persistenceMethod: 'fs' | 'localStorage' | 'memory' | null = null;
    public destructureDelimiter: string = '$<\n';
    public serializationMethod: 'normal' | 'pretty' | 'destructured' | null = 'normal';
    public throttledSaves: boolean = true;
    public verbose: boolean = false;

    // Default values read from 'https://github.com/techfort/LokiJS/blob/master/src/lokijs.js'
    constructor(
        options?: Partial<LokiConfigOptions>
    ){
        if(options){
            if(options.env) this.env = options.env;
            if(options.adapter) this.adapter = options.adapter;
            if(options.autoload) this.autoload = options.autoload;
            if(options.autoloadCallback) this.autoloadCallback = options.autoloadCallback;
            if(options.autosave) this.autosave = options.autosave;
            if(options.autosaveCallback) this.autosaveCallback = options.autosaveCallback;
            if(options.autosaveInterval) this.autosaveInterval = options.autosaveInterval;
            if(options.persistenceMethod) this.persistenceMethod = options.persistenceMethod;
            if(options.destructureDelimiter) this.destructureDelimiter = options.destructureDelimiter;
            if(options.serializationMethod) this.serializationMethod = options.serializationMethod;
            if(options.throttledSaves) this.throttledSaves = options.throttledSaves;
            if(options.verbose) this.verbose = options.verbose;
        }
    }
}
