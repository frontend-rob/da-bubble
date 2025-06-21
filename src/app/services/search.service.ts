import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, take} from 'rxjs';
import {ChatService} from './chat.service';
import {UserService} from './user.service';
import {SearchResult} from '../interfaces/search-result.interface';
import {ChannelData} from '../interfaces/channel.interface';
import {UserData} from '../interfaces/user.interface';

export interface CategorizedSearchResults {
	messages: SearchResult[];
	directMessages: SearchResult[];
	channels: SearchResult[];
	threads: SearchResult[];
	users: SearchResult[];
}

@Injectable({
	providedIn: 'root'
})
export class SearchService {
	private chatService = inject(ChatService);
	private userService = inject(UserService);

	private searchTermSubject = new BehaviorSubject<string>('');
	public searchTerm$ = this.searchTermSubject.asObservable();

	private searchResultsSubject = new BehaviorSubject<CategorizedSearchResults>({
		messages: [],
		directMessages: [],
		channels: [],
		threads: [],
		users: []
	});
	public searchResults$ = this.searchResultsSubject.asObservable();

	constructor() {
		console.log('SearchService initialized');

		this.searchTerm$.subscribe(term => {
			console.log('Search term changed:', term);
			if (term.trim()) {
				this.performSearch(term).then(r => console.log(r));
			} else {
				this.clearResults();
			}
		});
	}

	setSearchTerm(term: string): void {
		console.log('Setting search term:', term);
		this.searchTermSubject.next(term);
	}

	private async performSearch(searchTerm: string): Promise<void> {
		console.log('Performing search for:', searchTerm);
		const trimmedTerm = searchTerm.trim().toLowerCase();

		if (trimmedTerm.startsWith('#')) {
			console.log('Channel-only search');
			await this.searchChannelsOnly(trimmedTerm.substring(1));
			return;
		}

		if (trimmedTerm.startsWith('@')) {
			console.log('User-only search');
			await this.searchUsersOnly(trimmedTerm.substring(1));
			return;
		}

		console.log('All-categories search');
		await this.searchAllCategories(trimmedTerm);
	}

	private async searchChannelsOnly(term: string): Promise<void> {
		console.log('Searching channels for:', term);
		const channels = await this.searchInChannels(term);
		console.log('Found channels:', channels.length);

		this.searchResultsSubject.next({
			messages: [],
			directMessages: [],
			channels: channels,
			threads: [],
			users: []
		});
	}

	private async searchUsersOnly(term: string): Promise<void> {
		console.log('Searching users for:', term);
		const users = await this.searchInUsers(term);
		console.log('Found users:', users.length);

		this.searchResultsSubject.next({
			messages: [],
			directMessages: [],
			channels: [],
			threads: [],
			users: users
		});
	}

	private async searchAllCategories(term: string): Promise<void> {
		console.log('Searching all categories for:', term);

		try {
			const [messages, directMessages, channels, threads, users] = await Promise.all([
				this.searchInMessages(term),
				this.searchInDirectMessages(term),
				this.searchInChannels(term),
				this.searchInThreads(term),
				this.searchInUsers(term)
			]);

			console.log('Search results:', {
				messages: messages.length,
				directMessages: directMessages.length,
				channels: channels.length,
				threads: threads.length,
				users: users.length
			});

			this.searchResultsSubject.next({
				messages,
				directMessages,
				channels,
				threads,
				users
			});
		} catch (error) {
			console.error('Error in searchAllCategories:', error);
			this.clearResults();
		}
	}

	private async searchInUsers(term: string): Promise<SearchResult[]> {
		console.log('searchInUsers called with term:', term);
		const results: SearchResult[] = [];

		try {
			// Verwende take(1) für einmaligen Abruf
			const users = await this.userService.allUsers$.pipe(take(1)).toPromise();

			console.log('All users from service:', users?.length || 0);

			if (!users) {
				console.log('No users available');
				return results;
			}

			// Filtere Guest-Benutzer aus
			const availableUsers = users.filter(user => {
				const isGuest = user.role?.guest || user.userName === 'Guest';
				return !isGuest;
			});

			console.log('Available users for search (no guests):', availableUsers.length);

			// Wenn kein Suchterm angegeben ist (nur @), zeige alle verfügbaren Benutzer
			let matchingUsers: UserData[];
			if (term.trim() === '') {
				matchingUsers = availableUsers;
				console.log('No search term, showing all users');
			} else {
				matchingUsers = availableUsers.filter(user =>
					user.userName.toLowerCase().includes(term.toLowerCase()) ||
					(user.email && user.email.toLowerCase().includes(term.toLowerCase()))
				);
				console.log('Filtered users by term:', matchingUsers.length);
			}

			console.log('Matching users found:', matchingUsers.length);

			for (const user of matchingUsers) {
				results.push({
					type: 'user',
					uid: user.uid,
					userName: user.userName,
					email: user.email || '',
					photoURL: user.photoURL || '',
					status: user.status,
					channelName: '',
					channelDescription: ''
				});
			}
		} catch (error) {
			console.error('Error in searchInUsers:', error);
		}

		console.log('searchInUsers returning:', results.length, 'results');
		return results;
	}

	private async searchInChannels(term: string): Promise<SearchResult[]> {
		console.log('searchInChannels called with term:', term);
		const results: SearchResult[] = [];

		try {
			const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
			console.log('All channels from service:', channels?.length || 0);

			if (!channels) return results;

			// Filtere nur echte Channels (keine Direct Messages)
			const realChannels = channels.filter(channel =>
				!channel.channelType.directMessage
			);

			let matchingChannels: ChannelData[];

			// Wenn kein Suchterm angegeben ist (nur #), zeige alle Channels
			if (term.trim() === '') {
				matchingChannels = realChannels;
				console.log('No search term, showing all channels');
			} else {
				matchingChannels = realChannels.filter(channel =>
					channel.channelName.toLowerCase().includes(term.toLowerCase()) ||
					(channel.channelDescription && channel.channelDescription.toLowerCase().includes(term.toLowerCase()))
				);
				console.log('Filtered channels by term:', matchingChannels.length);
			}

			console.log('Matching channels found:', matchingChannels.length);

			for (const channel of matchingChannels) {
				results.push({
					type: 'channels',
					channelId: channel.channelId,
					channelName: channel.channelName,
					channelDescription: channel.channelDescription || '',
					channelMembers: channel.channelMembers.map(member => member.uid),
					userName: '',
					photoURL: '',
					status: false,
					email: ''
				});
			}
		} catch (error) {
			console.error('Error in searchInChannels:', error);
		}

		console.log('searchInChannels returning:', results.length, 'results');
		return results;
	}

	private async searchInMessages(term: string): Promise<SearchResult[]> {
		console.log('searchInMessages called with term:', term);
		const results: SearchResult[] = [];

		try {
			const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
			console.log('All channels from service:', channels?.length || 0);

			if (!channels) return results;

			// Filtere nur echte Channels (keine Direct Messages)
			const realChannels = channels.filter(channel =>
				!channel.channelType.directMessage
			);

			for (const channel of realChannels) {
				const messages = await this.chatService.getMessages(channel.channelId).pipe(take(1)).toPromise();

				if (!messages || messages.length === 0) continue;

				const matchingMessages = messages.filter(message => 
					message.text.toLowerCase().includes(term.toLowerCase())
				);

				console.log(`Found ${matchingMessages.length} matching messages in channel ${channel.channelName}`);

				for (const message of matchingMessages) {
					results.push({
						type: 'message',
						messageId: (message as any).messageId,
						messageAuthorId: message.sender.uid,
						messageContent: message.text,
						time: message.timestamp,
						channelId: channel.channelId,
						channelName: channel.channelName,
						userName: message.sender.userName,
						photoURL: message.sender.photoURL || '',
						email: message.sender.email || '',
						status: message.sender.status || false,
						channelDescription: ''
					});
				}
			}
		} catch (error) {
			console.error('Error in searchInMessages:', error);
		}

		console.log('searchInMessages returning:', results.length, 'results');
		return results;
	}

	private async searchInDirectMessages(term: string): Promise<SearchResult[]> {
		console.log('searchInDirectMessages called with term:', term);
		const results: SearchResult[] = [];

		try {
			const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
			console.log('All channels from service:', channels?.length || 0);

			if (!channels) return results;

			// Filtere nur Direct Message Channels
			const dmChannels = channels.filter(channel =>
				channel.channelType.directMessage
			);

			const currentUser = await this.userService.currentUser$.pipe(take(1)).toPromise();
			if (!currentUser) return results;

			for (const channel of dmChannels) {
				const messages = await this.chatService.getMessages(channel.channelId).pipe(take(1)).toPromise();

				if (!messages || messages.length === 0) continue;

				const matchingMessages = messages.filter(message => 
					message.text.toLowerCase().includes(term.toLowerCase())
				);

				console.log(`Found ${matchingMessages.length} matching direct messages in channel ${channel.channelName}`);

				// Finde den anderen Benutzer im DM-Channel (nicht der aktuelle Benutzer)
				const otherUser = channel.channelMembers.find(member => member.uid !== currentUser.uid);

				if (!otherUser) continue;

				for (const message of matchingMessages) {
					results.push({
						type: 'message',
						messageId: (message as any).messageId,
						messageAuthorId: message.sender.uid,
						messageContent: message.text,
						time: message.timestamp,
						channelId: channel.channelId,
						channelName: channel.channelName,
						userName: message.sender.userName,
						photoURL: message.sender.photoURL || '',
						email: message.sender.email || '',
						status: message.sender.status || false,
						directMessageUserId: otherUser.uid,
						directMessageUserName: otherUser.userName,
						channelDescription: ''
					});
				}
			}
		} catch (error) {
			console.error('Error in searchInDirectMessages:', error);
		}

		console.log('searchInDirectMessages returning:', results.length, 'results');
		return results;
	}

	private async searchInThreads(term: string): Promise<SearchResult[]> {
		console.log('searchInThreads called with term:', term);
		const results: SearchResult[] = [];

		try {
			const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
			console.log('All channels from service:', channels?.length || 0);

			if (!channels) return results;

			for (const channel of channels) {
				const messages = await this.chatService.getMessages(channel.channelId).pipe(take(1)).toPromise();

				if (!messages || messages.length === 0) continue;

				// Filtere Nachrichten mit Threads
				const messagesWithThreads = messages.filter(message => message.hasThread);

				for (const parentMessage of messagesWithThreads) {
					const threadMessages = await this.chatService.getThreadMessages(
						channel.channelId, 
						(parentMessage as any).messageId
					).pipe(take(1)).toPromise();

					if (!threadMessages || threadMessages.length === 0) continue;

					const matchingThreadMessages = threadMessages.filter(message => 
						message.text.toLowerCase().includes(term.toLowerCase())
					);

					console.log(`Found ${matchingThreadMessages.length} matching thread messages for parent message in ${channel.channelName}`);

					for (const threadMessage of matchingThreadMessages) {
						results.push({
							type: 'message',
							messageId: (threadMessage as any).messageId,
							messageAuthorId: threadMessage.sender.uid,
							messageContent: threadMessage.text,
							time: threadMessage.timestamp,
							channelId: channel.channelId,
							channelName: channel.channelName,
							userName: threadMessage.sender.userName,
							photoURL: threadMessage.sender.photoURL || '',
							email: threadMessage.sender.email || '',
							status: threadMessage.sender.status || false,
							repliedMessageId: (parentMessage as any).messageId,
							replierName: threadMessage.sender.userName,
							channelDescription: ''
						});
					}
				}
			}
		} catch (error) {
			console.error('Error in searchInThreads:', error);
		}

		console.log('searchInThreads returning:', results.length, 'results');
		return results;
	}

	private clearResults(): void {
		console.log('Clearing search results');
		this.searchResultsSubject.next({
			messages: [],
			directMessages: [],
			channels: [],
			threads: [],
			users: []
		});
	}
}
