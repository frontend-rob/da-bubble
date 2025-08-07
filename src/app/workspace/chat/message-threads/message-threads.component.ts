import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {MessageThread, MessageThreadsService} from '../../../services/message-thread.service';
import {ChatService} from '../../../services/chat.service';
import {UserService} from '../../../services/user.service';
import {UserData} from '../../../interfaces/user.interface';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
	selector: 'app-message-threads',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule
	],
	templateUrl: './message-threads.component.html',
	styleUrls: ['./message-threads.component.scss']
})
export class MessageThreadsComponent implements OnInit, OnDestroy {
	messageThreads$: Observable<MessageThread[]>;
	currentUser: UserData | null = null;

	private subscriptions: Subscription[] = [];

	constructor(
		private messageThreadsService: MessageThreadsService,
		private chatService: ChatService,
		private userService: UserService
	) {
		this.messageThreads$ = this.messageThreadsService.getAllMessageThreads();
	}

	ngOnInit(): void {
		const userSub = this.userService.currentUser$.subscribe(user => {
			this.currentUser = user;
		});

		this.subscriptions.push(userSub);
	}

	trackByThreadId(index: number, thread: MessageThread): string {
		return thread.id;
	}

	// Diese Methode wird von MentionInputComponent aufgerufen
	async onNewMessage(messageText: string): Promise<void> {
		if (!this.currentUser || !messageText.trim()) {
			return;
		}

		try {
			await this.messageThreadsService.createNewThread(
				messageText,
				this.currentUser
			);
			this.chatService.handleNewMessage(false);
		} catch (error) {
			console.error('Fehler beim Erstellen des Threads:', error);
		}
	}

	selectThread(thread: MessageThread): void {
		this.chatService.setActiveChat(thread.channelId);
		this.chatService.handleNewMessage(false);
	}

	getThreadAvatar(thread: MessageThread): string {
		if (thread.channelType === 'directMessage' && thread.participants.length > 0) {
			const otherUser = thread.participants.find(p => p.uid !== this.currentUser?.uid);
			return otherUser?.photoURL || 'assets/img/default-avatar.png';
		}
		return 'assets/img/default-avatar.png';
	}

	getSenderName(uid: string, participants: UserData[]): string {
		const sender = participants.find(p => p.uid === uid);
		return sender?.userName || 'Unbekannt';
	}

	formatTime(date: Date): string {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 1) return 'gerade eben';
		if (minutes < 60) return `${minutes}m`;
		if (hours < 24) return `${hours}h`;
		if (days < 7) return `${days}d`;

		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}
}
