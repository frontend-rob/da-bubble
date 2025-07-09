import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class ResponsiveService {
	private screenWidthSubject: BehaviorSubject<number>;
	public screenWidth$: Observable<number>;

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

// import { HostListener, Injectable } from "@angular/core";

// @Injectable({
// 	providedIn: "root",
// })
// export class ResponsiveService {
// 	screenWidth: number = window.innerWidth;

// 	ngOnInit(): void {
// 		this.updateWidth();
// 	}

// 	@HostListener("window:resize", [])
// 	onResize(): void {
// 		this.updateWidth();
// 	}

// 	updateWidth(): void {
// 		this.screenWidth = window.innerWidth;
// 		console.log("Aktuelle Breite:", this.screenWidth);
// 	}
// }
