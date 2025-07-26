import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {debounceTime, distinctUntilChanged, filter, fromEvent, Subject, Subscription, takeUntil} from "rxjs";
import {IdtMessages, Reaction} from "../../../interfaces/message.interface";
import {ChatService} from "../../../services/chat.service";
import {ChatOptionBarComponent} from "../chat-option-bar/chat-option-bar.component";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {UserService} from "../../../services/user.service";
import {UserData} from "../../../interfaces/user.interface";
import {Timestamp} from "@angular/fire/firestore";
import {FormsModule} from "@angular/forms";
import {chatMessageTagLink} from "../../../pipes/chat-message-tag-link.pipe";
import {UserLookupService} from "../../../services/user-lookup.service";
import {ChannelUsersPipe} from "../../../services/channel-user.pipe";
import {UserDataFromUidPipe} from "../../../pipes/user-data-from-uid.pipe";


@Component({
	selector: "app-chat-message-other",
	imports: [
		CommonModule,
		ChatOptionBarComponent,
		FormsModule,
		NgOptimizedImage,
		chatMessageTagLink,
		ChannelUsersPipe,
		UserDataFromUidPipe
	],
	templateUrl: "./chat-message.component.html",
	styleUrl: "./chat-message.component.scss",
	standalone: true
})
export class ChatMessageComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
	@Input() message!: IdtMessages;
	@Input() isThisAThreadMessage!: boolean;
	currentUserSubscription!: Subscription;
	currentUser!: UserData;
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
	isEditing: boolean = false;
	editedText: string = "";
	hovered: boolean = false;
	isEmojiModalOpen: boolean = false;
	isOptionsMenuOpen: boolean = false;
	showAllReactions: boolean = false;
	@ViewChild(ChatOptionBarComponent) optionBar!: ChatOptionBarComponent;
	@ViewChild('messageContent', {static: false}) messageContentRef!: ElementRef;
	private destroy$ = new Subject<void>();
	private focusDebounce$ = new Subject<void>();
	private _cachedGroupedReactions: { emoji: string; count: number; users: string[] }[] = [];
	private _cachedUserReactions: Record<string, boolean> = {};
	private _isOwnMessageCache: boolean | null = null;

	constructor(
		public chatService: ChatService,
		private userService: UserService,
		private userLookup: UserLookupService
	) {
	}

	isOwnMessage(): boolean {
		if (this._isOwnMessageCache === null && this.currentUser && this.message) {
			this._isOwnMessageCache = this.message.uid === this.currentUser.uid;
		}
		return this._isOwnMessageCache !== null ? this._isOwnMessageCache : false;
	}

	groupedReactions(): { emoji: string; count: number; users: string[] }[] {
		if (this._cachedGroupedReactions.length > 0 || !this.message.reactions) {
			return this._cachedGroupedReactions;
		}

		const groupedEmojis = this.message.reactions.reduce((acc, reaction) => {
			if (!acc[reaction.emoji]) {
				acc[reaction.emoji] = {count: 0, users: []};
			}
			acc[reaction.emoji].count++;
			acc[reaction.emoji].users.push(reaction.userName);
			return acc;
		}, {} as Record<string, { count: number; users: string[] }>);

		this._cachedGroupedReactions = Object.entries(groupedEmojis).map(([emoji, data]) => ({
			emoji,
			count: data.count,
			users: data.users,
		}));

		return this._cachedGroupedReactions;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['message']) {
			this.resetCaches();
		}
	}

	ngOnInit() {
		this.setupFocusListener();

		this.currentUserSubscription = this.userService.currentUser$.subscribe(
			(user) => {
				if (user) {
					this.currentUser = user;
					this._isOwnMessageCache = null;
					this._cachedUserReactions = {};
				}
			}
		);
	}

	/**
	 * Reset all caches
	 */
	private resetCaches(): void {
		this._cachedGroupedReactions = [];
		this._cachedUserReactions = {};
		this._isOwnMessageCache = null;
	}

	ngAfterViewInit() {
		this.setupEventDelegation();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();

		if (this.currentUserSubscription) {
			this.currentUserSubscription.unsubscribe();
		}
		this.cleanupEventHandlers();
	}

	openThread() {
		this.chatService.handleThread(true);
		if (this.message.messageId) {
			this.chatService.selectedThreadMessageId = this.message.messageId;
		}
		if (window.innerWidth <= 1024) {
			const chatElement = document.querySelector('app-chat');
			if (chatElement) {
				(chatElement as HTMLElement).style.display = 'none';
			}
		}
	}

	toggleHovered(bool: boolean) {
		this.hovered = bool;
	}

	handleProfileCard(bool: boolean, person: string) {
		this.userLookup.getUserById(person).subscribe((user: UserData | undefined) => {
			if (user) {
				this.chatService.handleProfileCard(bool);
				this.chatService.setCurrentPerson(user);
			}
		});
	}

	handleEmojiReaction(emoji: string, message: IdtMessages) {
		if (!message.reactions) {
			message.reactions = [];
		}

		const reaction: Reaction = {
			emoji: emoji,
			userId: this.currentUser.uid,
			userName: this.currentUser.userName,
			timestamp: Timestamp.fromDate(new Date()),
		};

		const existingReactionIndex = message.reactions.findIndex(
			(r) => r.emoji === emoji && r.userId === this.currentUser.uid
		);

		if (existingReactionIndex === -1) {
			message.reactions.push(reaction);
		} else {
			message.reactions.splice(existingReactionIndex, 1);
		}

		// Reset caches when reactions change
		this._cachedGroupedReactions = [];
		this._cachedUserReactions = {};

		if (message.messageId) {
			if (this.isThisAThreadMessage) {
				this.chatService.updateThreadMessageReactions(
					this.chatService.selectedChannel.channelId,
					this.chatService.selectedThreadMessageId,
					message.messageId,
					message.reactions
				).then(r => {
					console.info('Thread reaction updated:', r);
				});
			} else {
				this.chatService.updateMessageReactions(
					this.chatService.selectedChannel.channelId,
					message.messageId,
					message.reactions
				).then(r => {
					console.info('Message reaction updated:', r);
				});
			}
		}
	}

	hasUserReacted(emoji: string): boolean {
		// Check cache first
		if (emoji in this._cachedUserReactions) {
			return this._cachedUserReactions[emoji];
		}

		// Calculate and cache the result
		if (!this.message.reactions) {
			this._cachedUserReactions[emoji] = false;
			return false;
		}

		const hasReacted = this.message.reactions.some(
			(r) => r.emoji === emoji && r.userId === this.currentUser.uid
		);

		this._cachedUserReactions[emoji] = hasReacted;
		return hasReacted;
	}

	startEditingMessage(message: IdtMessages) {
		this.isEditing = true;
		this.editedText = message.text;
        setTimeout(() => {
            const textarea = document.querySelector('.message-edit-input') as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        }, 0);
	}

	saveEditedMessage() {
		if (this.message.messageId && this.editedText.trim() !== "") {
			this.chatService.updateMessageText(
				this.chatService.selectedChannel.channelId,
				this.message.messageId,
				this.editedText
			).then(r => {
				console.info(r);
			});
			this.isEditing = false;
		}
	}

	cancelEditing() {
		this.isEditing = false;
	}

	toggleEmojiModal() {
		this.isEmojiModalOpen = !this.isEmojiModalOpen;
		this.isOptionsMenuOpen = false;
	}

	handleDeleteMessage(message: IdtMessages) {
		if (message.messageId) {
			this.chatService.deleteMessage(
				this.chatService.selectedChannel.channelId,
				message.messageId
			).then(() => {
				console.info('Nachricht gelöscht');
			});
		}
	}

	/**
	 * Setup RxJS-based focus listener for better control
	 */
	private setupFocusListener(): void {
		const focus$ = fromEvent(window, 'focus');

		focus$.pipe(
			takeUntil(this.destroy$),
			debounceTime(100),
			distinctUntilChanged()
		).subscribe(() => {
			console.info('🔵 RxJS: Window focus detected in chat-message component');
			this.focusDebounce$.next();
		});
	}

	/**
	 * Setup event delegation for user tag clicks using RxJS
	 */
	private setupEventDelegation(): void {
		const messageElement = document.getElementById('message-' + this.message.messageId);
		if (!messageElement || (messageElement as any).__userTagHandlerSet) {
			return;
		}

		const click$ = fromEvent<MouseEvent>(messageElement, 'click');

		click$.pipe(
			takeUntil(this.destroy$),
			filter((event: MouseEvent) => {
				return event.isTrusted &&
					!event.altKey &&
					!event.ctrlKey &&
					!event.metaKey &&
					!event.shiftKey;
			}),
			debounceTime(50)
		).subscribe((event: MouseEvent) => {
			const target = event.target as HTMLElement;
			console.info('🔵 RxJS Click detected on:', target);

			if (target.classList.contains('user-tag-link')) {
				console.info('🔥 RxJS USER TAG CLICK!');

				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();

				const uid = target.getAttribute('data-uid');
				console.info('🔵 UID from RxJS click:', uid);

				if (uid && this.chatService.selectedChannel.channelMembers.includes(uid)) {
					console.info('🟢 RxJS: Calling handleProfileCard:', uid);
					this.handleProfileCard(true, uid);
				}
			}
		});

		(messageElement as any).__userTagHandlerSet = true;
	}

	/**
	 * Cleanup event handlers
	 */
	private cleanupEventHandlers(): void {
		const messageElement = document.getElementById('message-' + this.message.messageId);
		if (messageElement) {
			(messageElement as any).__userTagHandlerSet = false;
		}
	}
}
