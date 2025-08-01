import {Timestamp} from "firebase/firestore";

/**
 * Represents a user's reaction to a message.
 * Used to track emoji reactions and who added them.
 */
export interface Reaction {
	/**
	 * The emoji character or code used for the reaction.
	 */
	emoji: string;
	
	/**
	 * The unique ID of the user who added the reaction.
	 */
	userId: string;
	
	/**
	 * The display name of the user who added the reaction.
	 */
	userName: string;
	
	/**
	 * The timestamp when the reaction was added.
	 * Optional as it may not be tracked in all cases.
	 */
	timestamp?: Timestamp;
}

/**
 * Represents a chat message in the application.
 * Contains the message content and metadata.
 */
export interface Message {
	/**
	 * The text content of the message.
	 */
	text: string;
	
	/**
	 * The unique ID of the user who sent the message.
	 */
	uid: string;
	
	/**
	 * The Firestore timestamp when the message was sent.
	 */
	timestamp: Timestamp;
	
	/**
	 * The formatted time string for display purposes.
	 */
	time: string;
	
	/**
	 * The formatted date string for display purposes.
	 */
	date: string;
	
	/**
	 * Array of reactions added to this message.
	 */
	reactions: Reaction[];
	
	/**
	 * Indicates whether the message has been edited after initial sending.
	 */
	edited: boolean;
	
	/**
	 * Indicates whether this message has a thread of replies.
	 */
	hasThread?: boolean;
	
	/**
	 * The formatted time string of the last activity in the thread.
	 */
	threadLastTime?: string;
	
	/**
	 * The number of replies in the thread.
	 */
	threadAnswerCount?: number;
}

/**
 * Extends the Message interface to include a message ID.
 * Used when retrieving messages from the database with their IDs.
 */
export interface IdtMessages extends Message {
	/**
	 * The unique identifier for the message in the database.
	 * Optional as it may not be available before the message is saved.
	 */
	messageId?: string;
}
