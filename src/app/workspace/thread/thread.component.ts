import { Component, Input, OnInit, OnDestroy, TrackByFunction, inject } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Timestamp } from "@angular/fire/firestore";
import { Observable, Subscription, firstValueFrom, map } from "rxjs";
import { MessageInputFieldComponent } from "../../shared/message-input-field/message-input-field.component";
import { ChatMessageComponent } from "../chat/chat-message-other/chat-message.component";
import { Message } from "../../interfaces/message.interface";
import { UserData } from "../../interfaces/user.interface";
import { AutoScrollingDirective } from "../../directive/auto-scrolling.directive";
import { ChatService } from "../../services/chat.service";
import { HelperService } from "../../services/helper.service";
import { UserService } from "../../services/user.service";

/**
 * ThreadComponent displays and manages a chat thread, including messages and user interactions.
 */
@Component({
	selector: "app-thread",
	imports: [
        CommonModule,
        NgOptimizedImage,
        MessageInputFieldComponent,
        ChatMessageComponent,
        AutoScrollingDirective,
    ],
	templateUrl: "./thread.component.html",
	styleUrl: "./thread.component.scss",
	standalone: true
})
export class ThreadComponent implements OnInit, OnDestroy {
	@Input() isThisAThreadMessage!: boolean;
	currentUser!: UserData;
	userSubscription!: Subscription;
	userService: UserService = inject(UserService);
	helperService: HelperService = inject(HelperService);
	chatService: ChatService = inject(ChatService);
	messages$: Observable<Message[]>;
	messages!: Message[];
	threadChannelName: string | undefined;

	/**
	 * Initializes the thread messages observable.
	 */
	constructor() {
		this.messages$ = this.chatService.getThreadMessages(
			this.chatService.selectedChannel.channelId.toString(),
			this.chatService.selectedThreadMessageId
		);
	}

	/**
	 * Initializes user subscription and loads thread channel name and messages.
	 */
	ngOnInit() {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentUser = userData;
				}
			}
		);
		this.threadChannelName = this.chatService.selectedChannel.channelName;
		this.messages$.subscribe((megs) => {
			this.messages = megs;
		});
	}

	/**
	 * Cleans up user subscription on component destroy.
	 */
	ngOnDestroy() {
		this.userSubscription.unsubscribe();
	}

	/**
	 * TrackBy function for message list rendering.
	 */
	trackByMessageId: TrackByFunction<Message> = (
		index: number,
		message: Message
	) => {
		return (message as any).id || index;
	};

	/**
	 * Determines if the date should be shown for a message.
	 * @param messages Array of messages
	 * @param index Index of the current message
	 * @returns True if the date should be shown
	 */
	shouldShowDate(messages: Message[], index: number): boolean {
		if (index === 0) return true;
		return messages[index].date !== messages[index - 1].date;
	}

	/**
	 * Handles closing the thread view and restores chat view on small screens.
	 */
	handleThread() {
		this.chatService.handleThread(false);
		if (window.innerWidth <= 1024) {
			const chatElement = document.querySelector('app-chat');
			if (chatElement) {
				(chatElement as HTMLElement).style.display = '';
			}
		}
	}

	/**
	 * Returns the number of answers in the thread.
	 * @returns Promise resolving to the answer count
	 */
	async returnThreadAnswerCount(): Promise<number> {
		if (!this.messages$) return -1;
		return await firstValueFrom(
			this.messages$.pipe(map((messages) => messages.length + 1))
		);
	}

	/**
	 * Sends a new message in the thread.
	 * @param content The message content
	 */
	async sendThreadMessage(content: string): Promise<void> {
		if (!this.isValidThreadMessage(content)) return;
		const message = this.createThreadMessage(content);
		try {
			await this.updateThreadMetaInformation();
			await this.sendMessageToThread(message);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}

	/**
	 * Checks if the thread message is valid.
	 * @param content The message content
	 * @returns True if valid, false otherwise
	 * @private
	 */
	private isValidThreadMessage(content: string): boolean {
		if (!this.chatService.selectedChannel || !content.trim()) {
			console.info(this.chatService.selectedChannel);
			return false;
		}
		return true;
	}

	/**
	 * Creates a new thread message object.
	 * @param content The message content
	 * @returns Message object
	 * @private
	 */
	private createThreadMessage(content: string): Message {
		return {
			text: content,
			uid: this.currentUser.uid,
			edited: false,
			timestamp: Timestamp.fromDate(new Date()),
			time: this.helperService.getBerlinTime24h(),
			date: this.helperService.getBerlinDateFormatted(),
			reactions: [],
		};
	}

	/**
	 * Updates thread meta information before sending a message.
	 * @private
	 */
	private async updateThreadMetaInformation(): Promise<void> {
		await this.chatService.updateThreadMessagesInformation(
			this.helperService.getBerlinTime24h(),
			await this.returnThreadAnswerCount()
		);
		await this.chatService.updateThreadMessagesName();
		await this.returnThreadAnswerCount();
	}

	/**
	 * Sends the message to the thread.
	 * @param message The message object
	 * @private
	 */
	private async sendMessageToThread(message: Message): Promise<void> {
		await this.chatService.sendThreadMessage(
			this.chatService.selectedChannel.channelId.toString(),
			this.chatService.selectedThreadMessageId,message
		);
	}
}
