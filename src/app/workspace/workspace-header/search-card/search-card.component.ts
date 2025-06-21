import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CategorizedSearchResults, SearchService} from '../../../services/search.service';
import {ChatService} from '../../../services/chat.service';
import {UserService} from '../../../services/user.service';
import {SearchResult} from '../../../interfaces/search-result.interface';
import {Subject, takeUntil} from 'rxjs';
import {UserData, userRole} from '../../../interfaces/user.interface';
import {Timestamp} from '@angular/fire/firestore';

@Component({
	selector: 'app-search-card',
	standalone: true,
	imports: [CommonModule, FormsModule,],
	templateUrl: './search-card.component.html',
	styleUrls: ['./search-card.component.scss']
})
export class SearchCardComponent implements OnInit, OnDestroy {
	@ViewChild('searchInput', {static: false}) searchInput!: ElementRef<HTMLInputElement>;
	searchTerm = '';
	searchResults: CategorizedSearchResults = {
		messages: [],
		directMessages: [],
		channels: [],
		threads: [],
		users: []
	};
	isSearching = false;
	showResults = false;
	selectedIndex = -1;
	totalResults = 0;
	private searchService = inject(SearchService);
	private chatService = inject(ChatService);
	private userService = inject(UserService);
	private destroy$ = new Subject<void>();
	private blurTimeout: any;

	ngOnInit(): void {
		console.log('SearchCardComponent initialized');

		this.searchService.searchResults$
			.pipe(takeUntil(this.destroy$))
			.subscribe(results => {
				console.log('Search results received:', results);
				this.searchResults = results;
				this.calculateTotalResults();
				this.isSearching = false;

				// Zeige Ergebnisse nur wenn ein Suchterm vorhanden ist
				if (this.searchTerm.trim().length > 0) {
					this.showResults = true;
				}

				console.log('showResults:', this.showResults, 'totalResults:', this.totalResults);
				console.log('Users found:', this.searchResults.users.length);
				console.log('Channels found:', this.searchResults.channels.length);
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		if (this.blurTimeout) {
			clearTimeout(this.blurTimeout);
		}
	}

	onSearchInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.searchTerm = target.value;
		console.log('Search input changed:', this.searchTerm);

		// Lösche eventuell gesetzten Blur-Timeout
		if (this.blurTimeout) {
			clearTimeout(this.blurTimeout);
			this.blurTimeout = null;
		}

		if (this.searchTerm.trim().length === 0) {
			this.showResults = false;
			this.selectedIndex = -1;
			console.log('Search term empty, hiding results');
			return;
		}

		this.isSearching = true;
		this.showResults = true;
		console.log('Starting search, isSearching:', this.isSearching);
		this.searchService.setSearchTerm(this.searchTerm);
	}

	onSearchFocus(): void {
		console.log('Search input focused');

		// Lösche Blur-Timeout wenn Fokus wieder gesetzt wird
		if (this.blurTimeout) {
			clearTimeout(this.blurTimeout);
			this.blurTimeout = null;
		}

		if (this.searchTerm.trim().length > 0) {
			this.showResults = true;
			console.log('Showing results on focus');
		}
	}

	onSearchBlur(): void {
		console.log('Search input blurred');

		// Verzögere das Ausblenden, damit Klicks auf Ergebnisse noch funktionieren
		this.blurTimeout = setTimeout(() => {
			this.showResults = false;
			this.selectedIndex = -1;
			console.log('Results hidden after blur delay');
		}, 300); // Erhöhte Verzögerung
	}

	// Verhindere das Ausblenden wenn auf die Ergebnisse geklickt wird
	onResultsMouseDown(event: Event): void {
		event.preventDefault(); // Verhindert den Blur des Input-Feldes
	}

	onKeyDown(event: KeyboardEvent): void {
		if (!this.showResults) return;

		const allResults = this.getAllResultsFlattened();

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this.selectedIndex = Math.min(this.selectedIndex + 1, allResults.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (this.selectedIndex >= 0 && this.selectedIndex < allResults.length) {
					this.selectResult(allResults[this.selectedIndex]);
				}
				break;
			case 'Escape':
				this.showResults = false;
				this.selectedIndex = -1;
				this.searchInput?.nativeElement.blur();
				break;
		}
	}

	selectResult(result: SearchResult): void {
		console.log('Selecting result:', result);

		// Lösche Blur-Timeout beim Auswählen eines Ergebnisses
		if (this.blurTimeout) {
			clearTimeout(this.blurTimeout);
			this.blurTimeout = null;
		}

		switch (result.type) {
			case 'user':
				this.openDirectMessage(result);
				break;
			case 'channels':
				this.openChannel(result);
				break;
			case 'message':
				this.openMessage(result);
				break;
		}

		this.showResults = false;
		this.searchTerm = '';
		this.selectedIndex = -1;
	}

	getSearchPlaceholder(): string {
		if (this.searchTerm.startsWith('#')) {
			return 'Nach Channels suchen...';
		} else if (this.searchTerm.startsWith('@')) {
			return 'Nach Personen suchen...';
		}
		return 'Suche in DABubble...';
	}

	hasResults(): boolean {
		return this.totalResults > 0;
	}

	clearSearch(): void {
		console.log('Clearing search');
		this.searchTerm = '';
		this.showResults = false;
		this.selectedIndex = -1;
		this.searchService.setSearchTerm('');
	}

	// Debug-Methoden für das Template
	getDebugInfo(): string {
		return `
      searchTerm: "${this.searchTerm}"
      showResults: ${this.showResults}
      isSearching: ${this.isSearching}
      totalResults: ${this.totalResults}
      hasResults: ${this.hasResults()}
    `;
	}

	private async openDirectMessage(result: SearchResult): Promise<void> {
		if (!result.uid) return;

		const currentUser = await this.userService.currentUser$.pipe(takeUntil(this.destroy$)).toPromise();
		if (!currentUser) return;

		// Erstelle das korrekte UserData-Objekt
		const targetUser: UserData = {
			uid: result.uid,
			userName: result.userName,
			email: result.email || '',
			photoURL: result.photoURL || '',
			status: result.status,
			createdAt: Timestamp.now(), // Fallback-Wert
			role: {
				user: true,
				admin: false,
				moderator: false,
				guest: false
			} as userRole
		};

		try {
			let dmChannel = await this.chatService.findDirectMessageChannel(currentUser, targetUser);

			if (!dmChannel) {
				dmChannel = await this.chatService.createDirectMessageChannel(currentUser, targetUser);
			}

			this.chatService.setActiveChat(dmChannel.channelId);
		} catch (error) {
			console.error('Fehler beim Öffnen der Direct Message:', error);
		}
	}

	private openChannel(result: SearchResult): void {
		if (!result.channelId) return;
		this.chatService.setActiveChat(result.channelId);
	}

	private openMessage(result: SearchResult): void {
		if (!result.channelId) return;

		this.chatService.setActiveChat(result.channelId);

		if (result.messageId) {
			setTimeout(() => {
				const messageElement = document.getElementById(`message-${result.messageId}`);
				if (messageElement) {
					messageElement.scrollIntoView({behavior: 'smooth', block: 'center'});
					messageElement.classList.add('highlight-message');
					setTimeout(() => {
						messageElement.classList.remove('highlight-message');
					}, 3000);
				}
			}, 500);
		}
	}

	private getAllResultsFlattened(): SearchResult[] {
		return [
			...this.searchResults.messages,
			...this.searchResults.directMessages,
			...this.searchResults.channels,
			...this.searchResults.threads,
			...this.searchResults.users
		];
	}

	private calculateTotalResults(): void {
		this.totalResults =
			this.searchResults.messages.length +
			this.searchResults.directMessages.length +
			this.searchResults.channels.length +
			this.searchResults.threads.length +
			this.searchResults.users.length;
	}
}
