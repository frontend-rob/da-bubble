import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	OnInit,
	Output,
	ViewChild
} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {MessageInputModalComponent} from "./message-input-modal/message-input-modal.component";
import {ChannelData} from "../../interfaces/channel.interface";
import {UserData} from "../../interfaces/user.interface";
import {ChatService} from "../../services/chat.service";
import {UserLookupService} from "../../services/user-lookup.service";

@Component({
    selector: "app-message-input-field",
    standalone: true,
    imports: [
        CommonModule,
        NgOptimizedImage,
        FormsModule,
        MessageInputModalComponent,
    ],
    templateUrl: "./message-input-field.component.html",
    styleUrl: "./message-input-field.component.scss",
})
export class MessageInputFieldComponent implements OnInit, AfterViewInit {

    @Input() selectedChannel!: ChannelData;
    @Input() placeholderText = "Type a message to";
    @Input() showChannelNameInPlaceholder: boolean = true;
    @Output() send: EventEmitter<string> = new EventEmitter<string>();
    @Output() isThread: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('messageInput') messageInput!: ElementRef;

    isEmojiModalOpen = false;
    isUserTagModalOpen = false;
    isChannelTagModalOpen = false;
    messageInputData = "";

    users!: UserData[];
    channels!: ChannelData[];
    channelsSubscription!: Subscription;
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

	private chatService = inject(ChatService);
	private elementRef = inject(ElementRef);
	private userLookupService = inject(UserLookupService);

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
     * Focuses the message input field after view initialization.
     */
    ngAfterViewInit() {
        this.focusInput();
    }

    /**
     * Returns the placeholder text for the input field.
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
	 * Handle input changes and closes modals if the tag character is removed.
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
	 * Closes the specified modal and removes the tag character if needed.
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
     * Focuses the message input field
     */
    public focusInput(): void {
        setTimeout(() => {
            if (this.messageInput?.nativeElement) {
                try {
                    this.messageInput.nativeElement.focus();
                } catch (error) {
                    console.error('Focus failed:', error);
                }
            }
        }, 100);
    }
}
