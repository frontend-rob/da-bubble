import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Component, inject, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UserDataService} from '../../services/user-data.service';
import {NotificationsComponent} from '../notifications/notifications.component';
import {UserData} from '../../interfaces/user.interface';
import {Timestamp} from 'firebase/firestore';
import {AuthService} from '../../services/auth.service';

/**
 * Component for managing user avatar selection during onboarding.
 * Allows users to choose an avatar and create an account.
 */
@Component({
	selector: 'app-avatars',
	imports: [
		CommonModule,
		NotificationsComponent,
		NgOptimizedImage
	],
	templateUrl: './avatars.component.html',
	styleUrls: ['./avatars.component.scss']
})
export class AvatarsComponent {
	/**
	 * Reference to the notification component for displaying messages.
	 */
	@ViewChild('notification') notificationComponent!: NotificationsComponent;

	/**
	 * The currently selected avatar image path.
	 */
	selectedUserAvatar: string = 'assets/img/avatars/av-00.svg';

	/**
	 * The name of the user, retrieved from the UserDataService.
	 */
	userName: string = '';

	/**
	 * List of available avatar image paths.
	 */
	avatarList: string[] = [
		'assets/img/avatars/av-01.svg',
		'assets/img/avatars/av-02.svg',
		'assets/img/avatars/av-03.svg',
		'assets/img/avatars/av-04.svg',
		'assets/img/avatars/av-05.svg',
		'assets/img/avatars/av-06.svg',
	];

	/**
	 * Status flag to enable or disable avatar selection.
	 */
	status: boolean = true;

	/**
	 * Injecting services using Angular's inject() function.
	 */
	private authService = inject(AuthService);
	private userDataService = inject(UserDataService);
	private router = inject(Router);

	/**
	 * Handles avatar selection by updating the selected avatar and storing it in the UserDataService.
	 * @param path - The path of the selected avatar image.
	 */
	selectedAvatar(path: string): void {
		if (this.status) {
			this.selectedUserAvatar = path;
			this.userDataService.setAvatar(path);
		}
	}

	/**
	 * Returns the CSS classes for the selected avatar image.
	 * @returns An object containing the CSS class mappings.
	 */
	getAvatarClass(): { [key: string]: boolean } {
		return {
			'avatar-img': this.selectedUserAvatar !== 'assets/img/avatars/av-00.svg',
			'person-circle-img': this.selectedUserAvatar === 'assets/img/avatars/av-00.svg'
		};
	}

	/**
	 * Handles the account creation process by registering the user in Firebase Authentication and saving their data to Firestore.
	 */
	async createAccount() {
		try {
			const userData = this.userDataService.getUserData();
			const uid = await this.registerUserInFirebase(userData.email, userData.password);
			await this.saveUserDataToFirestore(uid, userData);
			this.showSuccessNotification();
		} catch (error) {
			console.error('Error creating account:', error);
		}
	}

	/**
	 * Navigates back to the previous page in the browser history.
	 */
	navigateBack() {
		window.history.back();
	}

	/**
	 * Registers the user in Firebase Authentication.
	 * @param email - The user's email address.
	 * @param password - The user's password.
	 * @returns The UID of the registered user.
	 */
	private async registerUserInFirebase(email: string, password: string): Promise<string> {
		return this.authService.registerUser(email, password);
	}

	/**
	 * Saves the user data to Firestore.
	 * @param uid - The UID of the user.
	 * @param userData - The user data to save.
	 */
	private async saveUserDataToFirestore(uid: string, userData: {
		name: string;
		email: string;
		avatar: string
	}): Promise<void> {
		const user: UserData = {
			uid,
			userName: userData.name,
			email: userData.email,
			photoURL: this.selectedUserAvatar,
			createdAt: Timestamp.fromDate(new Date()),
			status: true,
			role: {user: true, admin: false, guest: false, moderator: false}
		};
		await this.authService.saveUserToFirestore(uid, user);
	}

	/**
	 * Displays a success notification and resets user data.
	 */
	private showSuccessNotification(): void {
		this.notificationComponent.showNotification('Account successfully created!');
		setTimeout(() => {
			this.userDataService.resetUserData();
			this.selectedUserAvatar = 'assets/img/avatars/av-00.svg';
			this.router.navigate(['']).then(r => {
				console.log(r, 'navigated to login');
			});
		}, 3000);
	}
}
