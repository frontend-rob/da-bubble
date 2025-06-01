import {EnvironmentInjector, inject, Injectable, runInInjectionContext,} from "@angular/core";
import {Observable, of} from "rxjs";
import {catchError, map, shareReplay, switchMap} from "rxjs/operators";
import {UserData} from "../interfaces/user.interface";
import {doc, docData, Firestore} from "@angular/fire/firestore";
import {Auth, user} from "@angular/fire/auth";

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

    handleUserMenu(bool: boolean) {
        this._isUserMenuOpen = bool;
    }

    handleUserProfileCard(bool: boolean) {
        this._isUserProfileCardOpen = bool;
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

    /**
     * Gets a username by user ID
     * @param uid The user ID to look up
     * @returns Observable with the username or empty string if not found
     */
    getUserName(uid: string): Observable<string> {
        return this.getUserData(uid).pipe(
            map((userData) => userData?.userName || ""),
            catchError(() => of(""))
        );
    }

    /**
     * Gets the current logged-in user's name
     * @returns Observable with the current user's name or empty string if not logged in
     */
    getCurrentUserName(): Observable<string> {
        return this.currentUser$.pipe(
            map((userData) => userData?.userName || ""),
            catchError(() => of(""))
        );
    }

    /**
     * Gets the current logged-in user's ID
     * @returns Observable with the current user's ID or null if not logged in
     */
    getCurrentUserId(): Observable<string | null> {
        return user(this.auth).pipe(map((user) => user?.uid || null));
    }
}
