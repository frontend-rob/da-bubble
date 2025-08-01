import {Timestamp} from '@angular/fire/firestore';

export interface ChannelData {
	/**
	 * Unique identifier for the channel.
	 * Used internally to reference the channel in the database.
	 */
	channelId: string;

	/**
	 * The type of communication channel (group channel or direct message).
	 */
	channelType: ChannelType;
	/**
	 * The display name of the channel shown to users.
	 * Example: "Developer Team".
	 */
	channelName: string;

	/**
	 * A short description of the channel’s purpose or topic.
	 * Helpful for organizing channels and onboarding users.
	 */
	channelDescription: string;

	/**
	 * UID of the user who created the channel.
	 * Can be used to identify the owner or assign administrative rights.
	 */
	createdBy: string;

	/**
	 * A list of user UIDs who are members of the channel.
	 * This array is updated as users join or leave.
	 */
	channelMembers: string[];

	/**
	 * Firestore timestamp indicating when the channel was created.
	 */
	createdAt: Timestamp;

	/**
	 * Firestore timestamp of the last update to the channel (e.g., name or members).
	 */
	updatedAt: Timestamp;
}

/**
 * Defines the type of a communication channel.
 * Used to distinguish between group channels and direct messages.
 */
export interface ChannelType {
	/**
	 * Indicates if this is a group channel.
	 * True for channels that can have multiple members.
	 */
	channel: boolean;

	/**
	 * Indicates if this is a direct message channel.
	 * True for private conversations between two users.
	 */
	directMessage: boolean;
}
