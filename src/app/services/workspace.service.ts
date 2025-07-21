import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
	providedIn: "root",
})
export class WorkspaceService {
	private isMainMenuOpen = new BehaviorSubject<boolean>(false);
	isMainMenuOpen$ = this.isMainMenuOpen.asObservable();

	get currentStatus(): boolean {
		return this.isMainMenuOpen.value;
	}

	setStatus(bool: boolean) {
		this.isMainMenuOpen.next(bool);
	}
}
