/**
 * Service for handling authentication and user-related operations.
 * Provides methods to register users and save user data to Firestore.
 */
import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    
    constructor(private environmentInjector: EnvironmentInjector) { }

    /**
     * Registers a new user with Firebase Authentication.
     * @param email - The email address of the user.
     * @param password - The password for the user.
     * @returns A promise resolving to the user's unique ID (UID).
     */
    async registerUser(email: string, password: string): Promise<string> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const auth = inject(Auth);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user.uid;
        });
    }

    /**
     * Saves user data to Firestore under the user's unique ID.
     * @param uid - The unique ID of the user.
     * @param userData - The user data to save.
     * @returns A promise that resolves when the data is successfully saved.
     */
    async saveUserToFirestore(uid: string, userData: User): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const firestore = inject(Firestore);
            const userRef = doc(firestore, `users/${uid}`);
            await setDoc(userRef, userData);
        });
    }
}
