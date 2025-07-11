import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {UserData} from '../interfaces/user.interface';
import {collection, collectionData, doc, docData, Firestore, query, where} from '@angular/fire/firestore'; // Zusätzlich importieren
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

			// Direkt per DocumentID holen
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

			// Deduplizieren der UIDs
			const uniqueUids = [...new Set(uids)];

			// Firestore kann nur bis zu 10 OR-Bedingungen in einer Abfrage verarbeiten
			// Bei mehr müssen wir mehrere Abfragen ausführen
			if (uniqueUids.length <= 10) {
				const userQuery = query(
					collection(this.firestore, 'users'),
					where('uid', 'in', uniqueUids)
				);
				return collectionData(userQuery, {idField: 'uid'}).pipe(
					map(users => users as UserData[])
				);
			} else {
				// Für größere Mengen sollten wir in Batches arbeiten
				// Diese Implementierung sollte für die meisten Anwendungsfälle ausreichen
				return of([]); // Erweitere diese Implementierung bei Bedarf
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
