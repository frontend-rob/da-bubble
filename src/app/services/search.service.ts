import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { BehaviorSubject, firstValueFrom, take } from 'rxjs';
import { Database, get, ref } from '@angular/fire/database';
import { SearchResult } from '../interfaces/search-result.interface';
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { UserLookupService } from './user-lookup.service';
import { SearchUserService } from './search-user.service';
import { SearchChannelService } from './search-channel.service';
import { SearchThreadService } from './search-thread.service';
import { SearchMessageService } from './search-message.service';

export interface CategorizedSearchResults {
    messages: SearchResult[];
    directMessages: SearchResult[];
    channels: SearchResult[];
    threads: SearchResult[];
    users: SearchResult[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
    private chatService = inject(ChatService);
    private userService = inject(UserService);
    private userLookupService = inject(UserLookupService);
    private database = inject(Database);
    private environmentInjector = inject(EnvironmentInjector);
    private searchUserService = inject(SearchUserService);
    private searchChannelService = inject(SearchChannelService);
    private searchThreadService = inject(SearchThreadService);
    private searchMessageService = inject(SearchMessageService);
    private searchTermSubject = new BehaviorSubject<string>('');
    public searchTerm$ = this.searchTermSubject.asObservable();
    private searchResultsSubject = new BehaviorSubject<CategorizedSearchResults>(this.emptyResults());
    public searchResults$ = this.searchResultsSubject.asObservable();

    constructor() {
        this.searchTerm$.subscribe(term => this.handleSearch(term.trim()));
    }

    /**
     * Sets the current search term and triggers a search.
     * @param term The search term to use.
     */
    setSearchTerm(term: string): void {
        this.searchTermSubject.next(term);
    }

    /**
     * Handles the search logic based on the current term.
     * @param term The search term to process.
     */
    private async handleSearch(term: string): Promise<void> {
        if (!term) return this.clearResults();
        if (term.startsWith('#')) return this.setResults({ ...this.emptyResults(), channels: await this.searchChannels(term.slice(1)) });
        if (term.startsWith('@')) return this.setResults({ ...this.emptyResults(), users: await this.searchUsers(term.slice(1)) });
        await this.searchAll(term);
    }

    /**
     * Executes all search types in parallel and updates the results.
     * @param term The search term to use for all categories.
     */
    private async searchAll(term: string): Promise<void> {
        try {
            const [messages, directMessages, channels, threads, users] = await Promise.all([
                this.searchMessages(term),
                this.searchDirectMessages(term),
                this.searchChannels(term),
                this.searchThreads(term),
                this.searchUsers(term),
            ]);
            this.setResults({ messages, directMessages, channels, threads, users });
        } catch (error) {
            console.error('Error in searchAll:', error);
            this.clearResults();
        }
    }

    /**
     * Updates the observable with new search results.
     * @param results The categorized search results.
     */
    private setResults(results: CategorizedSearchResults): void {
        this.searchResultsSubject.next(results);
    }

    /**
     * Clears all search results.
     */
    private clearResults(): void {
        this.setResults(this.emptyResults());
    }

    /**
     * Returns an empty result object for all categories.
     */
    private emptyResults(): CategorizedSearchResults {
        return { messages: [], directMessages: [], channels: [], threads: [], users: [] };
    }

    
    /**
     * Searches for users matching the given term.
     * @param term The search term for users.
     * @returns A promise resolving to an array of user search results.
     */
    private async searchUsers(term: string): Promise<SearchResult[]> {
        return this.searchUserService.searchUsers(
            term,
            this.userService,
            this.getUserPresenceStatus.bind(this)
        );
    }
    /**
     * Searches for channels matching the given term.
     * @param term The search term for channels.
     * @returns A promise resolving to an array of channel search results.
     */
    private async searchChannels(term: string): Promise<SearchResult[]> {
        return this.searchChannelService.searchChannels(
            term,
            this.chatService
        );
    }
    /**
     * Searches for messages in channels matching the given term.
     * @param term The search term for messages.
     * @returns A promise resolving to an array of message search results.
     */
    private async searchMessages(term: string): Promise<SearchResult[]> {
        return this.searchMessageService.searchMessages(
            term,
            this.chatService,
            this.userLookupService,
            this.getUserPresenceStatus.bind(this)
        );
    }
    /**
     * Searches for direct messages matching the given term.
     * @param term The search term for direct messages.
     * @returns A promise resolving to an array of direct message search results.
     */
    private async searchDirectMessages(term: string): Promise<SearchResult[]> {
        return this.searchMessageService.searchDirectMessages(
            term,
            this.chatService,
            this.userService,
            this.userLookupService,
            this.getUserPresenceStatus.bind(this)
        );
    }
    /**
     * Searches for thread messages matching the given term.
     * @param term The search term for thread messages.
     * @returns A promise resolving to an array of thread message search results.
     */
    private async searchThreads(term: string): Promise<SearchResult[]> {
        return this.searchThreadService.searchThreads(
            term,
            this.chatService,
            this.userLookupService,
            this.getUserPresenceStatus.bind(this),
            this.searchMessageService.filterMessages.bind(this.searchMessageService)
        );
    }
    
    /**
     * Gets the presence status of a user by UID.
     * @param uid The user ID.
     * @returns The presence status or false if not available.
     */
    private async getUserPresenceStatus(uid: string): Promise<'online' | 'away' | 'offline' | false> {
        return runInInjectionContext(this.environmentInjector, async () => {
            try {
                const presenceRef = ref(this.database, `presence/${uid}`);
                const snapshot = await get(presenceRef);
                return snapshot.val()?.status ?? false;
            } catch (error) {
                console.error('Error getting user presence:', error);
                return false;
            }
        });
    }
}
