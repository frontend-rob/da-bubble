import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * Service for managing the responsive behavior of the application.
 * Monitors the screen width and provides this information as an observable.
 */
@Injectable({
    providedIn: "root",
})
export class ResponsiveService {
    public screenWidth$: Observable<number>;
    private screenWidthSubject: BehaviorSubject<number>;

    /**
     * Initializes the service, sets up event listeners for window resize,
     * and initializes the screen width with the current value.
     */
    constructor() {
        this.screenWidthSubject = new BehaviorSubject<number>(window.innerWidth);
        this.screenWidth$ = this.screenWidthSubject.asObservable();
        this.updateWidth();

        window.addEventListener("resize", () => {
            this.updateWidth();
        });
    }

    /**
     * Updates the screen width in the BehaviorSubject when the window size changes.
     *
     * @private
     */
    private updateWidth(): void {
        const newWidth = window.innerWidth;
        this.screenWidthSubject.next(newWidth);
    }
}
