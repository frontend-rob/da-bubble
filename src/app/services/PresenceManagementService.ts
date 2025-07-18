import { Injectable, inject } from '@angular/core';
import { Database, ref, onValue, off } from '@angular/fire/database';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserPresence {
    status: 'online' | 'offline' | 'away';
    timestamp: number;
    lastSeen: number;
}

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
     * Überwacht alle Präsenz-Änderungen
     */
    private initializePresenceListener(): void {
        const presenceRef = ref(this.database, 'presence');
        
        onValue(presenceRef, (snapshot) => {
            const presence = snapshot.val() || {};
            this.presenceMap.next(presence);
        });
    }

    /**
     * Holt den Status eines spezifischen Users
     */
    getUserPresence(uid: string): Observable<UserPresence | null> {
        return this.presenceMap.pipe(
            map(presence => presence[uid] || null)
        );
    }

    /**
     * Holt alle Online-User
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
     * Prüft ob ein User online ist
     */
    isUserOnline(uid: string): Observable<boolean> {
        return this.getUserPresence(uid).pipe(
            map(presence => presence?.status === 'online')
        );
    }

    /**
     * Holt die Anzahl der Online-User
     */
    getOnlineUserCount(): Observable<number> {
        return this.getOnlineUsers().pipe(
            map(users => users.length)
        );
    }
}
