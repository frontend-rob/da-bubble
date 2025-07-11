import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {UserData} from "../../../interfaces/user.interface";
import {ChatService} from "../../../services/chat.service";

@Component({
	selector: "app-direct-message-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./direct-message-list-item.component.html",
	styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent {
	@Input() chatPartner: UserData | undefined | null;
	@Input() dmChannel: any;
	@Output() channelSelected = new EventEmitter<{channelId: string, userData: UserData | null}>();

	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];

	constructor(
		private chatService: ChatService
	) {
	}

	get isActive(): boolean {
		// Für DM-Channels: verwende die channelId
		if (this.dmChannel && this.dmChannel.channelId) {
			return this.dmChannel.channelId === this.chatService.activeChat;
		}
		// Für verfügbare User: verwende die uid
		else if (this.chatPartner && this.chatPartner.uid) {
			return this.chatPartner.uid === this.chatService.activeChat;
		}
		return false;
	}

	onItemClick() {
		if (this.dmChannel) {
			// Für DM-Channels: setze activeChat auf channelId
			this.chatService.setActiveChat(this.dmChannel.channelId);
			this.channelSelected.emit({
				channelId: this.dmChannel.channelId,
				userData: null
			});
		} else if (this.chatPartner) {
			// Für verfügbare User: setze activeChat auf uid
			this.chatService.setActiveChat(this.chatPartner.uid);
			this.channelSelected.emit({
				channelId: this.chatPartner.uid,
				userData: this.chatPartner
			});
		}
	}
}
