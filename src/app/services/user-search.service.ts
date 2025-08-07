import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {UserData} from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserSearchService {

  /**
   * Searches users by email or username
   */
  searchUsers(query: string): Observable<UserData[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    // In einer echten App würdest du hier Firestore abfragen
    return this.searchUsersInFirestore(query);
  }

  /**
   * Checks if query looks like an email
   */
  private isEmailQuery(query: string): boolean {
    return query.includes('@') && query.includes('.');
  }

  /**
   * Search in Firestore (Beispiel-Implementation)
   */
  private searchUsersInFirestore(query: string): Observable<UserData[]> {
    // Beispiel für Firestore-Query
    // In einer echten Implementation würdest du hier den AngularFire Service verwenden
    
    const lowerQuery = query.toLowerCase();
    
    // Simulierte Benutzer-Daten
    const mockUsers: UserData[] = [
      // Hier würden deine echten Firestore-Daten stehen
    ];

    const filteredUsers = mockUsers.filter(user => 
      user.email.toLowerCase().includes(lowerQuery) ||
      user.userName.toLowerCase().includes(lowerQuery)
    );

    return of(filteredUsers);
  }

  /**
   * Validates email format
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
}
