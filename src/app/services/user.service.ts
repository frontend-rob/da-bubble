import {
	EnvironmentInjector,
	inject,
	Injectable,
	runInInjectionContext,
} from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { catchError, map, shareReplay, switchMap } from "rxjs/operators";
import { UserData } from "../interfaces/user.interface";
import {
	collection,
	collectionData,
	doc,
	docData,
	Firestore,
	updateDoc,
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

	private _isUserAvatarEdit = false;

	get isUserAvatarEdit(): boolean {
		return this._isUserAvatarEdit;
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

	/**
	 * Updates the user's avatar (profile picture)
	 *
	 * @param userId - The ID of the user whose avatar should be updated
	 * @param photoURL - The new URL for the user's profile picture
	 * @returns Promise<void> that resolves when the update is complete
	 */
	async updateUserAvatar(userId: string, photoURL: string): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			if (!userId || !photoURL) {
				throw new Error("User ID and photo URL are required");
			}

			const userDocRef = doc(this.firestore, `users/${userId}`);

			try {
				await updateDoc(userDocRef, {
					photoURL: photoURL,
				});

				// Clear the cache for this user to ensure fresh data is fetched next time
				if (this.userCache.has(userId)) {
					this.userCache.delete(userId);
				}
			} catch (error) {
				console.error("Error updating user avatar:", error);
				throw error;
			}
		});
	}

	/**
	 * Updates the user's avatar (profile picture)
	 *
	 * @param userId - The ID of the user whose avatar should be updated
	 * @param photoURL - The new URL for the user's profile picture
	 * @returns Promise<void> that resolves when the update is complete
	 */
	async updateUserName(userId: string, userName: string): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			if (!userId || !userName) {
				throw new Error("User ID and user name are required");
			}

			const userDocRef = doc(this.firestore, `users/${userId}`);

			try {
				await updateDoc(userDocRef, {
					userName: userName,
				});

				// Clear the cache for this user to ensure fresh data is fetched next time
				if (this.userCache.has(userId)) {
					this.userCache.delete(userId);
				}
			} catch (error) {
				console.error("Error updating user avatar:", error);
				throw error;
			}
		});
	}

	handleUserMenu(bool: boolean) {
		this._isUserMenuOpen = bool;
	}

	handleUserProfileCard(bool: boolean) {
		this._isUserProfileCardOpen = bool;
	}

	handleUserAvatarEdit(bool: boolean) {
		this._isUserAvatarEdit = bool;
	}

	handleUserProfileEdit(bool: boolean) {
		this._isUserProfileEdit = bool;
	}
	
	// In deinem UserService hinzufügen:

	private directMessageUserSubject = new Subject<UserData>();
	directMessageUser$ = this.directMessageUserSubject.asObservable();

	openDirectMessageWithUser(user: UserData) {
		this.directMessageUserSubject.next(user);
	}
}
