import {Injectable} from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ThreadService {
    private _isThreadOpen = false;

    get isThreadOpen(): boolean {
        return this._isThreadOpen;
    }

    toggleThread(value: boolean) {
        this._isThreadOpen = value;
    }
}
