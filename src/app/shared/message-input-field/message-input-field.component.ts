import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ChannelData} from "../../interfaces/channel.interface";
import {MessageInputModalComponent} from "./message-input-modal/message-input-modal.component";
import {UserData} from "../../interfaces/user.interface";
import {Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {UserLookupService} from "../../services/user-lookup.service";

@Component({
	selector: "app-message-input-field",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MessageInputModalComponent,
		NgOptimizedImage
	],
	templateUrl: "./message-input-field.component.html",
	styleUrl: "./message-input-field.component.scss",
})
export class MessageInputFieldComponent implements OnInit {

	@Input() selectedChannel!: ChannelData;
	@Input() placeholderText = "Type a message to";
	@Input() showChannelNameInPlaceholder: boolean = true;
	@Output() send: EventEmitter<string> = new EventEmitter<string>();
	@Output() isThread: EventEmitter<boolean> = new EventEmitter<boolean>();

	isEmojiModalOpen = false;
	isUserTagModalOpen = false;
	isChannelTagModalOpen = false;

	messageInputData = "";
	users!: UserData[];
	channelsSubscription!: Subscription;
	channels!: ChannelData[];
	usersSubscription!: Subscription;

	emojiList: string[] = [
		"\u{1F60A}", // 😊
		"\u{1F602}", // 😂
		"\u{1F60D}", // 😍
		"\u{1F60E}", // 😎
		"\u{1F914}", // 🤔
		"\u{1F973}", // 🥳
		"\u{1F389}", // 🎉
		"\u{1F9D1}\u{200D}\u{1F4BB}", // 🧑‍💻
		"\u{1F44D}", // 👍
		"\u{1F44C}", // 👌
		"\u{2764}\u{FE0F}", // ❤️
		"\u{1F525}", // 🔥
		"\u{2B50}", // ⭐
		"\u{1F4AF}", // 💯
		"\u{2705}", // ✅
		"\u{1F680}", // 🚀
	];

	/**
	 * Creates the component and injects required services.
	 * @param chatService Service for chat and channel data
	 * @param elementRef Reference to the component's DOM element
	 * @param userLookupService
	 */
	constructor(private chatService: ChatService, private elementRef: ElementRef, private userLookupService: UserLookupService) {
	}

	/**
	 * Initializes users and subscribes to channel updates.
	 */
	ngOnInit() {
		this.usersSubscription = this.userLookupService.getUsersByIds(this.chatService.selectedChannel.channelMembers).subscribe(users => {
			this.users = users;
		})
		this.channelsSubscription = this.chatService
			.getChannels()
			.subscribe((channels) => {
				this.channels = channels.filter(
					(channel) => !channel.channelType.directMessage
				);
			});
	}

	/**
	 * Closes all modals if a click occurs outside the component.
	 * @param event Mouse event
	 */
	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.closeAllModals();
		}
	}

	/**
	 * Closes all modals if Escape is pressed anywhere in the document.
	 * @param event Keyboard event
	 */
	@HostListener('document:keydown', ['$event'])
	onDocumentKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			this.closeAllModals();
		}
	}

	/**
	 * Opens the specified modal and closes others.
	 * @param modal Modal type to open
	 */
	private openModal(modal: 'emoji' | 'user' | 'channel') {
		this.closeAllModals();
		if (modal === 'emoji') this.isEmojiModalOpen = true;
		if (modal === 'user') {
			this.isUserTagModalOpen = true;
			this.messageInputData += '@';
		}
		if (modal === 'channel') {
			this.isChannelTagModalOpen = true;
			this.messageInputData += '#';
		}
	}

	/**
	 * Closes the specified modal and removes tag character if needed.
	 * @param modal Modal type to close
	 */
	private closeModal(modal: 'emoji' | 'user' | 'channel') {
		if (modal === 'emoji') this.isEmojiModalOpen = false;
		if (modal === 'user') {
			this.isUserTagModalOpen = false;
			if (this.messageInputData.endsWith('@')) {
				this.messageInputData = this.messageInputData.slice(0, -1);
			}
		}
		if (modal === 'channel') {
			this.isChannelTagModalOpen = false;
			if (this.messageInputData.endsWith('#')) {
				this.messageInputData = this.messageInputData.slice(0, -1);
			}
		}
	}

	/**
	 * Closes all modals.
	 */
	closeAllModals() {
		this.closeModal('emoji');
		this.closeModal('user');
		this.closeModal('channel');
	}

	/**
	 * Toggles the emoji modal.
	 */
	toggleEmojiModal() {
		this.isEmojiModalOpen ? this.closeModal('emoji') : this.openModal('emoji');
	}

	/**
	 * Toggles the user tag modal.
	 */
	toggleUserTagModal() {
		this.isUserTagModalOpen ? this.closeModal('user') : this.openModal('user');
	}

	/**
	 * Toggles the channel tag modal.
	 */
	toggleChannelTagModal() {
		this.isChannelTagModalOpen ? this.closeModal('channel') : this.openModal('channel');
	}

	/**
	 * Handles keydown events in the input field (Enter, @, #).
	 * @param event Keyboard event
	 */
	onKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			this.trySendMessage();
		}
		if (event.key === '@') {
			this.openModal('user');
		}
		if (event.key === '#') {
			this.openModal('channel');
		}
	}

	/**
	 * Handles input changes and closes modals if tag character is removed.
	 */
	onInput(): void {
		if (this.isUserTagModalOpen && !this.messageInputData.includes('@')) {
			this.closeModal('user');
		}
		if (this.isChannelTagModalOpen && !this.messageInputData.includes('#')) {
			this.closeModal('channel');
		}
	}

	/**
	 * Tries to send the current message if not empty.
	 */
	trySendMessage() {
		const trimmedMessage = this.messageInputData.trim();
		if (trimmedMessage.length > 0) {
			this.send.emit(trimmedMessage);
			this.messageInputData = "";
		}
	}

	/**
	 * Adds a user tag to the message input and closes the user modal.
	 * @param user The user to tag
	 */
	addUserTag(user: UserData) {
		this.messageInputData += user.userName;
		this.isUserTagModalOpen = false;
	}

	/**
	 * Adds a channel tag to the message input and closes the channel modal.
	 * @param channelName The channel name to tag
	 */
	addChannelTag(channelName: string) {
		this.messageInputData += channelName;
		this.isChannelTagModalOpen = false;
	}

	/**
	 * Adds an emoji to the message input and closes the emoji modal.
	 * @param emoji The emoji to add
	 */
	addEmoji(emoji: string) {
		this.messageInputData += emoji;
		this.isEmojiModalOpen = false;
	}

	/**
	 * Returns the placeholder text for the input field.
	 *
	 * - For direct messages, shows the chat partner's name (not currentPerson).
	 * - For channels, shows the channel name if showChannelNameInPlaceholder is true.
	 * - If showChannelNameInPlaceholder is false, only the placeholderText is shown.
	 *
	 * @returns {string} The placeholder text to display
	 */
	get placeholder(): string {
		const channel = this.chatService.selectedChannel;
		if (!channel) return this.placeholderText;

		if (channel.channelType?.directMessage) {
			const otherUserId = channel.channelMembers.find(uid => uid !== this.chatService.currentPerson?.uid);
			const otherUser = this.users?.find(u => u.uid === otherUserId);
			const name = otherUser?.userName || "user";
			return `${this.placeholderText} @${name}`;
		} else if (this.showChannelNameInPlaceholder && channel.channelName) {
			return `${this.placeholderText} #${channel.channelName}`;
		}
		return this.placeholderText;
	}
}
