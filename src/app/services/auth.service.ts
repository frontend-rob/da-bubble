import {EnvironmentInjector, inject, Injectable, OnDestroy, runInInjectionContext} from "@angular/core";
import {debounceTime, filter, fromEvent, merge, Observable, Subject, switchMap, takeUntil, tap, timer, throttleTime} from "rxjs";
import {Database, get, off, onDisconnect, onValue, ref, serverTimestamp, set} from "@angular/fire/database";
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
} from "@angular/fire/auth";
import {UserDataService} from "./user-data.service";
import {UserData} from "../interfaces/user.interface";
import {collection, doc, Firestore, getDocs, query, setDoc, Timestamp, where,} from "@angular/fire/firestore";

/**
 * Represents a user's presence status in the application.
 * Used to track whether users are online, offline, or away.
 */
interface UserPresence {
	/**
	 * The current presence status of the user.
	 * Can be 'online', 'offline', or 'away'.
	 */
	status: 'online' | 'offline' | 'away';
	
	/**
	 * The timestamp when the presence status was last updated.
	 * Used to determine how long a user has been in their current status.
	 */
	timestamp: any;
	
	/**
	 * The timestamp when the user was last seen active in the application.
	 * Used for displaying "last seen" information.
	 */
	lastSeen: any;
}

@Injectable({
	providedIn: "root",
})
export class AuthService implements OnDestroy {
	user$: Observable<User | null>;
	private destroy$ = new Subject<void>();
	private presenceRef: any;

	constructor(
		private environmentInjector: EnvironmentInjector,
		private firebaseAuth: Auth,
		private userDataService: UserDataService,
		private database: Database
	) {
		this.user$ = user(this.firebaseAuth);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.cleanupPresence();
	}

	/**
	 * Sets the online status of a user in the Realtime Database.
	 *
	 * @param {string} uid - The user ID of the user whose presence status is being updated.
	 * @param {('online'|'offline'|'away')} status - The presence status to set ('online', 'offline', or 'away').
	 * @return {Promise<void>} A promise that resolves when the presence status has been updated.
	 */
	async setUserPresence(uid: string, status: 'online' | 'offline' | 'away'): Promise<void> {
		runInInjectionContext(this.environmentInjector, async () => {
			try {
				const presenceRef = ref(this.database, `presence/${uid}`);

				await set(presenceRef, {
					status: status,
					timestamp: serverTimestamp(),
					lastSeen: serverTimestamp()
				});

				console.info(`🔥 Realtime DB: User ${uid} status set to ${status}`);
			} catch (error) {
				console.error('Error setting user presence:', error);
			}
		})
	}

	/**
	 * Initializes the presence monitoring system using the Realtime Database.
	 * Sets up listeners to track user online status and handle connection state changes.
	 *
	 * @return {void} No return value.
	 */
	initializePresenceSystem(): void {
		return runInInjectionContext(this.environmentInjector, () => {
			this.user$.pipe(
				takeUntil(this.destroy$),
				switchMap(async (user) => {
					if (user) {
						await this.setupUserPresence(user.uid);
						this.setupPresenceListeners(user.uid);
						return user;
					} else {
						this.cleanupPresence();
						return null;
					}
				})
			).subscribe();
		});
	}

	/**
	 * Sets a user's online status to either online or offline.
	 * This is a convenience wrapper around setUserPresence that converts a boolean to the appropriate status string.
	 *
	 * @param {string} uid - The user ID of the user whose online status is being updated.
	 * @param {boolean} status - True to set the user as online, false to set as offline.
	 * @return {Promise<void>} A promise that resolves when the status has been updated.
	 */
	async setUserOnlineStatus(uid: string, status: boolean): Promise<void> {
		await this.setUserPresence(uid, status ? 'online' : 'offline');
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
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
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
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);

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
				uid: auth.currentUser?.uid || "",
				userName: auth.currentUser?.displayName || "",
				email: auth.currentUser?.email || "",
				photoURL: "assets/img/avatars/av-01.svg",
				createdAt: Timestamp.fromDate(new Date()),
				role: {
					user: true,
					admin: false,
					guest: false,
					moderator: false,
				},
			};
			this.userDataService.setUserData({
				name: auth.currentUser?.displayName || "",
				email: auth.currentUser?.email || "",
				password: "",
				policy: false,
			});
			await this.saveUserToFirestore(
				auth.currentUser?.uid || "",
				googleData
			);
			await this.setUserOnlineStatus(auth.currentUser?.uid || "", true);
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
				const usersCollection = collection(firestore, "users");
				const querySnapshot = await getDocs(
					query(
						usersCollection,
						where("email", "==", normalizedEmail)
					)
				);
				return !querySnapshot.empty;
			} catch {
				return false;
			}
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
	 * Richtet die Präsenz für einen User ein
	 */
	private async setupUserPresence(uid: string): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const presenceRef = ref(this.database, `presence/${uid}`);
			const connectedRef = ref(this.database, '.info/connected');

			onValue(connectedRef, async (snapshot) => {
				await runInInjectionContext(this.environmentInjector, async () => {
					if (snapshot.val() === true) {
						await runInInjectionContext(this.environmentInjector, async () => {
							await set(presenceRef, {
								status: 'online',
								timestamp: serverTimestamp(),
								lastSeen: serverTimestamp()
							});
						})

						await runInInjectionContext(this.environmentInjector, async () => {
							await onDisconnect(presenceRef).set({
								status: 'offline',
								timestamp: serverTimestamp(),
								lastSeen: serverTimestamp()
							});
						})
					}
				})
			});
			this.presenceRef = presenceRef;
		})
	}

	/**
	 * Sets up event listeners to manage and track user presence based on their activity, connectivity, and browser state.
	 *
	 * @param {string} uid - The unique identifier of the user whose presence is being tracked.
	 * @return {void} No value is returned from this method.
	 */
	private setupPresenceListeners(uid: string): void {
		console.info('🔧 Setting up presence listeners for user:', uid);
		const online$ = fromEvent(window, 'online');
		const offline$ = fromEvent(window, 'offline');

		const focus$ = fromEvent(window, 'focus');
		const blur$ = fromEvent(window, 'blur');
		const beforeUnload$ = fromEvent(window, 'beforeunload');
		const visibilityChange$ = fromEvent(document, 'visibilitychange');

		const click$ = fromEvent(document, 'click');
		const keydown$ = fromEvent(document, 'keydown');

		const mousemove$ = fromEvent(document, 'mousemove', {
		  passive: true 
		}).pipe(
		  throttleTime(1000),
		  debounceTime(300)
		);
		const scroll$ = fromEvent(document, 'scroll', {passive: true});
		const touchstart$ = fromEvent(document, 'touchstart', {passive: true});

		const activity$ = merge(click$, keydown$, mousemove$, scroll$, touchstart$).pipe(
			debounceTime(1000),
			tap(() => console.info())
		);

		offline$.pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.setUserPresence(uid, 'offline');
		});

		online$.pipe(
			takeUntil(this.destroy$),
			debounceTime(500)
		).subscribe(() => {
			this.setUserPresence(uid, 'online');
		});

		focus$.pipe(
			takeUntil(this.destroy$),
			debounceTime(300)
		).subscribe(() => {
			this.setUserPresence(uid, 'online');
		});

		visibilityChange$.pipe(
			takeUntil(this.destroy$),
			debounceTime(300),
			filter(() => document.visibilityState === 'visible')
		).subscribe(() => {
			this.setUserPresence(uid, 'online');
		});

		activity$.pipe(
			takeUntil(this.destroy$),
			switchMap(async () => {
				return await this.getCurrentUserPresence(uid);
			})
		).subscribe((currentPresence) => {
			if (currentPresence?.status === 'away') {
				this.setUserPresence(uid, 'online');
			}
		});

		blur$.pipe(
			takeUntil(this.destroy$),
			switchMap(() => {
				const awayTimer$ = timer(30000).pipe(
					tap(() => {
						if (document.visibilityState === 'hidden') {
							this.setUserPresence(uid, 'away');
						}
					})
				);

				return merge(awayTimer$).pipe(
					takeUntil(focus$),
					takeUntil(activity$)
				);
			})
		).subscribe();

		beforeUnload$.pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.setUserPresence(uid, 'offline');
		});
	}

	/**
	 * Räumt Präsenz-Referenzen auf
	 */
	private cleanupPresence(): void {
		if (this.presenceRef) {
			off(this.presenceRef);
			this.presenceRef = null;
		}
	}

	/**
	 * Creates guest user data for anonymous authentication.
	 * @param uid - The unique ID of the guest user.
	 * @returns A UserData object containing guest user information.
	 */
	private createGuestData(uid: string): UserData {
		return {
			uid,
			userName: "Guest",
			email: `guest-${uid}@dabubble-app.firebaseapp.com`,
			photoURL: "assets/img/avatars/av-01.svg",
			createdAt: Timestamp.fromDate(new Date()),
			role: {user: false, admin: false, guest: true, moderator: false},
		};
	}

	/**
	 * Saves guest user data to Firestore.
	 * @param firestore - The Firestore instance.
	 * @param uid - The unique ID of the guest user.
	 * @param guestData - The guest user data to save.
	 * @returns A promise that resolves when the data is successfully saved.
	 */
	private async saveGuestDataToFirestore(
		firestore: Firestore,
		uid: string,
		guestData: UserData
	): Promise<void> {
		await runInInjectionContext(this.environmentInjector, async () => {
			const userRef = doc(firestore, `users/${uid}`);
			await setDoc(userRef, guestData);
		});
	}

	/**
	 * Sets up listeners for when the user goes offline using RxJS.
	 */
	private setupOfflineStatusListener(uid: string): void {
		const beforeUnload$ = fromEvent(window, 'beforeunload');

		beforeUnload$.pipe(
			takeUntil(this.destroy$)
		).subscribe(() => {
			this.setUserOnlineStatus(uid, false).then(r =>
				console.info(r, 'RxJS: beforeunload event fired. status set to offline.')
			);
		});
	}

	/**
	 * Enhanced visibility listener for better online/offline detection using RxJS.
	 */
	private setupVisibilityListener(uid: string): void {
		const online$ = fromEvent(window, 'online');
		const offline$ = fromEvent(window, 'offline');

		const blur$ = fromEvent(window, 'blur');

		online$.pipe(
			takeUntil(this.destroy$),
			debounceTime(100)
		).subscribe(() => {
			this.setUserOnlineStatus(uid, true).then(r =>
				console.info(r, 'RxJS: online event fired. status set to online.')
			);
		});

		offline$.pipe(
			takeUntil(this.destroy$),
			debounceTime(100)
		).subscribe(() => {
			this.setUserOnlineStatus(uid, false).then(r =>
				console.info(r, 'RxJS: offline event fired. status set to offline.')
			);
		});

		blur$.pipe(
			takeUntil(this.destroy$),
			debounceTime(50000) // 5 Sekunden Delay
		).subscribe(() => {
			if (document.visibilityState === 'hidden') {
				this.setUserOnlineStatus(uid, false).then(r =>
					console.info(r, 'RxJS: blur event fired. status set to offline.')
				);
			}
		});
	}

	/**
	 * Holt den aktuellen Präsenz-Status eines Users (einmalig)
	 */
	private async getCurrentUserPresence(uid: string): Promise<UserPresence | null> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const presenceRef = ref(this.database, `presence/${uid}`);

			const snapshot = await get(presenceRef);
			return snapshot.val();
		})
	}
}
