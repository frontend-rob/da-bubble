import {Timestamp} from '@angular/fire/firestore';

/**
 * Firestore model for a registered user including identity, profile, and status.
 */
export interface UserData {
	/**
	 * The unique Firebase Authentication user ID.
	 * Used to identify the user across the application and in Firestore.
	 */
	uid: string;

	/**
	 * The name of the user.
	 * This is shown in the UI for messages, profiles, etc.
	 */
	userName: string;

	/**
	 * The user's email address.
	 * Must be unique and in a valid email format.
	 */
	email: string;

	/**
	 * The URL to the user's profile picture.
	 * Required during registration to ensure visual identification.
	 */
	photoURL: string;

	/**
	 * The timestamp of when the user was created in Firestore.
	 * Used for sorting, auditing, or showing "member since" data.
	 */
	createdAt: Timestamp;

	/**
	 * The role of the user in the system.
	 * Can be 'user', 'admin', 'moderator', 'guest', etc. (optional).
	 */
	role: userRole;
}

/**
 * Defines the possible roles a user can have in the system.
 * Each role is represented as a boolean flag that can be enabled or disabled.
 */
export interface userRole {
	/**
	 * Indicates if the user has standard user privileges.
	 * Regular users can participate in channels and send messages.
	 */
	user: boolean;

	/**
	 * Indicates if the user has administrative privileges.
	 * Admins can manage users, channels, and system settings.
	 */
	admin: boolean;

	/**
	 * Indicates if the user has moderator privileges.
	 * Moderators can manage content and enforce community guidelines.
	 */
	moderator: boolean;

	/**
	 * Indicates if the user is a guest with limited privileges.
	 * Guests typically have read-only access or other restrictions.
	 */
	guest: boolean;
}
