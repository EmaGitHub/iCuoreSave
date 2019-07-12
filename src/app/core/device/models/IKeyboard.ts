import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';

/**
* cordova-plugin-ionic-keyboard Provider
* Diego Castro <ing.diegocastro@gmail.com>
*
*/
interface IKeyboard {
    isVisible: boolean;
    hideFormAccessoryBar(value: boolean, successCallback?: Function): void;
    hide(): void;
    close(): void;
    show(): void;
}

declare var Keyboard: IKeyboard;

@Injectable()
export class KeyboardProvider implements OnDestroy, OnInit {
    /**
    * Keyboard instance
    *
    * @private
    * @type {IKeyboard}
    * @memberof KeyboardProvider
    */
    private _keyboard!: IKeyboard;

    private _keyboardDidHide$: Observable<void>|null = null;
    private _keyboardDidShow$: Observable<KeyboardEvent>|null = null;
    private _keyboardWillShow$: Observable<KeyboardEvent>|null = null;
    private _keyboardWillHide$: Observable<void>|null = null;

    constructor() {
        if (!!(window as any).cordova) {
            document.addEventListener('deviceready', () => {
                this._keyboard = Keyboard;
            }, true);
        }
    }

    ngOnInit() {
    }
    /**
    * Determine if the keyboard is visible
    *
    * @readonly
    * @type {boolean}
    * @memberof KeyboardProvider
    */
    get isVisible(): boolean {
        if(this._keyboard){
            return this._keyboard.isVisible;
        }
        return false;
    }
    /**
    * Hide the keyboard toolbar
    * @param value
    * @param successCallback
    */
    hideFormAccessoryBar(value: boolean, successCallback?: Function): void {
        if(this._keyboard){
            this._keyboard.hideFormAccessoryBar(value, successCallback);
        }
    }
    /**
    * Show the keyboard
    */
    show(): void {
        if(this._keyboard){
            this._keyboard.show();
        }
    }
    /**
    * Hide the keyboard
    *
    * @memberof KeyboardProvider
    */
    hide(): void {
        if(this._keyboard){
            // Workaround for different methods for close function
            // betweek iOS and Android
            try{
                this._keyboard.hide();
            }
            catch(e){
                try{
                    this._keyboard.close();
                }
                catch(e){}
            }
        }
    }
    /**
    * This event is fired when the keyboard is fully closed.
    *
    * @returns {Observable<void>}
    * @memberof KeyboardProvider
    */
    keyboardDidHide(): Observable<void> {
        if (!this._keyboardDidHide$) {
            this._keyboardDidHide$ = fromEvent(window, 'keyboardDidHide');
        }
        return this._keyboardDidHide$;
    }
    /**
    * This event is fired when the keyboard is fully open.
    *
    * @returns {Observable<KeyboardEvent>}
    * @memberof KeyboardProvider
    */
    keyboardDidShow(): Observable<KeyboardEvent> {
        if (!this._keyboardDidShow$) {
            this._keyboardDidShow$ = fromEvent(window, 'keyboardDidShow');
        }
        return this._keyboardDidShow$;
    }
    /**
    * This event is fired when the keyboard is fully closed.
    *
    * @returns {Observable<void>}
    * @memberof KeyboardProvider
    */
    keyboardWillHide(): Observable<void> {
        if (!this._keyboardWillHide$) {
            this._keyboardWillHide$ = fromEvent(window, 'keyboardWillHide');
        }
        return this._keyboardWillHide$;
    }
    /**
    * This event fires before keyboard will be shown.
    *
    * @returns {Observable<KeyboardEvent>}
    * @memberof KeyboardProvider
    */
    keyboardWillShow(): Observable<KeyboardEvent> {
        if (!this._keyboardWillShow$) {
            this._keyboardWillShow$ = fromEvent(window, 'keyboardWillShow');
        }
        return this._keyboardWillShow$;
    }

    ngOnDestroy() {
    }

}
