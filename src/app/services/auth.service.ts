// noinspection SpellCheckingInspection

/**
 * Service for handling authentication and user-related operations.
 * Provides methods to register users and save user data to firestore.
 */
import {EnvironmentInjector, inject, Injectable, runInInjectionContext} from '@angular/core';
import {
	Auth,
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	onAuthStateChanged,
	sendPasswordResetEmail,
	signInAnonymously,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	user,
	User
} from '@angular/fire/auth';
import {UserData} from '../interfaces/user.interface';
import {collection, doc, Firestore, getDocs, query, setDoc, Timestamp, where} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {UserDataService} from './user-data.service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	user$: Observable<User | null>;

	constructor(
		private environmentInjector: EnvironmentInjector,
		private firebaseAuth: Auth,
		private userDataService: UserDataService,
	) {
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
	/**
	 * Logs in a user with Firebase Authentication and updates online status.
	 * Ensures the method runs within an Angular injection context.
	 * @param email - The email address of the user.
	 * @param password - The password for the user.
	 * @returns A promise that resolves when the user is successfully logged in.
	 */
	async logIn(email: string, password: string): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const auth = inject(Auth);
			const userCredential = await signInWithEmailAndPassword(auth, email, password);

			await this.setUserOnlineStatus(userCredential.user.uid, true);
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

			if (auth.currentUser) {
				await this.setUserOnlineStatus(auth.currentUser.uid, false);
			}

			await runInInjectionContext(this.environmentInjector, async () => {
				await signOut(auth);
			});
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

			const googleData: UserData = {
				uid: auth.currentUser?.uid || '',
				userName: auth.currentUser?.displayName || '',
				email: auth.currentUser?.email || '',
				photoURL: 'assets/img/avatars/av-01.svg',
				createdAt: Timestamp.fromDate(new Date()),
				status: true,
				role: {user: true, admin: false, guest: false, moderator: false}
			};
			this.userDataService.setUserData({
				name: auth.currentUser?.displayName || '',
				email: auth.currentUser?.email || '',
				password: '',
				policy: false
			});
			await this.saveUserToFirestore(auth.currentUser?.uid || '', googleData);
			await this.setUserOnlineStatus(auth.currentUser?.uid || '', true);
		});
	}

	/**
	 * Signs in a user anonymously using Firebase Authentication.
	 * Creates guest user data and saves it to Firestore.
	 * @returns A promise that resolves when the user is successfully signed in and saved.
	 */
	async signInAnonymously(): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const auth = inject(Auth);
			const firestore = inject(Firestore);

			const userCredential = await signInAnonymously(auth);
			const uid = userCredential.user.uid;

			const guestData = this.createGuestData(uid);
			await this.saveGuestDataToFirestore(firestore, uid, guestData);
			await this.setUserOnlineStatus(userCredential.user.uid, true);
		});
	}

	/**
	 * Checks if an email address is already registered in the Firestore database.
	 *
	 * This function queries the 'users' collection in Firestore to determine if the
	 * provided email address exists. The email is normalized (trimmed and converted
	 * to lowercase) before the query.
	 *
	 * @param email - The email address to check.
	 * @returns A promise that resolves to true if the email exists, otherwise false.
	 */
	async isEmailRegistered(email: string): Promise<boolean> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);

			try {
				const normalizedEmail = email.trim().toLowerCase();
				const usersCollection = collection(firestore, 'users');
				const querySnapshot = await getDocs(query(usersCollection, where('email', '==', normalizedEmail)));
				return !querySnapshot.empty;
			} catch {
				return false;
			}
		});
	}

	/**
	 * Updates the user's status in Firestore.
	 * @param uid - The unique ID of the user.
	 * @param status - The status to set (true for online, false for offline).
	 */
	async setUserOnlineStatus(uid: string, status: boolean): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const userRef = doc(firestore, `users/${uid}`);
			await setDoc(userRef, {status}, {merge: true});

			this.broadcastUserStatusChange(uid, status);
		});
	}

	/**
	 * Creates guest user data for anonymous authentication.
	 * @param uid - The unique ID of the guest user.
	 * @returns A UserData object containing guest user information.
	 */
	private createGuestData(uid: string): UserData {
		return {
			uid,
			userName: 'Guest',
			email: `guest-${uid}@dabubble-app.firebaseapp.com`,
			photoURL: 'assets/img/avatars/av-01.svg',
			createdAt: Timestamp.fromDate(new Date()),
			status: true,
			role: {user: false, admin: false, guest: true, moderator: false}
		};
	}

	/**
	 * Saves guest user data to Firestore.
	 * @param firestore - The Firestore instance.
	 * @param uid - The unique ID of the guest user.
	 * @param guestData - The guest user data to save.
	 * @returns A promise that resolves when the data is successfully saved.
	 */
	private async saveGuestDataToFirestore(firestore: Firestore, uid: string, guestData: UserData): Promise<void> {
		await runInInjectionContext(this.environmentInjector, async () => {
			const userRef = doc(firestore, `users/${uid}`);
			await setDoc(userRef, guestData);
		});
	}

	/**
	 * Initializes the authentication state listener and sets up online/offline status monitoring.
	 */
	initializeAuthStateListener(): void {
		return runInInjectionContext(this.environmentInjector, () => {
			const auth = inject(Auth);

			onAuthStateChanged(auth, async (user) => {
				if (user) {
					await this.setUserOnlineStatus(user.uid, true);
					this.setupOfflineStatusListener(user.uid);
					this.setupVisibilityListener(user.uid);
				}
			});
		});
	}

	/**
	 * Broadcasts user status change for real-time updates across the app.
	 * This can be extended to use a messaging system or state management.
	 * @param uid - The unique ID of the user.
	 * @param status - The new status.
	 */
	private broadcastUserStatusChange(uid: string, status: boolean): void {
		console.info(`User ${uid} status changed to ${status ? 'online' : 'offline'}`);
	}

	/**
	 * Sets up listeners for when the user goes offline.
	 */
	private setupOfflineStatusListener(uid: string): void {
		window.addEventListener('beforeunload', () => {
			this.setUserOnlineStatus(uid, false).then(r => console.info(r, 'beforeunload event fired. status set to offline.'));
		});

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				this.setUserOnlineStatus(uid, false).then(r => console.info(r, 'visibilitychange event fired. status set to offline.'));
			} else if (document.visibilityState === 'visible') {
				this.setUserOnlineStatus(uid, true).then(r => console.info(r, 'visibilitychange event fired. status set to online.'));
			}
		});
	}

	/**
	 * Enhanced visibility listener for better online/offline detection.
	 */
	private setupVisibilityListener(uid: string): void {
		window.addEventListener('online', () => {
			this.setUserOnlineStatus(uid, true).then(r => console.info(r, 'online event fired. status set to online.'));
		});

		window.addEventListener('offline', () => {
			this.setUserOnlineStatus(uid, false).then(r => console.info(r, 'offline event fired. status set to offline.'));
		});

		window.addEventListener('focus', () => {
			this.setUserOnlineStatus(uid, true).then(r => console.info(r, 'focus event fired. status set to online.'));
		});

		window.addEventListener('blur', () => {
			setTimeout(() => {
				if (document.visibilityState === 'hidden') {
					this.setUserOnlineStatus(uid, false).then(r => console.info(r, 'blur event fired. status set to offline.'));
				}
			}, 5000); // 5 Sekunden Delay
		});
	}
}
