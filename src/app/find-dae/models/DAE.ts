export class DAE {
    

    constructor(
        private _id: string, 
        private _available: boolean,
        private _comune: string,
        private _descrizione: string,
        private _indirizzo: string,
        private _lat: number,
        private _lng: number,
        private _distanza: any) {}

        get lat(){
            return this._lat;
        }
        get lng(){
            return this._lng;
        }
        get desc(){
            return this._descrizione;
        }
        get id(){
            return this._id;
        }
}