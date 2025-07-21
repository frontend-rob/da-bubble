import {Component, inject, OnDestroy, OnInit, TrackByFunction,} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {combineLatest, map, Observable, of, Subscription, switchMap} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Message} from "../../interfaces/message.interface";
import {ChatMessageComponent} from "./chat-message-other/chat-message.component";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {Timestamp} from "@angular/fire/firestore";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {HelperService} from "../../services/helper.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {AutoScrollingDirective} from "../../directive/auto-scrolling.directive";
import {UserLookupService} from "../../services/user-lookup.service";
import {ChannelUserPipe} from "../../services/channel-user.pipe";
import {ResponsiveService} from "../../services/responsive.service";
import {PresenceService, UserPresence} from "../../services/PresenceManagementService";

@Component({
	selector: "app-chat",
	templateUrl: "./chat.component.html",
	styleUrls: ["./chat.component.scss"],
	imports: [
		ChatMessageComponent,
		MessageInputFieldComponent,
		CommonModule,
		FormsModule,
		NgForOf,
		NgOptimizedImage,
		AutoScrollingDirective,
		ChannelUserPipe,
	],
})
export class ChatComponent implements OnInit, OnDestroy {
	messages$: Observable<Message[]> | undefined;
	messages: Message[] = [];
	selectedChannel!: ChannelData;
	newChannelName: string = "";
	newChannelDescription: string = "";
	currentUser!: UserData;
	userSubscription!: Subscription;
	otherUser$!: Observable<UserData | null>;
	otherUserPresence$!: Observable<UserPresence | null>;
	functionTriggerSubscription!: Subscription;

	isModalBGOpen = false;
	isModalOpen = false;
	isNameEdit = false;
	isDescriptionEdit = false;
	isAddNewChannel = false;
	isMembersMenuOpen = false;
	isAddMemberModalOpen = false;
	disabledButton = true;
	channels!: ChannelData[];
	newMessageInputData!: string;
	allUserDataSubscription!: Subscription;
	allUserData!: UserData[];
	selectedUsersToAdd: UserData[] = [];

	searchText: string = "";
	isSearchedUser!: UserData;
	filteredUsers: UserData[] = [];

	daysOfWeek = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	formattedDate = `${this.daysOfWeek[new Date().getDay()]}, ${
		this.months[new Date().getMonth()]
	} ${new Date().getDate()}`;

	private userLookupService: UserLookupService = inject(UserLookupService);
    private presenceService = inject(PresenceService);
	private responsiveService: ResponsiveService = inject(ResponsiveService);
	private userService: UserService = inject(UserService);
	private helperService: HelperService = inject(HelperService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);
	screenWidthSubscription!: Subscription;
	screenWidth!: number;

	constructor(public readonly chatService: ChatService) {
		this.selectedChannel = this.chatService.selectedChannel;
	}

	getMemberPresence(uid: string): Observable<UserPresence | null> {
		return this.presenceService.getUserPresence(uid);
	}

	get isNewMessage() {
		return this.chatService.isNewMessage;
	}

	get isProfileCardOpen() {
		return this.chatService.isProfileCardOpen;
	}

	handleProfileCard(bool: boolean, person: UserData) {
		this.chatService.handleProfileCard(bool);
		this.chatService.setCurrentPerson(person);
	}

	/**
	 * Gets the other user in a direct message channel (not the current user)
	 * @returns The other user in the direct message channel
	 */
	getOtherUserInDirectMessage(): Observable<UserData | null> {
		const selectedChannel = this.chatService.selectedChannel;

		if (!selectedChannel || !selectedChannel.channelType?.directMessage) {
			return of(null);
		}

		const isSelfChannel = selectedChannel.channelMembers.every(
			(member) => member === this.currentUser.uid
		);

		if (isSelfChannel) {
			return of(this.currentUser);
		}

		const otherUserId = selectedChannel.channelMembers.find(
			(member) => member !== this.currentUser.uid
		);

		if (otherUserId) {
			console.log(otherUserId);
			return this.userLookupService
				.getUserById(otherUserId)
				.pipe(map((user) => user || null));
		}

		return of(null);
	}

	trackByMessageId: TrackByFunction<Message> = (
		index: number,
		message: Message
	) => {
		return (message as any).id || index;
	};

	ngOnInit(): void {
    this.otherUser$ = this.getOtherUserInDirectMessage();
    
    this.otherUserPresence$ = this.otherUser$.pipe(
        switchMap(user => {
            if (user?.uid) {
                console.log('Getting presence for user:', user.uid); // Debug log
                return this.presenceService.getUserPresence(user.uid);
            } else {
                return of(null);
            }
        })
    );

    this.functionTriggerSubscription =
        this.functionTriggerService.trigger$.subscribe((channel) => {
            this.selectChannel(channel);
        });
    
    this.userSubscription = this.userService.currentUser$.subscribe(
        (userData) => {
            if (userData) {
                this.currentUser = userData;
                this.initializeDirectMessageObservables();
            }
        }
    );

		this.allUserDataSubscription = this.userService.allUsers$.subscribe(
			(userData) => {
				if (userData) {
					this.allUserData = userData.filter(
						(user) =>
							user.uid !== this.currentUser.uid &&
							user.userName !== "Guest"
					);
				}
			}
		);
		this.chatService.getChannels().subscribe((channels: ChannelData[]) => {
			this.channels = channels;
		});
		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

private initializeDirectMessageObservables(): void {
    this.otherUser$ = this.getOtherUserInDirectMessage();
    
    this.otherUserPresence$ = this.otherUser$.pipe(
        switchMap(user => {
            if (user?.uid) {
                return this.presenceService.getUserPresence(user.uid);
            } else {
                return of(null);
            }
        })
    );
}

	selectChannel(channel: ChannelData): void {
		this.chatService.selectedChannel = channel;
		this.newChannelName = channel.channelName;
		this.newChannelDescription = channel.channelDescription;
		this.messages$ = this.chatService.getMessages(
			channel.channelId.toString()
		);
		this.messages$.subscribe((messages) => {
			this.chatService.selectedChannelsMessages = messages;
			this.messages = messages;
		});
	}

	openModal(): void {
		this.isModalBGOpen = true;
		this.isModalOpen = !this.isModalOpen;
		this.isAddNewChannel = !this.isAddNewChannel;
		this.isNameEdit = false;
		this.isDescriptionEdit = false;
	}

	toggleNameEdit(): void {
		if (this.isNameEdit && this.chatService.selectedChannel) {
			const updatedChannel = {
				...this.chatService.selectedChannel,
				channelName: this.newChannelName,
				updatedAt: Timestamp.now(),
			};
			this.updateChannel(updatedChannel).then((r) => {
				console.log(r);
			});
		}
		this.isNameEdit = !this.isNameEdit;
	}

	toggleDescriptionEdit(): void {
		if (this.isDescriptionEdit && this.chatService.selectedChannel) {
			const updatedChannel = {
				...this.chatService.selectedChannel,
				channelDescription: this.newChannelDescription,
				updatedAt: Timestamp.now(),
			};
			this.updateChannel(updatedChannel).then((r) => {
				console.log(r);
			});
		}
		this.isDescriptionEdit = !this.isDescriptionEdit;
	}

	async sendChatMessage(content: string): Promise<void> {
		if (!this.chatService.selectedChannel || !content.trim()) {
			return console.log(this.chatService.selectedChannel);
		}
		const message: Message = {
			text: content,
			sender: this.currentUser,
			edited: false,
			timestamp: Timestamp.fromDate(new Date()),
			time: this.helperService.getBerlinTime24h(),
			date: this.helperService.getBerlinDateFormatted(),
			reactions: [],
		};
		try {
			await this.chatService.sendMessage(
				this.chatService.selectedChannel.channelId.toString(),
				message
			);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}

	shouldShowDate(messages: Message[], index: number): boolean {
		if (index === 0) return true;
		return messages[index].date !== messages[index - 1].date;
	}

	ngOnDestroy() {
		this.userSubscription.unsubscribe();
		this.functionTriggerSubscription.unsubscribe();
	}

	openMembersMenu() {
		this.isModalBGOpen = true;
		this.isMembersMenuOpen = true;
	}

	openAddMemberModal() {
		if (this.screenWidth < 768 && !this.isMembersMenuOpen) {
			this.openMembersMenu();
		} else {
			this.isModalBGOpen = true;
			this.isMembersMenuOpen = false;
			this.isAddMemberModalOpen = true;
		}
	}

	onSearchInputChange(): void {
		const text = this.searchText?.trim().toLowerCase() ?? "";
		const currentMembers =
			this.chatService.selectedChannel?.channelMembers ?? [];
		if (!text) {
			this.filteredUsers = [];
			return;
		}
		this.filteredUsers =
			this.allUserData?.filter(
				(user) =>
					user.userName.toLowerCase().includes(text) &&
					!this.selectedUsersToAdd?.some(
						(sel) => sel.uid === user.uid
					) &&
					!currentMembers.includes(user.uid)
			) ?? [];
	}

	addUserToSelection(user: UserData): void {
		this.selectedUsersToAdd.push(user);
		this.filteredUsers = [];
		this.searchText = "";
		this.disabledButton = false;
	}

	removeUserFromSelection(user: UserData): void {
		this.selectedUsersToAdd = this.selectedUsersToAdd.filter(
			(u) => u.uid !== user.uid
		);
	}

	async leaveChannel() {
		try {
			await this.chatService.removeUserFromChannel(
				this.chatService.selectedChannel.channelId,
				this.currentUser.uid
			);

			this.closeModals();
			this.selectChannel(this.chatService.selectedChannel);
		} catch (error) {
			console.error("Error leaving channel:", error);
		}
	}

	async addNewMember() {
		const channel = this.chatService.selectedChannel;

		if (!channel || this.selectedUsersToAdd.length === 0) return;

		const newUsers = this.selectedUsersToAdd.filter(
			(newUser) => !channel.channelMembers.includes(newUser.uid)
		);

		const updatedChannel: ChannelData = {
			...channel,
			channelMembers: [
				...channel.channelMembers,
				...newUsers.map((user) => user.uid),
			],
			updatedAt: Timestamp.now(),
		};

		try {
			await this.chatService.updateChannel(updatedChannel);
			this.chatService.selectedChannel = updatedChannel;

			this.selectedUsersToAdd = [];
			this.closeModals();
		} catch (error) {
			console.error("Error adding members:", error);
		}
	}

	onKeyDown(event: KeyboardEvent): void {
		if (event.key === "Enter" && this.isNewMessage) {
			this.submitNewMessageInput();
		}

		if (event.key === "Escape" && this.isNewMessage) {
			this.chatService.handleNewMessage(false);
		}
	}

	closeModals() {
		this.isModalBGOpen = false;
		this.isModalOpen = false;
		this.isNameEdit = false;
		this.isDescriptionEdit = false;
		this.isAddNewChannel = false;
		this.isMembersMenuOpen = false;
		this.isAddMemberModalOpen = false;
		this.searchText = "";
		this.selectedUsersToAdd = [];
		this.filteredUsers = [];
		this.disabledButton = true;
	}

	// Function is for dropdown
	handleInputData() {
		if (
			this.newMessageInputData[0] === "#" &&
			this.newMessageInputData.length > 1
		) {
			if (this.channels) {
				for (const channel of this.channels) {
					if (
						this.newMessageInputData ===
						"#" + channel.channelName
					) {
						//  Set the current chat to active
					}
				}
			}
		}
	}

	addNewChannel(name: string, type: string, description: string = "") {
		const newChannel: ChannelData = {
			channelId: this.helperService.getRandomNumber().toString(),
			channelName: name,
			channelType: {
				channel: type === "channel" ? true : false,
				directMessage: type === "directMessage" ? true : false,
			},
			channelDescription: description,
			createdBy: this.currentUser.uid,
			channelMembers: [this.currentUser.uid],
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		};
		this.chatService.createChannel(newChannel);
	}

	submitNewMessageInput() {
		const isChannel = this.channels.find(
			(channel) => this.newMessageInputData === "#" + channel.channelName
		);
		const isDirectMessage = this.channels.find(
			(channel) => this.newMessageInputData === "@" + channel.channelName
		);
		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		const isEmailAdress = emailPattern.test(this.newMessageInputData);

		if (isChannel && isChannel.channelType.channel && !isEmailAdress) {
			this.chatService.setActiveChat(isChannel.channelId);
			this.chatService.selectedChannel = isChannel;
			this.chatService.handleNewMessage(false);
			this.newMessageInputData = "";
		} else if (
			isDirectMessage &&
			isDirectMessage.channelType.directMessage &&
			!isEmailAdress
		) {
			this.chatService.setActiveChat(isDirectMessage.channelId);
			this.chatService.selectedChannel = isDirectMessage;
			this.chatService.handleNewMessage(false);
			this.newMessageInputData = "";
		} else if (isEmailAdress && !isDirectMessage && !isChannel) {
			// Find user by email in allUserData
			const userWithEmail = this.allUserData.find(
				(user) => user.email === this.newMessageInputData
			);

			if (userWithEmail) {
				this.isSearchedUser = userWithEmail;

				// Find channel that contains both the current user and the searched user
				const directMessageChannel = this.channels.find(
					(channel) =>
						channel.channelType.directMessage &&
						channel.channelMembers.includes(this.currentUser.uid) &&
						channel.channelMembers.includes(userWithEmail.uid)
				);
				if (directMessageChannel) {
					this.chatService.selectedChannel = directMessageChannel;
					this.chatService.setActiveChat(this.isSearchedUser.uid);
				}
			}
		} else {
			if (this.newMessageInputData[0] === "#") {
				this.addNewChannel(
					this.newMessageInputData.slice(1),
					"channel"
				);
			} else if (this.newMessageInputData[0] === "@") {
				this.addNewChannel(
					this.newMessageInputData.slice(1),
					"directMessage"
				);
			}
			this.chatService.handleNewMessage(false);
			this.newMessageInputData = "";
		}
	}

	findDirectMessage(
		arr: string[],
		userId1: string,
		userId2: string
	): boolean {
		const hasUser1 = arr.includes(userId1);
		const hasUser2 = arr.includes(userId2);
		return hasUser1 && hasUser2;
	}

	private async updateChannel(channel: ChannelData): Promise<void> {
		if (!channel.channelId) {
			return;
		}
		try {
			await this.chatService.updateChannel(channel);
			this.selectChannel(channel);
		} catch (error) {
			console.error("Error updating channel:", error);
		}
	}
}
