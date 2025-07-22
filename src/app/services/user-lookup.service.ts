import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {UserData} from '../interfaces/user.interface';
import {collection, collectionData, doc, docData, Firestore, query, where} from '@angular/fire/firestore';
import {map, Observable, of, shareReplay} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserLookupService {
	private userCache = new Map<string, Observable<UserData | undefined>>();

	private environmentInjector = inject(EnvironmentInjector);

	constructor(private firestore: Firestore) {
	}

	/**
	 * Holt UserData für eine bestimmte UID
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
		})
	}

	/**
	 * Holt UserData für mehrere UIDs
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
				return collectionData(userQuery, {idField: 'uid'}).pipe(
					map(users => users as UserData[])
				);
			} else {
				return of([]);
			}
		})
	}

	/**
	 * Löscht einen bestimmten User aus dem Cache
	 */
	clearUserFromCache(uid: string): void {
		this.userCache.delete(uid);
	}

	/**
	 * Leert den gesamten Cache
	 */
	clearCache(): void {
		this.userCache.clear();
	}
}
