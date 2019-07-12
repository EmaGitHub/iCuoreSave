import { PerformerRoles } from './PerformerRoles';
import { UserAddress } from './UserAddress';
import { UserCertificate } from './UserCertificate';
import { UserRole } from './UserRole';

export class User {
    private _isLogged: boolean = false;
    private _isPerformer: boolean = false;

    public id?: string;
    public nome?: string;
    public cognome?: string;
    public codFiscale?: string;
    // public exp?: number;
    // public iat?: number;
    // public iss?: string;
    // public sub?: string;
    public email?: string;
    public telefono?: string;
    public pec?: string;
    public photoRef?: string;
    public residenza?: UserAddress;
    public domicilio?: UserAddress;
    public ruoloUtenteList?: UserRole[];
    public esecutore?: UserCertificate;
    public istruttore?: UserCertificate;

    constructor (
        user?: Partial<User>
    ){
        if(user) {
            this.id = user.id;
            this.nome = user.nome;
            this.cognome = user.cognome;
            this.codFiscale = user.codFiscale;
            // this.exp = user.exp;
            // this.iat = user.iat;
            // this.iss = user.iss;
            // this.sub = user.sub;
            this.email = user.email;
            this.telefono = user.telefono;
            this.pec = user.pec;
            this.photoRef = user.photoRef;
            this.residenza = user.residenza;
            this.domicilio = user.domicilio;
            this.ruoloUtenteList = user.ruoloUtenteList || [];
            this.esecutore = user.esecutore;
            this.istruttore = user.istruttore;
            this._isLogged = user.id !== undefined;
            this._isPerformer = this.checkPerformerRole();
        }
    }

    isLogged(): boolean{
        return this._isLogged;
    }

    isPerformer(): boolean {
        return this._isPerformer;
    }

    private checkPerformerRole(): boolean {
        let isPerformer = false;
        for(let i = 0; i < this.ruoloUtenteList!.length; i++){
            if(PerformerRoles.indexOf(this.ruoloUtenteList![i].tipoRuolo) > -1){
                isPerformer = true;
                break;
            }
        }
        return isPerformer;
    }
}
