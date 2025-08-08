import {Component, inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Observable, Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Message} from "../../interfaces/message.interface";
import {UserData} from "../../interfaces/user.interface";
import {UserPresence} from "../../services/presence.service";
import {CommonModule} from "@angular/common";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {ChatManagementService} from "../../services/chat-management.service";
import {ChatMembersComponent} from "./chat-members/chat-members.component";
import {ChatHeaderComponent} from "./chat-header/chat-header.component";
import {ChannelModalComponent} from "./channel-modal/channel-modal.component";
import {NewMessageHeaderComponent} from "./new-message-header/new-message-header.component";
import {ChatMessageComponent} from "./chat-message-other/chat-message.component";
import {AutoScrollingDirective} from "../../directive/auto-scrolling.directive";

@Component({
	selector: "app-chat",
	standalone: true,
	imports: [
		CommonModule,
		ChatMembersComponent,
		ChatHeaderComponent,
		ChannelModalComponent,
		NewMessageHeaderComponent,
		ChatMessageComponent,
		AutoScrollingDirective,
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
	private chatService = inject(ChatService);
	private chatManagementService = inject(ChatManagementService);
	private functionTriggerService = inject(FunctionTriggerService);

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
		const channelId = this.selectedChannel?.channelId;
		if (!channelId) {
			console.warn('Kein Channel ausgewählt – Nachricht wird nicht gesendet.');
			return;
		}
		await this.chatManagementService.sendChatMessage(content, this.currentUser, channelId);
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

	shouldShowDate(messages: Message[], index: number): boolean {
		if (index === 0) return true;
		return messages[index].date !== messages[index - 1].date;
	}

	trackByMessageId(index: number, message: Message): any {
		return (message as any).id || index;
	}
}
