import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Observable, of, Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Message} from "../../interfaces/message.interface";
import {UserData} from "../../interfaces/user.interface";
import {UserPresence} from "../../services/presence.service";
import {CommonModule} from "@angular/common";
import {ChatHeaderComponent} from "./chat-header/chat-header.component";
import {ChatMembersComponent} from "./chat-members/chat-members.component";
import {ChannelModalComponent} from "./channel-modal/channel-modal.component";
import {NewMessageHeaderComponent} from "./new-message-header/new-message-header.component";
import {ChatMessageComponent} from "./chat-message-other/chat-message.component";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {AutoScrollingDirective} from "../../directive/auto-scrolling.directive";
import {ChatManagementService} from "../../services/chat-management.service";

@Component({
	selector: "app-chat",
	standalone: true,
	imports: [
		CommonModule,
		ChatHeaderComponent,
		ChatMembersComponent,
		ChannelModalComponent,
		NewMessageHeaderComponent,
		ChatMessageComponent,
		MessageInputFieldComponent,
		AutoScrollingDirective
	],
	templateUrl: "./chat.component.html",
	styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit, OnDestroy {
	@ViewChild(MessageInputFieldComponent) messageInputField!: MessageInputFieldComponent;

	// Core data
	messages: Message[] = [];
	selectedChannel!: ChannelData;
	currentUser!: UserData;
	otherUser$!: Observable<UserData | null>;
	otherUserPresence$!: Observable<UserPresence | null>;
	screenWidth!: number;

	// UI State
	isModalBGOpen = false;
	isAddNewChannel = false;
	isMembersMenuOpen = false;
	isAddMemberModalOpen = false;
	isNameEdit = false;
	isDescriptionEdit = false;

	// User management
	selectedUsersToAdd: UserData[] = [];
	filteredUsers: UserData[] = [];
	searchText = '';
	disabledButton = true;
	newMessageInputData = '';
	newChannelName = '';
	newChannelDescription = '';

	private subscriptions: Subscription[] = [];

	constructor(
		public readonly chatService: ChatService,
		private chatManagementService: ChatManagementService,
		private functionTriggerService: FunctionTriggerService
	) {
		// Entferne die direkte Zuweisung
		// this.selectedChannel = this.chatService.selectedChannel;
	}

	get isNewMessage(): boolean {
		return this.chatService.isNewMessage;
	}

	get isProfileCardOpen(): boolean {
		return this.chatService.isProfileCardOpen;
	}

	ngOnInit(): void {
		// Höre auf Channel-Auswahl Events
		const channelSelectionSub = this.functionTriggerService.trigger$.subscribe(channel => {
			console.log('Channel selected via trigger service:', channel);
			this.selectedChannel = channel;
			this.chatService.setSelectedChannel(channel);
			this.chatManagementService.initializeChat(this);
		});

		this.subscriptions.push(channelSelectionSub);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	// Rest der Klasse bleibt unverändert...
	onOpenModal(): void {
		this.isModalBGOpen = true;
		this.isAddNewChannel = true;
		this.isNameEdit = false;
		this.isDescriptionEdit = false;
	}

	onOpenMembersMenu(): void {
		this.isMembersMenuOpen = true;
	}

	onOpenAddMemberModal(): void {
		this.isAddMemberModalOpen = true;
	}

	onCloseModals(): void {
		this.isModalBGOpen = false;
		this.isAddNewChannel = false;
		this.isMembersMenuOpen = false;
		this.isAddMemberModalOpen = false;
	}

	onProfileCardToggle(event: { show: boolean, user: UserData }): void {
		this.chatService.handleProfileCard(event.show);
		this.chatService.setCurrentPerson(event.user);
	}

	onToggleNameEdit(): void {
		this.chatManagementService.toggleNameEdit(this);
	}

	onToggleDescriptionEdit(): void {
		this.chatManagementService.toggleDescriptionEdit(this);
	}

	onLeaveChannel(): void {
		this.chatManagementService.leaveChannel();
	}

	async onSendChatMessage(content: string): Promise<void> {
		await this.chatManagementService.sendChatMessage(content, this.currentUser);
	}

	onInputDataChange(): void {
		console.log('Input data changed:', this.newMessageInputData);
	}

	onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			// Handle Enter key
		}
	}

	addUserToSelection(user: UserData): void {
		if (!this.selectedUsersToAdd.find(u => u.uid === user.uid)) {
			this.selectedUsersToAdd.push(user);
		}
	}

	removeUserFromSelection(user: UserData): void {
		this.selectedUsersToAdd = this.selectedUsersToAdd.filter(u => u.uid !== user.uid);
	}

	onSearchInputChange(): void {
		console.log('Search input changed:', this.searchText);
	}

	addNewMember(): void {
		console.log('Adding new members:', this.selectedUsersToAdd);
	}

	getMemberPresence(uid: string): Observable<UserPresence | null> {
		return of(null); // Placeholder
	}

	shouldShowDate(messages: Message[], index: number): boolean {
		if (index === 0) return true;
		return messages[index].date !== messages[index - 1].date;
	}

	trackByMessageId(index: number, message: Message): any {
		return (message as any).id || index;
	}
}
