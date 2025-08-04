import { inject, Injectable } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserPresence {
    status: 'online' | 'offline' | 'away';
    timestamp: number;
    lastSeen: number;
}

/**
 * Service for managing and monitoring user presence status in the application.
 * Provides methods to get individual user presence, online users, and presence statistics.
 */
@Injectable({
    providedIn: 'root'
})
export class PresenceService {
    private database = inject(Database);
    private presenceMap = new BehaviorSubject<{ [uid: string]: UserPresence }>({});

    constructor() {
        this.initializePresenceListener();
    }

    /**
     * Returns the presence status of a specific user as an observable.
     *
     * @param uid - The user ID.
     * @returns Observable emitting the user's presence status or null if not available.
     */
    getUserPresence(uid: string): Observable<UserPresence | null> {
        return this.presenceMap.pipe(
            map(presence => presence[uid] || null)
        );
    }

    /**
     * Returns a list of user IDs that are currently online.
     *
     * @returns Observable emitting an array of online user IDs.
     */
    getOnlineUsers(): Observable<string[]> {
        return this.presenceMap.pipe(
            map(presence =>
                Object.keys(presence).filter(uid =>
                    presence[uid]?.status === 'online'
                )
            )
        );
    }

    /**
     * Checks if a specific user is currently online.
     *
     * @param uid - The user ID.
     * @returns Observable emitting true if the user is online, otherwise false.
     */
    isUserOnline(uid: string): Observable<boolean> {
        return this.getUserPresence(uid).pipe(
            map(presence => presence?.status === 'online')
        );
    }

    /**
     * Returns the total number of users currently online.
     *
     * @returns Observable emitting the count of online users.
     */
    getOnlineUserCount(): Observable<number> {
        return this.getOnlineUsers().pipe(
            map(users => users.length)
        );
    }

    /**
     * Initializes the listener for presence changes in the database.
     * Updates the internal presence map whenever data changes.
     *
     * @private
     */
    private initializePresenceListener(): void {
        const presenceRef = ref(this.database, 'presence');

        onValue(presenceRef, (snapshot) => {
            const presence = snapshot.val() || {};
            this.presenceMap.next(presence);
        });
    }
}
