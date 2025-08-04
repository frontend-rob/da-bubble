import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Service for managing the state of the main menu in the workspace.
 * Provides an observable for menu status and methods to get and set the current state.
 */
@Injectable({
    providedIn: "root",
})
export class WorkspaceService {
    private isMainMenuOpen = new BehaviorSubject<boolean>(false);

    /**
     * Observable emitting the current open/closed status of the main menu.
     */
    isMainMenuOpen$ = this.isMainMenuOpen.asObservable();

    /**
     * Returns the current status of the main menu.
     */
    get currentStatus(): boolean {
        return this.isMainMenuOpen.value;
    }

    /**
     * Sets the status of the main menu (open or closed).
     *
     * @param bool - True to open the menu, false to close it.
     */
    setMainMenuStatus(bool: boolean) {
        this.isMainMenuOpen.next(bool);
    }
}
