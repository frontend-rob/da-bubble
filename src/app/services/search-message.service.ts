import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { ChannelData } from '../interfaces/channel.interface';
import { SearchResult } from '../interfaces/search-result.interface';
import { UserData } from '../interfaces/user.interface';
import { ChatService } from './chat.service';
import { UserLookupService } from './user-lookup.service';

/**
 * Service for searching messages and direct messages, and mapping message data to search results.
 */
@Injectable({
    providedIn: 'root'
})
export class SearchMessageService {
    constructor() { }

    /**
     * Searches for messages in channels matching the given term.
     * @param term The search term for messages.
     * @param chatService The chat service providing channels and messages.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @returns A promise resolving to an array of message search results.
     */
    async searchMessages(
        term: string,
        chatService: ChatService,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>
    ): Promise<SearchResult[]> {
        try {
            const channels = await firstValueFrom(chatService.getChannels().pipe(take(1)));
            if (!channels) return [];
            const realChannels = channels.filter(ch => !ch.channelType.directMessage);
            const allResults = await Promise.all(
                realChannels.map(channel => this.getMessageResultsForChannel(channel, term, chatService, userLookupService, getUserPresenceStatus))
            );
            return allResults.flat();
        } catch (error) {
            console.error('Error in searchMessages:', error);
            return [];
        }
    }

    private async getMessageResultsForChannel(
        channel: ChannelData,
        term: string,
        chatService: ChatService,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>
    ): Promise<SearchResult[]> {
        const messages = await firstValueFrom(chatService.getMessages(channel.channelId).pipe(take(1)));
        if (!messages) return [];
        const filteredMessages = this.filterMessages(messages, term);
        const results = await Promise.all(
            filteredMessages.map(message =>
                this.mapChannelMessageToResult(message, channel, userLookupService, getUserPresenceStatus)
            )
        );
        return results.filter((r): r is SearchResult => r !== null);
    }

    /**
     * Maps a channel message to a SearchResult object.
     * @param message The message object.
     * @param channel The channel containing the message.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @returns A promise resolving to a SearchResult or null if user data is missing.
     */
    private async mapChannelMessageToResult(
        message: any,
        channel: ChannelData,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>
    ): Promise<SearchResult | null> {
        const [userStatus, userData] = await Promise.all([
            getUserPresenceStatus(message.uid),
            firstValueFrom(userLookupService.getUserById(message.uid))
        ]);
        if (!userData) return null;
        return this.toMessageSearchResult(message, userData, userStatus, channel);
    }

    /**
     * Searches for direct messages matching the given term.
     * @param term The search term for direct messages.
     * @param chatService The chat service providing channels and messages.
     * @param userService The user service providing the current user.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @returns A promise resolving to an array of direct message search results.
     */
    async searchDirectMessages(
        term: string,
        chatService: ChatService,
        userService: { currentUser$: any },
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>
    ): Promise<SearchResult[]> {
        try {
            const channels = await firstValueFrom(chatService.getChannels().pipe(take(1)));
            if (!channels) return [];
            const dmChannels = channels.filter((ch: any) => ch.channelType.directMessage);
            const currentUser: UserData = await firstValueFrom(userService.currentUser$.pipe(take(1)));
            if (!currentUser) return [];
            const allResults = await Promise.all(
                dmChannels.map(channel => this.getDirectMessageResultsForChannel(channel, term, chatService, userLookupService, getUserPresenceStatus, currentUser))
            );
            return allResults.flat();
        } catch (error) {
            console.error('Error in searchDirectMessages:', error);
            return [];
        }
    }

    private async getDirectMessageResultsForChannel(
        channel: ChannelData,
        term: string,
        chatService: ChatService,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>,
        currentUser: UserData
    ): Promise<SearchResult[]> {
        const messages = await firstValueFrom(chatService.getMessages(channel.channelId).pipe(take(1)));
        if (!messages) return [];
        const otherUserId = channel.channelMembers.find((m: string) => m !== currentUser.uid);
        if (!otherUserId) return [];
        const otherUserData = await firstValueFrom(userLookupService.getUserById(otherUserId));
        const filteredMessages = this.filterMessages(messages, term);
        const results = await Promise.all(
            filteredMessages.map(message =>
                this.mapDirectMessageToResult(message, channel, userLookupService, getUserPresenceStatus, otherUserId, otherUserData)
            )
        );
        return results.filter((r): r is SearchResult => r !== null);
    }

    /**
     * Maps a direct message to a SearchResult object.
     * @param message The direct message object.
     * @param channel The channel containing the message.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @param otherUserId The UID of the other user in the direct message.
     * @param otherUserData The user data of the other user.
     * @returns A promise resolving to a SearchResult or null if user data is missing.
     */
    private async mapDirectMessageToResult(
        message: any,
        channel: ChannelData,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>,
        otherUserId: string,
        otherUserData?: UserData
    ): Promise<SearchResult | null> {
        const [userStatus, userData] = await Promise.all([
            getUserPresenceStatus(message.uid),
            firstValueFrom(userLookupService.getUserById(message.uid))
        ]);
        if (!userData) return null;
        return this.toDirectMessageSearchResult(message, userData, userStatus, channel, otherUserId, otherUserData);
    }

    /**
     * Filters messages by the given term.
     * @param messages Array of messages.
     * @param term The search term.
     * @returns Filtered array of messages.
     */
    filterMessages(messages: any[], term: string): any[] {
        const lowerTerm = term.toLowerCase();
        return messages.filter((m: any) => m.text.toLowerCase().includes(lowerTerm));
    }

    /**
     * Maps message data to a search result object.
     * @param message The message data.
     * @param userData The user data of the author.
     * @param status The user's presence status.
     * @param channel The channel data.
     * @returns The message search result object.
     */
    toMessageSearchResult(
        message: any,
        userData: UserData,
        status: string | false,
        channel: ChannelData
    ): SearchResult {
        return {
            type: 'message',
            messageId: message.messageId,
            messageAuthorId: message.uid,
            messageContent: message.text,
            time: message.timestamp,
            channelId: channel.channelId,
            channelName: channel.channelName,
            userName: userData.userName,
            photoURL: userData.photoURL || '',
            email: userData.email || '',
            status: status || false,
            channelDescription: '',
        };
    }

    /**
     * Maps direct message data to a search result object.
     * @param message The direct message data.
     * @param userData The user data of the author.
     * @param status The user's presence status.
     * @param channel The channel data.
     * @param otherUserId The UID of the other user in the direct message.
     * @param otherUserData The user data of the other user.
     * @returns The direct message search result object.
     */
    toDirectMessageSearchResult(
        message: any,
        userData: UserData,
        status: string | false,
        channel: ChannelData,
        otherUserId: string,
        otherUserData?: UserData
    ): SearchResult {
        return {
            type: 'message',
            messageId: message.messageId,
            messageAuthorId: message.uid,
            messageContent: message.text,
            time: message.timestamp,
            channelId: channel.channelId,
            channelName: channel.channelName,
            userName: userData.userName,
            photoURL: userData.photoURL || '',
            email: userData.email || '',
            status: status || false,
            directMessageUserId: otherUserId,
            directMessageUserName: otherUserData?.userName || '',
            channelDescription: '',
        };
    }
}
