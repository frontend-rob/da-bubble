/**
 * Service for handling authentication and user-related operations.
 * Provides methods to register users and save user data to firestore.
 */
import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import {
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    user,
    User,
    signOut,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider, sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { UserData } from '../interfaces/user.interface';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    user$: Observable<User | null>;

    constructor(private environmentInjector: EnvironmentInjector, private firebaseAuth: Auth) {
        this.user$ = user(this.firebaseAuth);
    }

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
    async saveUserToFirestore(uid: string, userData: UserData): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const firestore = inject(Firestore);
            const userRef = doc(firestore, `users/${uid}`);
            await setDoc(userRef, userData);
        });
    }

    /**
     * Logs in a user with Firebase Authentication.
     * Ensures the method runs within an Angular injection context.
     * @param email - The email address of the user.
     * @param password - The password for the user.
     * @returns A promise that resolves when the user is successfully logged in.
     */
    async logIn(email: string, password: string): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const auth = inject(Auth);
            await signInWithEmailAndPassword(auth, email, password);
        });
    }

    /**
     * Logs out the currently authenticated user.
     * Ensures the method runs within an Angular injection context.
     * @returns A promise that resolves when the user is successfully logged out.
     */
    async logOut(): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const auth = inject(Auth);
            await signOut(auth);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
        });
    }

    /**
     * sends a Password Reset email to the specified email address.
     * @param email - The email address of the user.
     * @returns A promise that resolves when the email is successfully sent.
     */
    async resetPassword(email: string): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const auth = inject(Auth);
            await sendPasswordResetEmail(auth, email);
        });
    }

    /**
     * Signs in a user with Google using Firebase Authentication.
     * @returns A promise that resolves when the user is successfully signed in.
     */
    async signInWithGoogle(): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const auth = inject(Auth);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        });
    }

    /**
     * Signs in a user anonymously using Firebase Authentication.
     * @returns A promise that resolves when the user is successfully signed in.
     */
    async signInAnonymously(): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const auth = inject(Auth);
            await signInAnonymously(auth);
        });
    }
}
