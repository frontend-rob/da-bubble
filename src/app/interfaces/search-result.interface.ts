import {Timestamp} from '@angular/fire/firestore';

/**
 * The structure of a search result item, returned when searching across users, messages or channels.
 */
export interface SearchResult {
    /**
     * The type of the search result. It could be any string that represents the entity type.
     * Could be 'user', 'channels', 'message', 'other', etc.
     * Determines the entity that this result represents.
     */
    type: 'user' | 'channels' | 'message' | 'other';

    // -----------------------------------------------------------------------------------------------
    // ** User-Related Fields (For results related to users) **
    // -----------------------------------------------------------------------------------------------

    /**
     * The unique identifier (ID) of the user (applicable only when type is 'user').
     * This ID differentiates users within the system.
     */
    uid?: string;

    /**
     * The username of the user (applicable only when type is 'user').
     * Represents the name the user has chosen, used in profiles and messages.
     */
    userName?: string;

    /**
     * The user's email address (applicable only when type is 'user').
     * Must be in a valid email format. Unique to each user.
     */
    email?: string;

    /**
     * The URL of the user's profile picture (applicable only when type is 'user').
     * Can be `null` if the user hasn't uploaded a profile picture.
     */
    photoURL?: string;

    /**
     * The status of the user (optional, applicable only when type is 'user').
     * Could be 'online', 'offline', or other future states.
     */
    status?: 'online' | 'offline';

    // -----------------------------------------------------------------------------------------------
    // ** Channel-Related Fields (For results related to channels) **
    // -----------------------------------------------------------------------------------------------

    /**
     * The unique ID of the channel (applicable only when type is 'channel').
     * Represents the unique identifier of a channel.
     */
    channelId?: string;

    /**
     * The name of the channel (applicable only when type is 'channel').
     * Represents the name of the channel, e.g. "general", "support".
     */
    channelName?: string;

    /**
     * A short description of the channel (applicable only when type is 'channel').
     * Provides additional context or information about the channel's purpose.
     */
    channelDescription?: string;

    /**
     * A list of user IDs who are members of the channel (applicable only when type is 'channel').
     * Helps identify members of a specific channel.
     */
    channelMembers?: string[];

    // -----------------------------------------------------------------------------------------------
    // ** Thread-Related Fields (For results related to threads and responses) **
    // -----------------------------------------------------------------------------------------------

    /**
     * The ID of the message being responded to (applicable when type is 'message' and it is a response).
     * Links the reply to the original message in a thread.
     */
    repliedMessageId?: string;

    /**
     * The name of the user responding to the original message (applicable when type is 'message' and it is a response).
     * Identifies the user who is replying to a specific message in a thread.
     */
    replierName?: string;

    /**
     * A list of users who have replied to the original message (applicable when type is 'message' and it is a response).
     * Each user can be identified by their `uid`.
     */
    respondingUsers?: string[];

    // -----------------------------------------------------------------------------------------------
    // ** Message-Related Fields (For results related to messages) **
    // -----------------------------------------------------------------------------------------------

    /**
     * The unique ID of the message (applicable only when type is 'message').
     * Identifies the message uniquely in Firestore.
     */
    messageId?: string;

    /**
     * The unique ID of the message author (applicable only when type is 'message').
     * Represents the sender of the message.
     */
    messageAuthorId?: string;

    /**
     * The content of the message (applicable only when type is 'message').
     * Represents the text content of the message.
     */
    messageContent?: string;

    /**
     * Timestamp of when the message was sent (applicable only when type is 'message').
     * Used to sort or filter messages by time.
     */
    time?: Timestamp;

    // -----------------------------------------------------------------------------------------------
    // ** Direct Message-Related Fields (For results related to direct messages) **
    // -----------------------------------------------------------------------------------------------

    /**
     * The user ID of the other participant in a direct message (applicable when type is 'message' or 'user').
     * Represents the other user involved in the direct conversation.
     */
    directMessageUserId?: string;

    /**
     * The username of the other participant in a direct message (applicable when type is 'message' or 'user').
     * Represents the username of the other user in the direct conversation.
     */
    directMessageUserName?: string;

}
