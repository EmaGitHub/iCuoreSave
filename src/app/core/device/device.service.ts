import { Injectable, Optional } from '@angular/core';
import { ENV } from '@env';
import { Device } from '@ionic-native/device';
import { Dialogs } from '@ionic-native/dialogs';
import { Globalization } from '@ionic-native/globalization';
import { Network } from '@ionic-native/network';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import {
    AlertButton,
    AlertController,
    AlertOptions,
    LoadingController,
    Platform,
    ToastController,
    ToastOptions,
} from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { DeviceModuleOptions } from './models/DeviceModuleOptions';
import { KeyboardProvider } from './models/IKeyboard';
import { GeolocationServiceProvider } from '../../../providers/geolocation-service/geolocation-service';

@Injectable()
export class DeviceService {
    private modalTitle!: string;
    private dialogsMode!: string;
    private ionLoading!: any;

    public networkStatusChanges$: Subject<boolean> = new Subject();
    public keyboardVisibilityChanges$: Subject<boolean> = new Subject();
    public onResume: Subject<any> = new Subject();
    public onPause: Subject<any> = new Subject();

    constructor(
        @Optional() options: DeviceModuleOptions,
        private platform: Platform,
        private network: Network,
        private splashScreen: SplashScreen,
        private keyboard: KeyboardProvider,
        private spinnerDialog: SpinnerDialog,
        private loadingCtrl: LoadingController,
        private dialogs: Dialogs,
        private statusBar: StatusBar,
        private globalization: Globalization,
        private screenOrientation: ScreenOrientation,
        private translateService: TranslateService,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private device: Device,
        private geolocationService: GeolocationServiceProvider
    ) {
        if(options){
            if(options.modalTitle) this.modalTitle = options.modalTitle;
            if(options.dialogsMode) this.dialogsMode = options.dialogsMode;
        }

        // Init observables when device is ready
        const Device = this;
        if (this.isCordova()) {
            document.addEventListener('deviceready', () => {
                Device.initSubscriptions();
            }, true);
        }
        else {
            Device.initSubscriptions();
        }
    }

    private initSubscriptions(){
        // Init subscription for online/offline events
        this.network.onConnect().subscribe(() => {
            this.networkStatusChanges$.next(true);
        });
        this.network.onDisconnect().subscribe(() => {
            this.networkStatusChanges$.next(false);
        });;

        // Init subscription for keyboard show/hide events
        this.keyboard.keyboardWillShow().subscribe(() => {
            (window.document.querySelector('ion-app') as HTMLElement).classList.add('keyboard-is-visible');
            this.keyboardVisibilityChanges$.next(true);
        });
        this.keyboard.keyboardWillHide().subscribe(() => {
            (window.document.querySelector('ion-app') as HTMLElement).classList.remove('keyboard-is-visible');
            this.keyboardVisibilityChanges$.next(false);
        });

        // Init subscription for platform pause event
        this.platform.pause.subscribe(() => {
            this.onPause.next(true);
        });

        // Init subscription for platform resume event
        this.platform.resume.subscribe(() => {
            this.onResume.next(true);
        });
    }

    /** Return true if the app is running on iOS or Android Simulator */
    isVirtual(): boolean {
        if(this.device){
            return this.device.isVirtual;
        }
        return false;
    }

    isGpsEnabled() : Promise<boolean> {

        return this.geolocationService.getPosition().then(
            () => {
                return true;
            }).catch( (e) => {
            console.log(e);
                return false;
            });
    }

    /**
    * Return true if the app running on Cordova, false otherwise
    * @returns {boolean}
    */
    isCordova(): boolean {
        return this.platform.is('cordova');
    }

    /**
    * Return true if the app running on Android device, false otherwise
    * @returns {boolean}
    */
    isAndroid(): boolean {
        return this.platform.is('android');
    }

    /**
    * Return true if the app running on iOS device, false otherwise
    * @returns {boolean}
    */
    isIos(): boolean {
        return this.platform.is('ios');
    }

    /**
    * Return true if the app running on Windows device, false otherwise
    * @returns {boolean}
    */
    isWindows(): boolean {
        return this.platform.is('windows');
    }

    /**
    * Return true if the app is running on tablet
    * @returns {boolean}
    */
    isTablet(): boolean {
        return this.platform.is('tablet');
    }

    /**
    * Return true if the device has internet connection available, false otherwise
    * @returns {boolean}
    */
    isOnline(): boolean {
        if (this.isCordova()) {
            const connectionType = this.network.type
            return connectionType !== (window as any).Connection.UNKNOWN && connectionType !== (window as any).Connection.NONE;
        }
        else {
            return (window.navigator && window.navigator.onLine);
        }
    }

    /**
    * Return true if the device doesn't have internet connection available, false otherwise
    * @returns {boolean}
    */
    isOffline(): boolean {
        return !this.isOnline();
    }

    /**
     * Return the device’s Universally Unique Identifier (UUID) if the app is running on device
     * @returns string
     */
    getUUID(): string {
        if(this.isCordova()){
            return this.device.uuid;
        }
        return 'FAKE_UUID';
    }

    /**
     * Return the operating system version if the app is running on device
     * @returns string
     */
    getOSVersion(){
        if(this.isCordova()){
            return this.device.version;
        }
        return 'FAKE_VERSION';
    }

    /**
     * Return the device’s operating system name if the app is running on device
     * @returns string
     */
    getOS(){
        if(this.isCordova()){
            return this.device.platform;
        }
        return 'FAKE_PLATFORM';
    }

    /**
     * Return the platform of the device’s model or product if the app is running on device
     * @returns string
     */
    getDeviceType(){
        if(this.isCordova()){
            return this.device.model;
        }
        return 'FAKE_PLATFORM';
    }

    /**
    * Show the app's splash screen
    * @returns void
    */
    showSplashscreen(): void {
        this.splashScreen.show();
    }

    /**
    * Hide the app's splash screen
    * @returns void
    */
    hideSplashscreen(): void {
        if(this.isCordova())
        this.splashScreen.hide();
    }

    /**
    * Force keyboard to be shown
    * @returns void
    */
    showKeyboard(): void {
        this.keyboard.show();
    }

    /**
    * Close the keyboard if open
    * @returns void
    */
    closeKeyboard(): void {
        this.keyboard.hide();
    }

    /**
     * Set the default status bar style: dark text, for light backgrounds
     * @returns void
     */
    styleStatusBarAsDefault() : void {
        if (this.isCordova()) {
            this.statusBar.styleDefault();
            this.statusBar.backgroundColorByHexString('#df222e');
        }
    }

    /**
     * Get the preferred language set on device
     * @returns {Promise<string>}
     */
    getPreferredLanguage() : Promise<string> {
        let defer: Promise<{value: string}>;
        if(this.isCordova()){
            defer = this.globalization.getPreferredLanguage();
        }
        else {
            defer = new Promise((resolve, reject) => { resolve(ENV.getPreferredLanguageDev) });
        }
        return defer.then(
            (lang: {value:string}) => {
                let final;
                try{
                    final = lang.value.split('-')[0].toLowerCase();
                }catch(e){ final = ''; }
                return final;
            }
        )
    }

    /**
    * Show the native spinner dialog
    * or the Ionic Loading if the app is running on browser and there isn't any `message`
    * or the Ionic
    * @param  {string} message Message to display in the spinner dialog
    * @returns void
    */
    showLoading(message?: string): void {
        this.closeKeyboard();

        if(message){
            message = this.translateService.instant(message);
        }

        if (this.isCordova()) {
            if(message){
                this.spinnerDialog.show(this.modalTitle, message, true);
            }
            else {
                this.spinnerDialog.show(undefined, undefined, true);
            }
        }
        else if(!this.ionLoading) {
            this.ionLoading = this.loadingCtrl.create({
                content: message
            });
            this.ionLoading.present();
        }

        /* setTimeout(() => {
            this.hideLoading(true);
        }, 8000); */
    }

    /**
    * Close the native spinner dialog or the Ionic one
    * @returns void
    */
    hideLoading(slow?: boolean): void {

        if (this.isCordova()) {
            this.spinnerDialog.hide();

            if(slow) this.showToast("Slow connection", {duration: 1000});
        }
        else if(this.ionLoading) {
            this.ionLoading.dismiss();
            delete this.ionLoading;
        }
    }

    ORIENTATIONS = this.screenOrientation.ORIENTATIONS;

    /**
     * Lock the orientation to the passed value
     * @param  {string} orientation One of the @ionic-native/screen-orientation's ORIENTATIONS
     * @returns void
     */
    lockOrientation(orientation: string): void {
        this.screenOrientation.lock(orientation);
    }

    /**
     * Unlock and allow all orientations
     * @returns void
     */
    unlockOrientation(): void {
        this.screenOrientation.unlock();
    }

    /**
     * Get the current orientation of the device
     * @returns string
     */
    getOrientation(): string {
        return this.screenOrientation.type;
    }

    /**
     * Check if device's orientation is portrait
     * @returns boolean
     */
    isPortrait(): boolean {
        const orientation = this.getOrientation();
        if(
            orientation === this.screenOrientation.ORIENTATIONS.PORTRAIT ||
            orientation === this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY ||
            orientation === this.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY
        ){
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Check if device's orientation is landscape
     * @returns boolean
     */
    isLandscape(): boolean {
        return !this.isPortrait();
    }

    /**
     * Listen to orientation change event
     * @param  {Function|undefined} callback Callback to execute when orientation event is fired
     * @returns Observable
     */
    onOrientationChange(callback: Function | undefined): Subscription {
        return this.screenOrientation.onChange().subscribe(
            () => {
                if(callback){
                    callback();
                }
            });
    }

    /**
    * Show a native or ionic simple alert dialog
    * @param  {string} message Dialog message
    * @param  {string} title Dialog title
    * @returns void
    */
    alert(message: string,
          options: {
            handler?: () => void,
            title?: string,
            buttonName?: string
        } = {}
    ): void {
        this.hideLoading();

        if(!options.handler){
            options.handler = () => {};
        }

        if(!options.title){
            options.title = this.modalTitle;
        }

        if(!options.buttonName){
            options.buttonName = 'OK';
        }

        try {
            message = this.translateService.instant(message);
            options.title = this.translateService.instant(options.title);
            options.buttonName = this.translateService.instant(options.buttonName);
        }
        catch (e) {}

        if (this.isCordova() && this.dialogsMode === 'native') {
            this.dialogs.alert(message, options.title, options.buttonName).then(() => {
                (options.handler as () => {})();
            });
        }
        else {
            this.ionicCustomAlert({
                title: options.title,
                message: message,
                buttons: [
                    {
                        text: options.buttonName,
                        handler: options.handler
                    }
                ]
            });
        }
    }

    /**
    * Show a native confirm dialog or the simple browser confirm
    * @param {string} message Dialog message
    * @param {string} title Dialog title
    * @param {AlertButton[]} buttons List of <AlertButton>
    */
    confirm(message: string,
            options: {
                title?: string,
                buttons?: AlertButton[]
            } = {}
    ) {
        this.hideLoading();

        if(!options.title){
            options.title = this.modalTitle;
        }

        if(!options.buttons){
            options.buttons = [{
                text: 'CANCEL',
                cssClass: 'primary',
                role: 'cancel',
                handler: () => {}
            },{
                text: 'OK',
                cssClass: 'primary',
                handler: () => {}
            }];
        }

        message = this.translateService.instant(message);
        options.title = this.translateService.instant(options.title);

        const buttonLabels = options.buttons.map((b: AlertButton) => {
            return this.translateService.instant(<string>b.text);
        });

        if (this.isCordova() && this.dialogsMode === 'native'){
            this.dialogs.confirm(message, options.title, buttonLabels).then(
                (buttonIndex: number) => {
                    // Decrement clicked button index because the plugin use 'one-based indexing'
                    buttonIndex--;
                    // Then execute the 'onClick' function if is defined
                    if ((options.buttons as AlertButton[])[buttonIndex]) {
                        ((options.buttons as AlertButton[])[buttonIndex] as any).handler();
                    }
                }
            );
        }
        else {
            this.ionicCustomAlert({
                title: options.title,
                message: message,
                buttons: options.buttons
            });
        }
    }

    /**
    * Show an ionic custom alert dialog
    * @param  {AlertOptions} options All Ionic alert options
    * @returns void
    */
    ionicCustomAlert(options: AlertOptions = {}){
        this.hideLoading();

        if(!options.title) options.title = this.modalTitle;
        options.title = this.translateService.instant(options.title);
        if(options.subTitle) {
            options.subTitle = this.translateService.instant(options.subTitle);
        }
        else {
            options.subTitle = '';
        }
        if(options.message) {
            options.message = this.translateService.instant(options.message);
        }
        else {
            options.message = '';
        }
        if(!options.cssClass) options.cssClass = 'primary';
        if(!options.inputs) options.inputs = [];
        if(!options.buttons) { options.buttons = [
            {
                text : 'OK',
                handler : () => {},
                cssClass : 'primary',
                role : ''
            },{
                text : 'CANCEL',
                handler : () => {},
                cssClass : 'primary',
                role : 'cancel'
            }
        ];
        }
        options.buttons.forEach((b) => {
            (b as AlertButton).text = this.translateService.instant((b as AlertButton).text as string);
        });
        if(!options.enableBackdropDismiss) options.enableBackdropDismiss = false;

        let alert = this.alertCtrl.create(options);
        if(this.isIos()){
            alert.setMode('ios');
        }
        alert.present();
    }

    /**
     * Show an ionic toast
     * @param  {string} message Main message text of toast
     * @param  {ToastOptions?} options All Ionic toast options
     * @returns void
     */
    showToast(message: string, options?: ToastOptions){
        if(!options){
            options = {};
        }
        options.message = this.translateService.instant(message);
        if(!options.position) options.position = 'bottom';
        if(!options.duration) options.duration = 4000;
        if(options.closeButtonText) {
            options.showCloseButton = true;
            options.closeButtonText = this.translateService.instant(options.closeButtonText);
        }

        let toast = this.toastCtrl.create(options);
        toast.present();
    }
}
