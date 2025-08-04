import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { UserData } from '../interfaces/user.interface';
import { collection, collectionData, doc, docData, Firestore, query, where } from '@angular/fire/firestore';
import { map, Observable, of, shareReplay } from 'rxjs';

/**
 * Service for looking up user data by user ID(s) and managing a local cache.
 * Provides methods to fetch single or multiple users and to clear the cache.
 */
@Injectable({
    providedIn: 'root'
})
export class UserLookupService {
    private userCache = new Map<string, Observable<UserData | undefined>>();
    private environmentInjector = inject(EnvironmentInjector);

    constructor(private firestore: Firestore) { }

    /**
     * Retrieves user data for a specific user ID.
     *
     * @param uid - The user ID.
     * @returns Observable emitting the user data or undefined if not found.
     */
    getUserById(uid: string): Observable<UserData | undefined> {
        return runInInjectionContext(this.environmentInjector, () => {
            if (this.userCache.has(uid)) {
                return this.userCache.get(uid)!;
            }

            const userRef = doc(this.firestore, `users/${uid}`);
            const user$ = docData(userRef).pipe(
                map(data => data as UserData | undefined),
                shareReplay(1)
            );

            this.userCache.set(uid, user$);
            return user$;
        });
    }

    /**
     * Retrieves user data for multiple user IDs.
     *
     * @param uids - Array of user IDs.
     * @returns Observable emitting an array of user data.
     */
    getUsersByIds(uids: string[]): Observable<UserData[]> {
        return runInInjectionContext(this.environmentInjector, () => {
            if (!uids || uids.length === 0) {
                return of([]);
            }

            const uniqueUids = [...new Set(uids)];

            if (uniqueUids.length <= 10) {
                const userQuery = query(
                    collection(this.firestore, 'users'),
                    where('uid', 'in', uniqueUids)
                );
                return collectionData(userQuery, { idField: 'uid' }).pipe(
                    map(users => users as UserData[])
                );
            } else {
                return of([]);
            }
        });
    }

    /**
     * Removes a specific user from the cache.
     *
     * @param uid - The user ID to remove from the cache.
     */
    clearUserFromCache(uid: string): void {
        this.userCache.delete(uid);
    }

    /**
     * Clears the entire user cache.
     */
    clearCache(): void {
        this.userCache.clear();
    }
}
