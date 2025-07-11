import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {ChannelListItemComponent} from "./channel-list-item/channel-list-item.component";
import {DirectMessageListItemComponent} from "./direct-message-list-item/direct-message-list-item.component";
import {ChannelData} from "../../interfaces/channel.interface";
import {ChatService} from "../../services/chat.service";
import {HelperService} from "../../services/helper.service";
import {Timestamp} from "firebase/firestore";
import {FormsModule} from "@angular/forms";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {combineLatest, Subject, takeUntil, Observable, map, of, Subscription} from "rxjs";
import {UserLookupService} from "../../services/user-lookup.service";
import { ResponsiveService } from "../../services/responsive.service";
import { WorkspaceService } from "../../services/workspace.service";

@Component({
	selector: "app-main-menu",
	imports: [
		CommonModule,
		ChannelListItemComponent,
		DirectMessageListItemComponent,
		FormsModule,
		NgOptimizedImage,
	],
	templateUrl: "./main-menu.component.html",
	styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent implements OnInit, OnDestroy {
	showChannelList = false;
	showUserList = false;
	isOpen = false;
	isModalOpen = false;
	isMainMenuOpen: boolean = false;
	private isMainMenuOpenSubscription!: Subscription;
	private screenWidthSubscription!: Subscription;
	screenWidth!: number;

	isOpenText = "Close Workspace Menu";
	isClosedText = "Open Workspace Menu";

	currentUser!: UserData;
	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];
	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];
	selfChannel: ChannelData | null = null; // Kanal für Selbst-Chat

	// Combined list for direct messages display
	combinedDirectMessagesList: {
		user: UserData;
		type: "current" | "channel" | "other";
		channelId?: string;
	}[] = [];

	channelFormData = {
		name: "",
		description: "",
	};

	private helperService: HelperService = inject(HelperService);
	private userLookupService: UserLookupService = inject(UserLookupService);
	private userService: UserService = inject(UserService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);
	private chatService: ChatService = inject(ChatService);
	private responsiveService: ResponsiveService = inject(ResponsiveService);

	private destroy$ = new Subject<void>();

	get activeChat() {
		return this.chatService.activeChat;
	}

	constructor(private workspaceService: WorkspaceService) {}

	ngOnInit() {
		this.initializeCurrentUser();
		this.subscribeToData();

		this.isMainMenuOpenSubscription =
			this.workspaceService.isMainMenuOpen$.subscribe((val) => {
				this.isMainMenuOpen = val;
			});

		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		this.isMainMenuOpenSubscription.unsubscribe();
		this.screenWidthSubscription.unsubscribe();
	}

	toggleMainMenu() {
		this.workspaceService.setStatus(!this.isMainMenuOpen);
	}

	toggleChannelList() {
		this.showChannelList = !this.showChannelList;
	}

	toggleDirectMessageList() {
		this.showUserList = !this.showUserList;
	}

	toggleModal() {
		this.isModalOpen = !this.isModalOpen;
	}

	getAvailableUsersForDM(): UserData[] {
		return this.availableUsersForDM;
	}

	getDirectMessageUserData(dmChannel: ChannelData): Observable<UserData> {
		const otherUser: string | undefined = dmChannel.channelMembers.find(
			(member) => member !== this.currentUser.uid
		);
		if (otherUser) {
			return this.userLookupService.getUserById(otherUser).pipe(
				map(user => user || this.currentUser)
			);
		}
		// Fallback, falls kein anderer Nutzer gefunden wird
		return of(this.currentUser);
	}

	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
	}

	setSelectedChannel(id: string, userData: UserData | null) {
		console.log("dmchannels", this.directMessageChannels);
		const selectedChannel = this.findChannelById(id);
		if (selectedChannel) {
			this.functionTriggerService.callSelectChannel(selectedChannel);

			if (this.screenWidth < 768) {
				this.toggleMainMenu();
				this.chatService.handleChatResponsive(true);
			}
		} else if (userData) {
			this.onUserClickForDirectMessage(userData);
		} else {
			this.onUserClickForDirectMessage(id);
		}
	}

	goBackToMenu() {
		this.toggleMainMenu();
		this.chatService.handleChatResponsive(false);
	}

	async onUserClickForDirectMessage(data: string | UserData): Promise<void> {
		try {
			const clickedUser = data as UserData;

			if (clickedUser.role?.guest) {
				console.warn("Cannot create DM with guest user");
				return;
			}

			// Zuerst in lokaler Liste suchen
			let dmChannel: ChannelData | undefined = this.directMessageChannels.find(channel =>
				channel.channelMembers.some(member => member === clickedUser.uid)
			);

			// Falls nicht lokal gefunden, in Datenbank suchen
			if (!dmChannel) {
				const foundChannel = await this.chatService.findDirectMessageChannel(
					this.currentUser,
					clickedUser
				);
				dmChannel = foundChannel || undefined; // null zu undefined konvertieren
			}

			// Nur wenn wirklich kein Channel existiert, einen neuen erstellen
			if (!dmChannel) {
				console.log('Erstelle neuen DM-Channel für:', clickedUser.userName);
				dmChannel = await this.chatService.createDirectMessageChannel(
					this.currentUser,
					clickedUser
				);

				// Zur lokalen Liste hinzufügen
				this.directMessageChannels.push(dmChannel);

				this.chatService.selectedChannel = dmChannel;
				this.chatService.setActiveChat(dmChannel.channelId);
				this.functionTriggerService.callSelectChannel(dmChannel);

			} else {
				console.log('Verwende existierenden DM-Channel für:', clickedUser.userName);
			}

			this.chatService.selectedChannel = dmChannel;
			this.chatService.setActiveChat(dmChannel.channelId);
			this.functionTriggerService.callSelectChannel(dmChannel);
		} catch (error) {
			console.error(
				"Error creating/finding direct message channel:",
				error
			);
		}
	}

	async addNewChannel(
		channelName: string,
		channelDescription: string
	): Promise<void> {
		if (!this.currentUser) {
			console.error("No current user found");
			return;
		}

		const newChannel: ChannelData = {
			channelId: '', // Wird durch createChannel gesetzt
			channelName: channelName,
			channelDescription: channelDescription,
			channelType: {
				channel: true,
				directMessage: false,
			},
			createdBy: this.currentUser.uid,
			channelMembers: [this.currentUser.uid],
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		};

		try {
			const createdChannelId = await this.chatService.createChannel(newChannel);
			console.log("Channel created with ID:", createdChannelId);
			this.toggleModal();
			this.resetForm();
		} catch (error) {
			console.error("Error creating channel:", error);
		}
	}

	stopPropagation(event: Event): void {
		event.stopPropagation();
	}

	handleNewMessage(bool: boolean) {
		this.chatService.handleNewMessage(bool);

		if (bool) {
			this.chatService.setActiveChat("");
		}
	}

	private initializeCurrentUser() {
		this.userService.currentUser$.subscribe((user) => {
			if (user) {
				this.currentUser = user;
			}
		});
	}

	private subscribeToData() {
		combineLatest([
			this.chatService.getChannels(),
			this.userService.allUsers$,
		])
			.pipe(takeUntil(this.destroy$))
			.subscribe(async ([channels, users]) => {
				// DEBUG: Gesamte Channels-Collection ausloggen
				console.log('=== CHANNELS COLLECTION DEBUG ===');
				console.log('Anzahl Channels gesamt:', channels.length);
				console.log('Alle Channels:', channels);

				// DEBUG: Detaillierte Analyse der Channels
				const regularChannels = channels.filter(ch => ch.channelType?.channel);
				const dmChannels = channels.filter(ch => ch.channelType?.directMessage);

				console.log('--- REGULAR CHANNELS ---');
				console.log('Anzahl:', regularChannels.length);
				regularChannels.forEach((ch, index) => {
					console.log(`${index + 1}. ${ch.channelName} (ID: ${ch.channelId})`);
				});

				console.log('--- DM CHANNELS ---');
				console.log('Anzahl:', dmChannels.length);
				dmChannels.forEach((ch, index) => {
					const members = ch.channelMembers?.join(' ↔ ') || 'keine Members';
					console.log(`${index + 1}. ${ch.channelName} (ID: ${ch.channelId}) - Members: ${members}`);
				});

				// DEBUG: Duplikate in DM-Channels finden
				const dmPairs = new Map<string, ChannelData[]>();
				dmChannels.forEach(ch => {
					if (ch.channelMembers && ch.channelMembers.length === 2) {
						const member1 = ch.channelMembers[0];
						const member2 = ch.channelMembers[1];

						if (member1 && member2) {
							const pairKey = [member1, member2].sort().join('|');
							if (!dmPairs.has(pairKey)) {
								dmPairs.set(pairKey, []);
							}
							dmPairs.get(pairKey)!.push(ch);
						}
					}
				});

				console.log('--- DUPLIKATE ANALYSE ---');
				dmPairs.forEach((channels, pairKey) => {
					if (channels.length > 1) {
						console.log(`🔴 DUPLIKAT gefunden für Paar ${pairKey}:`);
						channels.forEach((ch, index) => {
							console.log(`  ${index + 1}. ${ch.channelName} (ID: ${ch.channelId}) - Erstellt: ${ch.createdAt}`);
						});
					}
				});

				// DEBUG: Defekte Channels finden
				const defekteChannels = dmChannels.filter(ch => {
					return !ch.channelMembers ||
						ch.channelMembers.length !== 2;
				});

				if (defekteChannels.length > 0) {
					console.log('--- DEFEKTE CHANNELS ---');
					defekteChannels.forEach((ch, index) => {
						console.log(`${index + 1}. ${ch.channelName} (ID: ${ch.channelId})`);
						console.log('  Members:', ch.channelMembers);
					});
				}

				console.log('=== END DEBUG ===');

				const updatedChannels = this.updateChannelMembersStatus(
					channels,
					users
				);

				this.handleChannelsUpdate(updatedChannels);
				this.handleUsersUpdate(users);

				// Warten auf die asynchrone Aktualisierung
				await this.updateAvailableUsers();

				if (this.channels.length > 0 && this.screenWidth < 768) {
					this.setActiveChat("");
					this.setSelectedChannel("", null);
				} else if (this.channels.length > 0) {
					this.setActiveChat(this.channels[0].channelId);
					this.setSelectedChannel(this.channels[0].channelId, null);
				}
			});
	}

	private handleChannelsUpdate(channelsData: ChannelData[]) {
		this.channels = [];
		this.directMessageChannels = [];

		if (!this.currentUser) return;

		for (const channel of channelsData) {
			const isMember = channel.channelMembers?.includes(this.currentUser?.uid);

			if (isMember) {
				if (channel.channelType?.directMessage) {
					// Prüfe, ob es sich um einen Selbst-Chat handelt
					const isSelfChannel =
						channel.channelMembers.length === 1 ||
						(channel.channelMembers.length === 2 &&
							channel.channelMembers.every(uid => uid === this.currentUser.uid));

					if (isSelfChannel) {
						this.selfChannel = channel;
					} else {
						this.directMessageChannels.push(channel);
					}
				} else {
					this.channels.push(channel);
				}
			}
		}
	}

	private handleUsersUpdate(users: UserData[] | null) {
		if (!users || !this.currentUser) return;

		this.allUsers = users.filter(
			(user) => !user.role?.guest && user.uid !== this.currentUser?.uid
		);
	}

	private async updateAvailableUsers() {
		console.log('=== UPDATE AVAILABLE USERS DEBUG ===');
		console.log('Current User:', this.currentUser?.userName);
		console.log('All Users:', this.allUsers.map(u => u.userName));
		console.log('DM Channels vor Update:', this.directMessageChannels.length);

		// 1. Zuerst alle defekten Channels herausfiltern
		this.directMessageChannels = this.filterValidChannels(this.directMessageChannels);

		// 2. Duplikate entfernen
		this.directMessageChannels = this.removeDuplicateChannels(this.directMessageChannels);

		// 3. NICHT automatisch neue Channels erstellen - nur die existierenden verwenden
		// Diese Logik sollte nur beim bewussten Klick auf einen User ausgeführt werden

		this.availableUsersForDM = this.getAvailableUsersForNewDM();

		console.log('DM Channels nach Update:', this.directMessageChannels.length);
		console.log('Verfügbare Users für neue DMs:', this.availableUsersForDM.length);
		console.log('=== END UPDATE DEBUG ===');
	}

	private filterValidChannels(channels: ChannelData[]): ChannelData[] {
		return channels.filter(channel => {
			// Filtere defekte Channels heraus
			if (!channel.channelMembers || channel.channelMembers.length !== 2) {
				console.warn('Defekter Channel gefiltert (falsche Anzahl Members):', channel.channelId);
				return false;
			}

			const member1Id = channel.channelMembers[0];
			const member2Id = channel.channelMembers[1];

			// Filtere Channels mit undefined/null Member IDs
			if (!member1Id || !member2Id) {
				console.warn('Defekter Channel gefiltert (undefined Member IDs):', channel.channelId);
				return false;
			}

			// Filtere Channels heraus, wo der current User nicht dabei ist
			const currentUserInChannel = channel.channelMembers.includes(this.currentUser?.uid);

			if (!currentUserInChannel) {
				console.warn('Channel gefiltert (Current User nicht Member):', channel.channelId);
				return false;
			}

			return true;
		});
	}

	private removeDuplicateChannels(channels: ChannelData[]): ChannelData[] {
		const uniqueChannels: ChannelData[] = [];
		const seenPairs = new Set<string>();

		for (const channel of channels) {
			const member1Id = channel.channelMembers[0];
			const member2Id = channel.channelMembers[1];

			// Erstelle eine eindeutige Kennung für das Benutzerpaar (sortiert)
			const pairKey = [member1Id, member2Id].sort().join('|');

			if (!seenPairs.has(pairKey)) {
				seenPairs.add(pairKey);
				uniqueChannels.push(channel);
				console.log('✅ Einzigartiger DM-Channel behalten:', channel.channelName, pairKey);
			} else {
				console.log('🔴 Duplikat entfernt:', channel.channelName, pairKey);
			}
		}

		return uniqueChannels;
	}

	private getAvailableUsersForNewDM(): UserData[] {
		return this.allUsers.filter(user => {
			// Prüfe, ob bereits ein DM-Channel mit diesem User existiert
			const existingDM = this.directMessageChannels.find(dmChannel => {
				return dmChannel.channelMembers.includes(user.uid);
			});

			return !existingDM; // User ist verfügbar, wenn noch kein DM-Channel existiert
		});
	}

	private findChannelById(id: string): ChannelData | null {
		return (
			this.channels.find((channel) => channel.channelId === id) ||
			this.directMessageChannels.find(
				(channel) => channel.channelId === id
			) ||
			null
		);
	}

	private updateChannelMembersStatus(
		channels: ChannelData[],
		users: UserData[] | null
	): ChannelData[] {
		// Since channelMembers is now an array of strings (UIDs),
		// we don't need to update their status in the channel object
		return channels;
	}

	resetForm() {
		this.channelFormData = {
			name: "",
			description: "",
		};
	}
}
