import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ThreadService {
    constructor() {}

    private _isThreadOpen = false;

    toggleThread(value: boolean) {
        this._isThreadOpen = value;
    }

    get isThreadOpen(): boolean {
        return this._isThreadOpen;
    }
}
