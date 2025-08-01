import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

/**
 * Dienst zur Verwaltung des responsiven Verhaltens der Anwendung.
 * Überwacht die Bildschirmbreite und stellt diese Information als Observable bereit.
 */
@Injectable({
	providedIn: "root",
})
export class ResponsiveService {
	/**
	 * Observable, das die aktuelle Bildschirmbreite ausgibt und auf Änderungen reagiert.
	 */
	public screenWidth$: Observable<number>;
	private screenWidthSubject: BehaviorSubject<number>;

	/**
	 * Initialisiert den Dienst, richtet Event-Listener für Fenstergrößenänderungen ein 
	 * und initialisiert die Bildschirmbreite mit dem aktuellen Wert.
	 */
	constructor() {
		this.screenWidthSubject = new BehaviorSubject<number>(
			window.innerWidth
		);
		this.screenWidth$ = this.screenWidthSubject.asObservable();

		this.updateWidth();

		window.addEventListener("resize", () => {
			this.updateWidth();
		});
	}

	/**
	 * Aktualisiert die Bildschirmbreite im BehaviorSubject, wenn sich die Fenstergröße ändert.
	 *
	 * @private
	 * @return {void} Kein Rückgabewert
	 */
	private updateWidth(): void {
		const newWidth = window.innerWidth;
		this.screenWidthSubject.next(newWidth);
	}
}
