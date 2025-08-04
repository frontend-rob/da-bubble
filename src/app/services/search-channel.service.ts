import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { ChannelData } from '../interfaces/channel.interface';
import { SearchResult } from '../interfaces/search-result.interface';
import { ChatService } from './chat.service';

/**
 * Service for searching channels by term and mapping channel data to search results.
 */
@Injectable({
    providedIn: 'root'
})
export class SearchChannelService {
    constructor() { }

    /**
     * Searches for channels matching the given term.
     * @param term The search term for channels.
     * @param chatService The chat service providing all channels.
     * @returns A promise resolving to an array of channel search results.
     */
    async searchChannels(
        term: string,
        chatService: ChatService
    ): Promise<SearchResult[]> {
        try {
            const channels = await firstValueFrom(chatService.getChannels().pipe(take(1)));
            if (!channels) return [];
            return this.filterChannels(channels, term).map(this.toChannelSearchResult);
        } catch (error) {
            console.error('Error in searchChannels:', error);
            return [];
        }
    }

    /**
     * Filters channels by the given term.
     * @param channels Array of channel data.
     * @param term The search term.
     * @returns Filtered array of channels.
     */
    private filterChannels(channels: ChannelData[], term: string): ChannelData[] {
        if (!term) return channels;
        const lowerTerm = term.toLowerCase();
        return channels.filter(ch =>
            ch.channelName.toLowerCase().includes(lowerTerm) || (ch.channelDescription?.toLowerCase().includes(lowerTerm) ?? false)
        );
    }

    /**
     * Maps channel data to a search result object.
     * @param channel The channel data.
     * @returns The channel search result object.
     */
    private toChannelSearchResult = (channel: ChannelData): SearchResult => ({
        type: 'channels',
        channelId: channel.channelId,
        channelName: channel.channelName,
        channelDescription: channel.channelDescription || '',
        channelMembers: channel.channelMembers,
        userName: '',
        photoURL: '',
        status: false,
        email: '',
    });
}
