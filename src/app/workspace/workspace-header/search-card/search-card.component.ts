import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { ChannelData } from "../../../interfaces/channel.interface";
import { SearchResult } from "../../../interfaces/search-result.interface";
import { ChatService } from "../../../services/chat.service";
import { CategorizedSearchResults, SearchService, } from "../../../services/search.service";
import { FunctionTriggerService } from "../../../services/function-trigger.service";

/**
 * SearchCardComponent provides search functionality for channels, messages, threads and users.
 */
@Component({
    selector: "app-search-card",
    imports: [
        CommonModule,
        FormsModule,
        NgOptimizedImage,
    ],
    templateUrl: "./search-card.component.html",
    styleUrls: ["./search-card.component.scss"],
})
export class SearchCardComponent implements OnInit, OnDestroy {

    @ViewChild("searchInput", { static: false })
    searchInput!: ElementRef<HTMLInputElement>;
    searchTerm = "";
    isSearching = false;
    showResults = false;
    selectedIndex = -1;
    totalResults = 0;
    searchResults: CategorizedSearchResults = {
        messages: [],
        directMessages: [],
        channels: [],
        threads: [],
        users: [],
    };

    private searchService = inject(SearchService);
    private chatService = inject(ChatService);
    private functionTriggerService = inject(FunctionTriggerService);
    private destroy$ = new Subject<void>();
    private blurTimeout: any;
    private channels: ChannelData[] = [];

    /**
     * Initializes the component and subscribes to channel and search result updates.
     */
    ngOnInit(): void {
        this.subscribeToChannels();
        this.subscribeToSearchResults();
    }

    /**
     * Subscribes to channel updates and stores them in the component.
     * @private
     */
    private subscribeToChannels(): void {
        this.chatService
            .getChannels()
            .pipe(takeUntil(this.destroy$))
            .subscribe((channels) => {
                this.channels = channels;
            });
    }

    /**
     * Subscribes to search result updates and handles result state.
     * @private
     */
    private subscribeToSearchResults(): void {
        this.searchService.searchResults$
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
                this.searchResults = results;
                this.calculateTotalResults();
                this.isSearching = false;

                if (this.searchTerm.trim().length > 0) {
                    this.showResults = true;
                }

            });
    }

    /**
     * Cleans up subscriptions and timeouts on destroy.
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
    }

    /**
    * Handles input changes in the search field.
    * @param event Input event
    */
    onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.updateSearchTerm(target.value);
        this.handleBlurTimeout();

        if (this.isSearchTermEmpty()) {
            this.hideResults();
            return;
        }

        this.startSearch();
    }

    /**
     * Updates the searchTerm property.
     * @param value New search term
     * @private
     */
    private updateSearchTerm(value: string): void {
        this.searchTerm = value;
    }

    /**
     * Clears and resets the blur timeout if active.
     * @private
     */
    private handleBlurTimeout(): void {
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
            this.blurTimeout = null;
        }
    }

    /**
     * Checks if the search term is empty.
     * @returns True if empty, false otherwise
     * @private
     */
    private isSearchTermEmpty(): boolean {
        return this.searchTerm.trim().length === 0;
    }

    /**
     * Hides the search results and resets selection.
     * @private
     */
    private hideResults(): void {
        this.showResults = false;
        this.selectedIndex = -1;
    }

    /**
     * Starts the search and updates state.
     * @private
     */
    private startSearch(): void {
        this.isSearching = true;
        this.showResults = true;
        this.searchService.setSearchTerm(this.searchTerm);
    }

    /**
     * Handles focus event on the search input.
     */
    onSearchFocus(): void {
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
            this.blurTimeout = null;
        }

        if (this.searchTerm.trim().length > 0) {
            this.showResults = true;
        }
    }

    /**
     * Handles blur event on the search input.
     */
    onSearchBlur(): void {
        this.blurTimeout = setTimeout(() => {
            this.showResults = false;
            this.selectedIndex = -1;
        }, 300);
    }

    /**
     * Prevents default mouse down behavior on results.
     * @param event Mouse event
     */
    onResultsMouseDown(event: Event): void {
        event.preventDefault();
    }

    /**
 * Handles keyboard navigation in the search results.
 * @param event Keyboard event
 */
    onKeyDown(event: KeyboardEvent): void {
        if (!this.showResults) return;

        const allResults = this.getAllResultsFlattened();

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.moveSelectionDown(allResults.length);
                break;
            case "ArrowUp":
                event.preventDefault();
                this.moveSelectionUp();
                break;
            case "Enter":
                event.preventDefault();
                this.selectCurrentResult(allResults);
                break;
            case "Escape":
                this.resetSearchSelection();
                break;
        }
    }

    /**
     * Moves the selection down in the results list.
     * @param length Total number of results
     * @private
     */
    private moveSelectionDown(length: number): void {
        this.selectedIndex = Math.min(this.selectedIndex + 1, length - 1);
    }

    /**
     * Moves the selection up in the results list.
     * @private
     */
    private moveSelectionUp(): void {
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
    }

    /**
     * Selects the currently highlighted result.
     * @param results Array of all search results
     * @private
     */
    private selectCurrentResult(results: SearchResult[]): void {
        if (this.selectedIndex >= 0 && this.selectedIndex < results.length) {
            this.selectResult(results[this.selectedIndex]);
        }
    }

    /**
     * Resets the search selection and hides results.
     * @private
     */
    private resetSearchSelection(): void {
        this.showResults = false;
        this.selectedIndex = -1;
        this.searchInput?.nativeElement.blur();
    }

    /**
    * Selects a search result and triggers the appropriate action.
    * @param result Selected search result
    */
    selectResult(result: SearchResult): void {
        this.clearBlurTimeout();
        this.handleResultSelection(result);
        this.resetSearchState();
    }

    /**
     * Clears and resets the blur timeout if active.
     * @private
     */
    private clearBlurTimeout(): void {
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
            this.blurTimeout = null;
        }
    }

    /**
     * Handles the selection logic based on result type.
     * @param result Selected search result
     * @private
     */
    private handleResultSelection(result: SearchResult): void {
        switch (result.type) {
            case "channels":
                this.openChannel(result);
                break;
            case "message":
                this.openMessage(result);
                break;
        }
    }

    /**
     * Resets the search state after selection.
     * @private
     */
    private resetSearchState(): void {
        this.showResults = false;
        this.searchTerm = "";
        this.selectedIndex = -1;
    }

    /**
     * Returns the appropriate placeholder text for the search input.
     */
    getSearchPlaceholder(): string {
        if (this.searchTerm.startsWith("#")) {
            return "Search for channels...";
        } else if (this.searchTerm.startsWith("@")) {
            return "Search for Users...";
        }
        return "Search in Devspace";
    }

    /**
     * Returns true if there are any search results.
     */
    hasResults(): boolean {
        return this.totalResults > 0;
    }

    /**
     * Clears the search input and results.
     */
    clearSearch(): void {

        this.searchTerm = "";
        this.showResults = false;
        this.selectedIndex = -1;
        this.searchService.setSearchTerm("");
    }

    /**
     * Returns debug information about the search state.
     */
    getDebugInfo(): string {
        return ` 
        searchTerm: "${this.searchTerm}"
        showResults: ${this.showResults}
        isSearching: ${this.isSearching}
        totalResults: ${this.totalResults}
        hasResults: ${this.hasResults()}
        `;
    }

    /**
     * Opens the selected channel and triggers the channel selection event.
     * @param result Search result containing channel information
     */
    private openChannel(result: SearchResult): void {
        if (!result.channelId) return;
        this.chatService.setActiveChat(result.channelId);

        const selectedChannel = this.findChannelById(result.channelId);
        if (selectedChannel) {
            this.functionTriggerService.callSelectChannel(selectedChannel);
        }
    }

    /**
    * Opens the selected message, triggers channel selection, and highlights the message in the chat view.
    * @param result Search result containing message information
    * @private
    */
    private openMessage(result: SearchResult): void {
        if (!result.channelId) return;

        this.chatService.setActiveChat(result.channelId);

        const selectedChannel = this.findChannelById(result.channelId);
        if (selectedChannel) {
            this.functionTriggerService.callSelectChannel(selectedChannel);
        }

        if (result.messageId) {
            this.scrollAndHighlightMessage(result.messageId);
        }
    }

    /**
     * Scrolls to and highlights a message by its ID, with retry logic.
     * @param messageId The ID of the message to highlight
     * @private
     */
    private scrollAndHighlightMessage(messageId: string): void {
        setTimeout(() => {
            if (!this.tryHighlightMessage(messageId)) {
                setTimeout(() => {
                    this.tryHighlightMessage(messageId);
                }, 500);
            }
        }, 1000);
    }

    /**
     * Tries to scroll to and highlight the message element.
     * @param messageId The ID of the message
     * @returns True if the element was found and highlighted, false otherwise
     * @private
     */
    private tryHighlightMessage(messageId: string): boolean {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (!messageElement) return false;

        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        messageElement.classList.add("highlight-message");
        setTimeout(() => {
            messageElement.classList.remove("highlight-message");
        }, 3000);
        return true;
    }

    /**
     * Flattens all categorized search results into a single array.
     * @returns Array of all search results
     */
    private getAllResultsFlattened(): SearchResult[] {
        return [
            ...this.searchResults.messages,
            ...this.searchResults.directMessages,
            ...this.searchResults.channels,
            ...this.searchResults.threads,
            ...this.searchResults.users,
        ];
    }

    /**
     * Calculates the total number of search results and updates the totalResults property.
     * @private
     */
    private calculateTotalResults(): void {
        this.totalResults =
            this.searchResults.messages.length +
            this.searchResults.directMessages.length +
            this.searchResults.channels.length +
            this.searchResults.threads.length +
            this.searchResults.users.length;
    }

    /**
     * Finds a channel by its ID.
     * @param id - Channel ID
     * @returns ChannelData object or null if not found
     * @private
     */
    private findChannelById(id: string): ChannelData | null {
        return (
            this.channels.find((channel) => channel.channelId === id) || null
        );
    }
}
