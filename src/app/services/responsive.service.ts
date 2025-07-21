import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
	providedIn: "root",
})
export class ResponsiveService {
	public screenWidth$: Observable<number>;
	private screenWidthSubject: BehaviorSubject<number>;

	constructor() {
		this.screenWidthSubject = new BehaviorSubject<number>(
			window.innerWidth
		);
		this.screenWidth$ = this.screenWidthSubject.asObservable();

		// Initial update
		this.updateWidth();

		// Subscribe to window resize event
		window.addEventListener("resize", () => {
			this.updateWidth();
		});
	}

	private updateWidth(): void {
		const newWidth = window.innerWidth;
		this.screenWidthSubject.next(newWidth);
	}
}
