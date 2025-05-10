import {Timestamp} from 'firebase/firestore';

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
     * The user's presence status.
     * Can be 'online' or 'offline'. Designed to be extensible to support other statuses
     * such as 'away', 'busy', or 'invisible' in the future.
     */
    status?: 'online' | 'offline';

    /**
     * The role of the user in the system.
     * Can be 'user', 'admin', 'moderator', 'guest', etc. (optional).
     */
    role?: 'user' | 'admin' | 'moderator' | 'guest';

}
