import {Timestamp} from '@angular/fire/firestore';

/**
 * Represents a communication channel within the application.
 * Can be used for public discussions, private groups, or direct chats.
 */
export interface ChannelData {
    /**
     * The type of the channel.
     * Used to distinguish channel behavior and visibility.
     */
    type?: string;

    /**
     * Unique identifier for the channel.
     * Used internally to reference the channel in the database.
     */
    channelId?: string;

    /**
     * The display name of the channel shown to users.
     * Example: "Developer Team".
     */
    channelName: string;

    /**
     * A short description of the channel’s purpose or topic.
     * Helpful for organizing channels and onboarding users.
     */
    channelDescription?: string;

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
