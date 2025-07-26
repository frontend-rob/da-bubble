import {CommonModule, NgOptimizedImage} from "@angular/common";
import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit,} from "@angular/core";
import {ChannelListItemComponent} from "./channel-list-item/channel-list-item.component";
import {DirectMessageListItemComponent} from "./direct-message-list-item/direct-message-list-item.component";
import {ChannelData} from "../../interfaces/channel.interface";
import {ChatService} from "../../services/chat.service";
import {Timestamp} from "firebase/firestore";
import {FormsModule} from "@angular/forms";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {combineLatest, map, Observable, of, Subject, Subscription, takeUntil,} from "rxjs";
import {UserLookupService} from "../../services/user-lookup.service";
import {ResponsiveService} from "../../services/responsive.service";
import {WorkspaceService} from "../../services/workspace.service";
import {SearchCardComponent} from "../workspace-header/search-card/search-card.component";

@Component({
	selector: "app-main-menu",
	imports: [
		CommonModule,
		ChannelListItemComponent,
		DirectMessageListItemComponent,
		FormsModule,
		NgOptimizedImage,
		SearchCardComponent,
	],
	templateUrl: "./main-menu.component.html",
	styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent implements OnInit, OnDestroy {
	showChannelList = false;
	showUserList = false;
	isModalOpen = false;
	isMainMenuOpen: boolean = false;
	screenWidth!: number;
	isOpenText = "Close Workspace Menu";
	isClosedText = "Open Workspace Menu";
	currentUser!: UserData;
	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];
	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];
	selfChannel: ChannelData | null = null;
	channelFormData = {
		name: "",
		description: "",
	};

	channelFormError = "";
	private isMainMenuOpenSubscription!: Subscription;
	private screenWidthSubscription!: Subscription;
	private isInitialLoad = true;
	private userLookupService: UserLookupService = inject(UserLookupService);
	private userService: UserService = inject(UserService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);
	private chatService: ChatService = inject(ChatService);
	private responsiveService: ResponsiveService = inject(ResponsiveService);

	private destroy$ = new Subject<void>();

	constructor(
		private workspaceService: WorkspaceService,
		private cdr: ChangeDetectorRef
	) {
	}

	get isUserMenuOpen() {
		return this.userService.isUserMenuOpen;
	}

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

		this.userService.directMessageUser$.subscribe((user) => {
			if (user) {
				this.onUserClickForDirectMessage(user);
			}
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
		console.info("isModalOpen", this.isModalOpen);
	}

	getAvailableUsersForDM(): UserData[] {
		return this.availableUsersForDM;
	}

	getDirectMessageUserData(dmChannel: ChannelData): Observable<UserData> {
		const otherUser: string | undefined = dmChannel.channelMembers.find(
			(member) => member !== this.currentUser.uid
		);
		if (otherUser) {
			return this.userLookupService
				.getUserById(otherUser)
				.pipe(map((user) => user || this.currentUser));
		} else {
			return of(this.currentUser);
		}
	}

	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
	}

	setSelectedChannel(
		idOrEvent: string | { channelId: string; userData: UserData | null },
		userData?: UserData | null
	) {
		let id: string;
		let user: UserData | null;

		if (typeof idOrEvent === "object" && idOrEvent !== null) {
			id = idOrEvent.channelId;
			user = idOrEvent.userData;
		} else {
			id = idOrEvent;
			user = userData || null;
		}

		console.info("setSelectedChannel called with:", {id, user});
		console.info("dmchannels", this.directMessageChannels);

		// Close thread window when switching channels
		this.chatService.handleThread(false);

		this.setActiveChat(id);

		const selectedChannel = this.findChannelById(id);
		if (selectedChannel) {
			this.functionTriggerService.callSelectChannel(selectedChannel);

			if (this.screenWidth <= 1024) {
				this.toggleMainMenu();
				this.chatService.handleChatResponsive(true);
			}
		} else if (user) {
			this.onUserClickForDirectMessage(user);
		} else {
			this.onUserClickForDirectMessage(id);
		}
	}

	onChannelSelected(event: { channelId: string; userData: UserData | null }) {
		console.info("Channel selected:", event);

		if (event.userData) {
			this.onUserClickForDirectMessage(event.userData);
		} else {
			this.setSelectedChannel(event.channelId, event.userData);
		}
	}

	async onUserClickForDirectMessage(data: string | UserData): Promise<void> {
		try {
			const clickedUser = data as UserData;

			if (clickedUser.role?.guest) {
				console.warn("Cannot create DM with guest user");
				return;
			}

			// Close thread window when switching to a direct message channel
			this.chatService.handleThread(false);

			if (clickedUser.uid === this.currentUser.uid) {
				console.info("Self-Channel ausgewählt");

				if (this.selfChannel) {
					console.info(
						"Verwende existierenden Self-Channel:",
						this.selfChannel.channelId
					);

					this.chatService.selectedChannel = this.selfChannel;
					this.chatService.setActiveChat(this.selfChannel.channelId);
					this.functionTriggerService.callSelectChannel(
						this.selfChannel
					);

					if (this.screenWidth <= 1024) {
						this.toggleMainMenu();
						this.chatService.handleChatResponsive(true);
					}

					this.cdr.detectChanges();
					return;
				} else {
					console.info("Erstelle neuen Self-Channel");

					const selfChannel =
						await this.chatService.createDirectMessageChannel(
							this.currentUser,
							this.currentUser
						);

					this.selfChannel = selfChannel;

					this.chatService.selectedChannel = selfChannel;
					this.chatService.setActiveChat(selfChannel.channelId);
					this.functionTriggerService.callSelectChannel(selfChannel);

					if (this.screenWidth < 768) {
						this.toggleMainMenu();
						this.chatService.handleChatResponsive(true);
					}

					this.cdr.detectChanges();
					return;
				}
			}

			let dmChannel: ChannelData | undefined =
				this.directMessageChannels.find((channel) =>
					channel.channelMembers.some(
						(member) => member === clickedUser.uid
					)
				);

			if (!dmChannel) {
				const foundChannel =
					await this.chatService.findDirectMessageChannel(
						this.currentUser,
						clickedUser
					);
				dmChannel = foundChannel || undefined;
			}

			if (!dmChannel) {
				console.info(
					"Erstelle neuen DM-Channel für:",
					clickedUser.userName
				);
				dmChannel = await this.chatService.createDirectMessageChannel(
					this.currentUser,
					clickedUser
				);

				this.directMessageChannels.push(dmChannel);
			} else {
				console.info(
					"Verwende existierenden DM-Channel für:",
					clickedUser.userName
				);
			}

			this.chatService.selectedChannel = dmChannel;
			this.chatService.setActiveChat(dmChannel.channelId);
			this.functionTriggerService.callSelectChannel(dmChannel);

			if (this.screenWidth < 768) {
				this.toggleMainMenu();
				this.chatService.handleChatResponsive(true);
			}

			this.cdr.detectChanges();
		} catch (error) {
			console.error(
				"Error creating/finding direct message channel:",
				error
			);
		}
	}

	goBackToMenu() {
		this.toggleMainMenu();
		this.chatService.handleChatResponsive(false);
	}

	async addNewChannel(
		channelName: string,
		channelDescription: string
	): Promise<void> {
		if (!this.currentUser) {
			console.error("No current user found");
			return;
		}

		// Reset any previous errors
		this.channelFormError = "";

		const newChannel: ChannelData = {
			channelId: "",
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
			const createdChannelId = await this.chatService.createChannel(
				newChannel
			);
			console.info("Channel created with ID:", createdChannelId);
			this.toggleModal();
			this.resetForm();
		} catch (error) {
			console.info("Error creating channel:", error);
			if (error instanceof Error) {
				if (error.message.includes("already exists")) {
					this.channelFormError = error.message;
				} else {
					this.channelFormError = "Failed to create channel. Please try again.";
				}
			} else {
				this.channelFormError = "An unexpected error occurred.";
			}
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

	resetForm() {
		this.channelFormData = {
			name: "",
			description: "",
		};
		this.channelFormError = "";
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
				const dmChannels = channels.filter(
					(ch) => ch.channelType?.directMessage
				);

				const dmPairs = new Map<string, ChannelData[]>();
				dmChannels.forEach((ch) => {
					if (ch.channelMembers && ch.channelMembers.length === 2) {
						const member1 = ch.channelMembers[0];
						const member2 = ch.channelMembers[1];

						if (member1 && member2) {
							const pairKey = [member1, member2].sort().join("|");
							if (!dmPairs.has(pairKey)) {
								dmPairs.set(pairKey, []);
							}
							dmPairs.get(pairKey)!.push(ch);
						}
					}
				});

				const updatedChannels = this.updateChannelMembersStatus(
					channels,
					users
				);

				this.handleChannelsUpdate(updatedChannels);
				this.handleUsersUpdate(users);

				await this.updateAvailableUsers();

				if (this.isInitialLoad && this.channels.length > 0) {
					if (this.screenWidth < 768) {
						this.setActiveChat("");
						this.setSelectedChannel("", null);
					} else {
						this.setActiveChat(this.channels[0].channelId);
						this.setSelectedChannel(
							this.channels[0].channelId,
							null
						);
					}
					this.isInitialLoad = false;
				}
			});
	}

	private handleChannelsUpdate(channelsData: ChannelData[]) {
		this.channels = [];
		this.directMessageChannels = [];

		if (!this.currentUser) return;

		for (const channel of channelsData) {
			const isMember = channel.channelMembers?.includes(
				this.currentUser?.uid
			);

			if (isMember) {
				if (channel.channelType?.directMessage) {
					const isSelfChannel =
						channel.channelMembers.length === 1 ||
						(channel.channelMembers.length === 2 &&
							channel.channelMembers.every(
								(uid) => uid === this.currentUser.uid
							));

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
		this.directMessageChannels = this.filterValidChannels(
			this.directMessageChannels
		);
		this.directMessageChannels = this.removeDuplicateChannels(
			this.directMessageChannels
		);
		this.availableUsersForDM = this.getAvailableUsersForNewDM();
	}

	private filterValidChannels(channels: ChannelData[]): ChannelData[] {
		return channels.filter((channel) => {
			if (
				!channel.channelMembers ||
				channel.channelMembers.length !== 2
			) {
				console.warn(
					"Defekter Channel gefiltert (falsche Anzahl Members):",
					channel.channelId
				);
				return false;
			}

			const member1Id = channel.channelMembers[0];
			const member2Id = channel.channelMembers[1];

			if (!member1Id || !member2Id) {
				console.warn(
					"Defekter Channel gefiltert (undefined Member IDs):",
					channel.channelId
				);
				return false;
			}

			const currentUserInChannel = channel.channelMembers.includes(
				this.currentUser?.uid
			);

			if (!currentUserInChannel) {
				console.warn(
					"Channel gefiltert (Current User nicht Member):",
					channel.channelId
				);
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

			const pairKey = [member1Id, member2Id].sort().join("|");

			if (!seenPairs.has(pairKey)) {
				seenPairs.add(pairKey);
				uniqueChannels.push(channel);
			}
		}

		return uniqueChannels;
	}

	private getAvailableUsersForNewDM(): UserData[] {
		return this.allUsers.filter((user) => {
			const existingDM = this.directMessageChannels.find((dmChannel) => {
				return dmChannel.channelMembers.includes(user.uid);
			});

			return !existingDM;
		});
	}

	private findChannelById(id: string): ChannelData | null {
		return (
			this.channels.find((channel) => channel.channelId === id) ||
			this.directMessageChannels.find(
				(channel) => channel.channelId === id
			) ||
			(this.selfChannel && this.selfChannel.channelId === id
				? this.selfChannel
				: null) ||
			null
		);
	}

	private updateChannelMembersStatus(
		channels: ChannelData[],
		users: UserData[] | null
	): ChannelData[] {
		return channels;
	}
}
