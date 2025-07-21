import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {UserData} from "../../../interfaces/user.interface";
import {ChatService} from "../../../services/chat.service";
import {Observable} from 'rxjs';
import {PresenceService, UserPresence} from '../../../services/PresenceManagementService';

@Component({
	selector: "app-direct-message-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./direct-message-list-item.component.html",
	styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent implements OnInit {
	@Input() chatPartner: UserData | undefined | null;
	@Input() dmChannel: any;
	@Output() channelSelected = new EventEmitter<{ channelId: string, userData: UserData | null }>();

	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];
	chatPartnerPresence$!: Observable<UserPresence | null>;

	constructor(
		private chatService: ChatService,
		private presenceService: PresenceService
	) {
	}

	get isActive(): boolean {

		if (this.dmChannel && this.dmChannel.channelId) {
			return this.dmChannel.channelId === this.chatService.activeChat;
		} else if (this.chatPartner && this.chatPartner.uid) {
			return this.chatPartner.uid === this.chatService.activeChat;
		} else if (this.chatPartner && this.chatPartner.uid === this.chatService.activeChat) {
			return true;
		}
		return false;
	}

	ngOnInit(): void {
		if (this.chatPartner?.uid) {
			this.chatPartnerPresence$ = this.presenceService.getUserPresence(this.chatPartner.uid);
		}
	}

	onItemClick() {
		if (this.dmChannel) {
			this.chatService.setActiveChat(this.dmChannel.channelId);
			this.channelSelected.emit({
				channelId: this.dmChannel.channelId,
				userData: null
			});
		} else if (this.chatPartner) {
			this.channelSelected.emit({
				channelId: this.chatPartner.uid,
				userData: this.chatPartner
			});
		}
	}
}
