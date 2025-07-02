import {
	EnvironmentInjector,
	inject,
	Injectable,
	runInInjectionContext,
} from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, map, shareReplay, switchMap } from "rxjs/operators";
import { UserData } from "../interfaces/user.interface";
import {
	collection,
	collectionData,
	doc,
	docData,
	Firestore,
} from "@angular/fire/firestore";
import { Auth, user } from "@angular/fire/auth";

@Injectable({
	providedIn: "root",
})
export class UserService {
	private firestore = inject(Firestore);
	private auth = inject(Auth);
	readonly currentUser$: Observable<UserData | null> = user(this.auth).pipe(
		switchMap((user) => {
			if (!user) {
				return of(null);
			}
			return this.getUserData(user.uid);
		}),
		shareReplay(1)
	);
	readonly allUsers$: Observable<UserData[] | null> = user(this.auth).pipe(
		switchMap((users) => {
			if (!users) {
				return of(null);
			}
			return this.getAllUserData();
		}),
		shareReplay(1)
	);
	private environmentInjector = inject(EnvironmentInjector);
	private userCache = new Map<string, Observable<UserData | null>>();
	private _isUserMenuOpen = false;

	get isUserMenuOpen(): boolean {
		return this._isUserMenuOpen;
	}

	private _isUserProfileCardOpen = false;

	get isUserProfileCardOpen(): boolean {
		return this._isUserProfileCardOpen;
	}

	private _isUserProfileEdit = false;

	get isUserProfileEdit(): boolean {
		return this._isUserProfileEdit;
	}

	/**
	 * Gets user data by user ID with caching
	 * @param uid The user ID to look up
	 * @returns Observable with user data or null if not found
	 */
	getUserData(uid: string): Observable<UserData | null> {
		if (!uid) {
			return of(null);
		}

		if (this.userCache.has(uid)) {
			return this.userCache.get(uid)!;
		}

		const userObservable = runInInjectionContext(
			this.environmentInjector,
			() => {
				const userDocRef = doc(this.firestore, `users/${uid}`);
				return docData(userDocRef).pipe(
					map((data) => data as UserData),
					catchError((error) => {
						console.error("Error fetching user data:", error);
						return of(null);
					}),
					shareReplay(1)
				);
			}
		);

		this.userCache.set(uid, userObservable);
		return userObservable;
	}

	getAllUserData(): Observable<UserData[]> {
		return runInInjectionContext(this.environmentInjector, () => {
			const usersCollectionRef = collection(this.firestore, "users");
			return collectionData(usersCollectionRef, {
				idField: "uid",
			}) as Observable<UserData[]>;
		});
	}

	handleUserMenu(bool: boolean) {
		this._isUserMenuOpen = bool;
	}

	handleUserProfileCard(bool: boolean) {
		this._isUserProfileCardOpen = bool;
	}

	handleUserProfileEdit(bool: boolean) {
		this._isUserProfileEdit = bool;
	}
}
