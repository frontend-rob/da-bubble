import {Component, inject, OnDestroy, OnInit, TrackByFunction,} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Message} from "../../interfaces/message.interface";
import {ChatMessageComponent} from "./chat-message-other/chat-message.component";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {Timestamp} from "@angular/fire/firestore";
import {CommonModule, NgForOf} from "@angular/common";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {HelperService} from "../../services/helper.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";

@Component({
	selector: "app-chat",
	templateUrl: "./chat.component.html",
	styleUrls: ["./chat.component.scss"],
	imports: [
		ChatMessageComponent,
		MessageInputFieldComponent,
		CommonModule,
		FormsModule,
		NgForOf
	],
})
export class ChatComponent implements OnInit, OnDestroy {
	messages$: Observable<Message[]> | undefined;
	messages!: Message[];
	channels!: ChannelData[];
	selectedChannel!: ChannelData;
	newChannelName: string = "";
	newChannelDescription: string = "";
	newMessageInputData!: string;
	currentUser!: UserData;
	userSubscription!: Subscription;
	channelsSubscription!: Subscription;
	functionTriggerSubscription!: Subscription;

	isModalBGOpen = false;
	isModalOpen = false;
	isNameEdit = false;
	isDescriptionEdit = false;
	isAddNewChannel = false;
	isMembersMenuOpen = false;
	isAddMemberModalOpen = false;
	disabledButton = true;
	allUserDataSubscription!: Subscription;
	allUserData!: UserData[];
	selectedUsersToAdd: UserData[] = [];

	searchText: string = "";
	filteredUsers: UserData[] = [];

	private userService: UserService = inject(UserService);
	private helperService: HelperService = inject(HelperService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);

	constructor(public chatService: ChatService) {
		this.selectedChannel = this.chatService.selectedChannel;
	}

	get isNewMessage() {
		return this.chatService.isNewMessage;
	}

	get isProfileCardOpen() {
		return this.chatService.isProfileCardOpen;
	}

	ngOnInit(): void {
		this.functionTriggerSubscription =
			this.functionTriggerService.trigger$.subscribe((channel) => {
				this.selectChannel(channel);
			});

		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentUser = userData;
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

		this.channelsSubscription = this.chatService.getChannels().subscribe(
			(channelsData: ChannelData[]) => {
				if (channelsData) {
					this.channels = channelsData;
				}
			},
			(error) => {
				console.error("Error loading channels:", error);
			}
		);
	}

	handleProfileCard(bool: boolean, person: UserData) {
		if (this.currentUser.uid !== person.uid) {
			this.chatService.handleProfileCard(bool);
			this.chatService.setCurrentPerson(person);
		}
	}

	trackByMessageId: TrackByFunction<Message> = (
		index: number,
		message: Message
	) => {
		return (message as any).id || index;
	};

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

	onKeyDown(event: KeyboardEvent): void {
		// TODO: ADD LOGIC
		if (event.key === "Enter" && this.isNewMessage) {
		}

		if (event.key === "Escape" && this.isNewMessage) {
			this.chatService.handleNewMessage(false);
		}
	}

	openMembersMenu() {
		this.isModalBGOpen = true;
		this.isMembersMenuOpen = true;
	}

	openAddMemberModal() {
		this.isModalBGOpen = true;
		this.isMembersMenuOpen = false;
		this.isAddMemberModalOpen = true;
	}

	onSearchInputChange(): void {
		const text = this.searchText.trim().toLowerCase();
		const currentMembers = this.chatService.selectedChannel.channelMembers;

		this.filteredUsers = this.allUserData.filter(
			(user) =>
				user.userName.toLowerCase().includes(text) &&
				!this.selectedUsersToAdd.some((sel) => sel.uid === user.uid) &&
				!currentMembers.some((member) => member.uid === user.uid)
		);

		if (this.searchText.length === 0) {
			this.filteredUsers = [];
		}
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

	async addNewMember() {
		const channel = this.chatService.selectedChannel;

		if (!channel || this.selectedUsersToAdd.length === 0) return;

		const newUsers = this.selectedUsersToAdd.filter(
			(newUser) =>
				!channel.channelMembers.some(
					(existing) => existing.uid === newUser.uid
				)
		);

		const updatedChannel: ChannelData = {
			...channel,
			channelMembers: [...channel.channelMembers, ...newUsers],
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

	handleInputData() {
		if (
			this.newMessageInputData[0] === "#" &&
			this.newMessageInputData.length > 1
		) {
			console.log("New MessageInput:", "#");

			for (const channel of this.channels) {
				// Compare input with existing channels
				if (this.newMessageInputData === "#" + channel.channelName) {
					//  Set current chat to active
				} else {
					// Create Channel
					// - Channelname without description
					// - Push to firebase
					// - Show new channel in chat area
				}
			}
		}

		if (
			this.newMessageInputData[0] === "@" &&
			this.newMessageInputData.length > 1
		) {
			console.log("New MessageInput:", "@");
		}
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
