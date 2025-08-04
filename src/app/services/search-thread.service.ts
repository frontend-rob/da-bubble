import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { ChannelData } from '../interfaces/channel.interface';
import { SearchResult } from '../interfaces/search-result.interface';
import { UserData } from '../interfaces/user.interface';
import { ChatService } from './chat.service';
import { UserLookupService } from './user-lookup.service';

/**
 * Service for searching thread messages and mapping thread data to search results.
 */
@Injectable({
    providedIn: 'root'
})
export class SearchThreadService {
    constructor() { }

    /**
     * Searches for thread messages matching the given term.
     * @param term The search term for thread messages.
     * @param chatService The chat service providing channels and messages.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @param filterMessages Function to filter messages by term.
     * @returns A promise resolving to an array of thread message search results.
     */
    async searchThreads(
        term: string,
        chatService: ChatService,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>,
        filterMessages: (messages: any[], term: string) => any[]
    ): Promise<SearchResult[]> {
        try {
            const channels = await firstValueFrom(chatService.getChannels().pipe(take(1)));
            if (!channels) return [];
            const allResults = await Promise.all(
                channels.map(channel => this.getThreadResultsForChannel(channel, term, chatService, userLookupService, getUserPresenceStatus, filterMessages))
            );
            return allResults.flat();
        } catch (error) {
            console.error('Error in searchThreads:', error);
            return [];
        }
    }

    /**
     * Processes all channels and returns thread search results for each channel.
     * @param channel The channel to process.
     * @param term The search term for thread messages.
     * @param chatService The chat service providing messages.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @param filterMessages Function to filter messages by term.
     * @returns A promise resolving to an array of thread message search results for the channel.
     */
    private async getThreadResultsForChannel(
        channel: ChannelData,
        term: string,
        chatService: ChatService,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>,
        filterMessages: (messages: any[], term: string) => any[]
    ): Promise<SearchResult[]> {
        const messages = await firstValueFrom(chatService.getMessages(channel.channelId).pipe(take(1)));
        if (!messages) return [];
        const parentMessages = this.filterMessagesWithThreads(messages);
        const allThreadResults = await Promise.all(
            parentMessages.map(parentMessage =>
                this.getThreadResultsForParentMessage(parentMessage, channel, term, chatService, userLookupService, getUserPresenceStatus, filterMessages)
            )
        );
        return allThreadResults.flat();
    }

    /**
     * Processes a parent message and returns thread search results for its thread messages.
     * @param parentMessage The parent message to process.
     * @param channel The channel containing the parent message.
     * @param term The search term for thread messages.
     * @param chatService The chat service providing thread messages.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @param filterMessages Function to filter messages by term.
     * @returns A promise resolving to an array of thread message search results for the parent message.
     */
    private async getThreadResultsForParentMessage(
        parentMessage: any,
        channel: ChannelData,
        term: string,
        chatService: ChatService,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>,
        filterMessages: (messages: any[], term: string) => any[]
    ): Promise<SearchResult[]> {
        const threadMessages = await firstValueFrom(chatService.getThreadMessages(channel.channelId, parentMessage.messageId).pipe(take(1)));
        if (!threadMessages) return [];
        const filteredThreadMessages = filterMessages(threadMessages, term);
        const results = await Promise.all(
            filteredThreadMessages.map(threadMessage =>
                this.mapThreadMessageToResult(threadMessage, channel, userLookupService, getUserPresenceStatus, parentMessage)
            )
        );
        return results.filter((r): r is SearchResult => r !== null);
    }

    /**
     * Maps a thread message to a SearchResult object.
     * @param threadMessage The thread message object.
     * @param channel The channel containing the thread message.
     * @param userLookupService The user lookup service for user data.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @param parentMessage The parent message of the thread.
     * @returns A promise resolving to a SearchResult or null if user data is missing.
     */
    private async mapThreadMessageToResult(
        threadMessage: any,
        channel: ChannelData,
        userLookupService: UserLookupService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>,
        parentMessage: any
    ): Promise<SearchResult | null> {
        const [userStatus, userData] = await Promise.all([
            getUserPresenceStatus(threadMessage.uid),
            firstValueFrom(userLookupService.getUserById(threadMessage.uid))
        ]);
        if (!userData) return null;
        return this.toThreadSearchResult(threadMessage, userData, userStatus, channel, parentMessage);
    }

    /**
     * Filters messages that have threads.
     * @param messages Array of messages.
     * @returns Array of messages that have threads.
     */
    filterMessagesWithThreads(messages: any[]): any[] {
        return messages.filter((m: any) => m.hasThread);
    }

    /**
     * Maps thread message data to a search result object.
     * @param threadMessage The thread message data.
     * @param userData The user data of the replier.
     * @param status The user's presence status.
     * @param channel The channel data.
     * @param parentMessage The parent message data.
     * @returns The thread message search result object.
     */
    toThreadSearchResult(
        threadMessage: any,
        userData: UserData,
        status: string | false,
        channel: ChannelData,
        parentMessage: any
    ): SearchResult {
        return {
            type: 'message',
            messageId: threadMessage.messageId,
            messageAuthorId: threadMessage.uid,
            messageContent: threadMessage.text,
            time: threadMessage.timestamp,
            channelId: channel.channelId,
            channelName: channel.channelName,
            userName: userData.userName,
            photoURL: userData.photoURL || '',
            email: userData.email || '',
            status: status || false,
            repliedMessageId: parentMessage.messageId,
            replierName: userData.userName,
            channelDescription: '',
        };
    }
}
