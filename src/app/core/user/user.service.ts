import { Injectable, Optional } from '@angular/core';
import { ApiService } from '@core/api/api.service';
import { AuthService } from '@core/auth';
import { DeviceService } from '@core/device';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { LoginStates } from './models/LoginStates';
import { User } from './models/User';
import { UserModuleOptions } from './models/UserModuleOptions';
import { TranslateModule } from '@ngx-translate/core';

const profileValidity = 1000 * 60 * 60 * 24;     // The user data is valid for only 24 hours (86400000 mills)

const storageKeys = {
    user: 'user',
    public: 'public',
    firstAccess: 'firstAccess',
    jwt: 'jwt'
};

@Injectable()
export class UserService {
    private user: User | null = null;
    private storage: Storage;
    private firstAccess: boolean = true;
    private publicAccess: boolean = false;
    // Observable to share user login changes
    public onSessionChanges$: Subject<number> = new Subject();
    //Observable to get user data
    public userDataObservable$: Subject<any> = new Subject();

    constructor(
        @Optional() public options: UserModuleOptions,
        private apiService: ApiService,
        private authService: AuthService,
        private deviceService: DeviceService,
    ){
        this.storage = new Storage({
            name : options.storePrefix || 'storage',
            storeName : 'user',
            driverOrder : ['localstorage']
        });
        this.storage.get(storageKeys.firstAccess).then((isFirstAccess: boolean) => {
            // If firstAccess flag doesn't exists create it with true value
            if(typeof isFirstAccess === 'undefined' || isFirstAccess === null){
                this.setFirstAccess(true);
            }
            else {
                this.firstAccess = isFirstAccess;
            }
        });
        this.storage.get(storageKeys.public).then((isPublic: boolean) => {
            if(typeof isPublic === 'undefined' || isPublic === null){
                this.publicAccess = false;
            }
            else {
                this.publicAccess = isPublic;
            }
        });
        this.deviceService.networkStatusChanges$.subscribe((isOnline: boolean) => {
            if(isOnline){
                this.autologin();
            }
        });
    }

    getUser(): User {
        if(this.user){
            return this.user;
        }
        else {
            return new User();
        }
    }

    /**
     * Returns the user full name
     * @returns string
     */
    getFullName(): string {
        if(this.user){
            return this.user.nome!;
        }
        return '';
    }

    /**
     * Returns if user is logged
     * @returns boolean
     */
    isLogged(): boolean {
        if(this.user) {
            return this.user.isLogged();
        }
        return false;
    }

    /**
     * Return the current value for public access mode
     * @returns boolean
     */
    isPublicAccess(): boolean {
        return this.publicAccess;
    }

    /**
     * Set the public access flag in memory and storage
     * @param  {boolean} publicAccess
     */
    setPublicAccess(publicAccess: boolean) {
        this.publicAccess = publicAccess;
        this.storage.set(storageKeys.public, publicAccess);
    }

    /**
	 * Try login with the scanned otp
	 * @param  {string} eventCode
	 */
	login(otp: string) {

        this.deviceService.showLoading();
        this.setFirstAccess(true);
        return new Promise((resolve, reject) => {
            this.authService.authenticate(otp).then(
                (jwtData: any) => {
                    console.log("JWT USER DATA: ", jwtData);
                    
                    // Recupero le informazioni utente aggiornate
                    this.fetchUserProfile(jwtData.codFiscale).subscribe(
                        (userData: any) => {
                            try {
                                // Faccio un nuovo merge delle precedenti informazioni con le nuove
                                let newUser: User = Object.assign(userData, jwtData);
                                this.startSession(newUser);
                                resolve();
                            }
                            catch(err){
                                this.endSession();
                                reject(err);
                            }
                        },
                        (err: Error) => {
                            this.endSession();
                            reject(err);
                        }
                    );
                },
                reject
            );
        });
    }

    /**
     * Fetch the accessToken and the refreshToken for public access
     * @returns Promise
     */
    accessAsPublic(): Promise<any> {
        return new Promise((resolve, reject) => {
            // If the device is online try the login
            if(this.deviceService.isOnline()){
                this.authService.fetchPublicAccess().then(
                    () => {
                        this.setFirstAccess();
                        this.setPublicAccess(true);
                        this.onSessionChanges$.next(LoginStates.PUBLIC);
                        resolve();
                    },
                    (err: Error) => {
                        reject(err);
                    }
                );
            }
            // Otherwise enter in app wit a fake accessToken
            // The app will use the DB and when online will be fetch the new accessToken with interceptor
            else {
                resolve();
            }
        });
    }

    /**
     * If the refreshToken is stored try to use it to fetch a new accessToken
     * after that get the last user info in storage to use as user and go in
     */
    autologin(): Promise<any>{
        return new Promise((resolve, reject) => {
            let user: any;
            this.storage.get(storageKeys.user).then((lastUser) => {
                user = new User(lastUser);
            
            
            // Recupero le informazioni utente aggiornate
            if(user.isLogged()){
                
                this.fetchUserProfile(user.id).subscribe(
                    (updatedUserData: any) => {

                        try{
                            // Faccio un nuovo merge delle precedenti informazioni con le nuove
                            let newUser: User = Object.assign(user, updatedUserData);
                            this.setFirstAccess(false);
                            this.startSession(newUser);
                            resolve();
                        }
                        catch(err){
                            reject(err);
                        }
                    },
                    reject => { 
                        console.log("autologin reject ", reject); 
                        if(reject.message == "DEVICE_OFFLINE") {
                            this.deviceService.hideSplashscreen();
                            this.deviceService.showToast("Please connect to internet and restart");}
                    }
                );
            }
            else {
                resolve();
            }

            });
        });
    }

     /**
     * Get user's information
     * @param {string} userId User's ID
     */
    private fetchUserProfile(userId: string): Observable<any> {
        return this.apiService.callApi('getUserById', {
            paths: {
                id : userId
            }
        });
    }

    /* refreshUserProfile(){
        return new Promise((resolve, reject) => {
            // If the current profile data was refreshed during last 24 hours => resolve
            if(new Date().getTime() - (this.user as User).timestamp < profileValidity){
                resolve();
            }
            // Otherwise if the user is loggd I can update its data (if online)
            else if(this.deviceService.isOnline() && this.isLogged()){
                this.fetchUserProfile((this.user as User).username).subscribe(
                    (res: any) => {
                        try{
                            this.startSession((this.user as User).username, res.data.users.items[0]);
                            this.setFirstAccess();
                            resolve();
                        }
                        catch(err){
                            reject(err);
                        }
                    },
                );
            }
            else {
                resolve();
            }
        });
    } */

    /**
     * Get the firstAccess flag to use for public access
     * @returns Promise
     */
    isFirstAccess(): boolean{
        return this.firstAccess;
    }

    /**
     * Set the firstAccess flag to use for public access
     * As default the firstAccess flag will be disabled
     */
    setFirstAccess(firstAccess: boolean = false){
        this.firstAccess = firstAccess;
        this.storage.set(storageKeys.firstAccess, firstAccess);
    }

    /**
     * Set the user information in localStorage,
     * init the user info in memory
     * and set isPublic to false
     * @param  {User} userData
     */
    startSession(userData: User) {
        console.log("session started with user: ",userData);
        this.user = new User(userData);
        this.userDataObservable$.next(userData);

        this.setPublicAccess(false);
        this.storage.get(storageKeys.user).then((lastUser: User) => {
            if(lastUser && lastUser.id === userData.id){
                this.onSessionChanges$.next(LoginStates.LAST_USER);
            }
            else {
                this.onSessionChanges$.next(LoginStates.NEW_USER);
            }
        });
        this.storage.set(storageKeys.user, userData);
        
    
    }

    restoreLastSession() {
        console.log("restore last session");
        return new Promise((resolve, reject) => {
            // If the user is logged I can update its data (if online)
            if(this.deviceService.isOnline() && this.isLogged()){
                this.fetchUserProfile((this.user as User).nome!).subscribe(
                    (res: any) => {
                        try{
                            this.startSession( res.data.users.items[0]);
                            this.setFirstAccess();
                            resolve();
                        }
                        catch(err){
                            reject(err);
                        }
                    },
                );
            }
            // Otherwise the user is an invited one, so I can0't update its data
            else {
                this.storage.get(storageKeys.user).then((lastUser: User) => {
                    if(lastUser){
                        this.user = new User(lastUser);
                        resolve();
                    }
                    else {
                        reject(new Error('ERR_NO_LAST_USER_INFO'));
                    }
                });
            }
        });
    }

    /**
     * Destroy the user session and the user info in DB
     */
    endSession() {
        this.user = null;
        this.storage.remove(storageKeys.user);
        this.storage.remove(storageKeys.jwt);
    }

    /**
     * Logout the user,
     * destroy all his references
     * and get new accessToken for public access
     * @param  {LoginStates} loginState LOGOUT if user logs out or THROW_OUT if the refreshToken expire
     */
    logout(loginState: LoginStates): void {
        this.deviceService.showLoading();
        this.endSession();
        this.onSessionChanges$.next(loginState);
        //this.authService.setJwt('')
        this.storage.set(storageKeys.firstAccess, true);
        this.deviceService.hideLoading();
    }

    simulatorStartSession(){


            this.startSession({
                id: "LBRFNC82T22F839A",
                nome: "Liberto",
                cognome: "Finacci",
                codFiscale: "LBRFNC82T22F839A",
                // id: "CRSLRD58L15E202F",
                // nome: "Leonardo",
                // cognome: "CARUSO",
                // codFiscale: "CRSLRD58L15E202F",
                email: "registratiovunque@gmail.com",
                telefono: "0763313316",
                pec: undefined,
                photoRef: undefined,
                residenza: {
                    cap: '00012',
                    codComune: 'G716',
                    codProvincia: '345DFD',
                    via: 'Via dei vasari'
                },
                domicilio: {
                    cap: '00012',
                    codComune: 'G716',
                    codProvincia: '345DFD',
                    via: 'Via dei vasari'
                },
                ruoloUtenteList: [
                    {
                        tipoRuolo: 'CITTADINO_REGISTRATO'
                    },
                    {
                        tipoRuolo: 'ISTRUTTORE'
                    },
                    {
                        tipoRuolo: 'DIRETTORE_CORSO'
                    }
                ],
                esecutore: undefined,
                istruttore: {
                    idAttestato: "5b62d66b64fa40a6808456c8",
                    sanitario: false
                }
            } as User );

    }
    
}
