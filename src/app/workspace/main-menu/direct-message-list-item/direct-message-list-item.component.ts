import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, Input } from "@angular/core";
import { UserData } from "../../../interfaces/user.interface";
import { ChatService } from "../../../services/chat.service";
import { ChannelData } from "../../../interfaces/channel.interface";

@Component({
	selector: "app-direct-message-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./direct-message-list-item.component.html",
	styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent {
	@Input() chatPartner!: UserData;
	@Input() currentUser!: UserData;
	@Input() directMessageChannels!: ChannelData[];
	@Input() dmUserData!: UserData;

	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];

	constructor(
		private chatService: ChatService // private functionTriggerService: FunctionTriggerService, // private userService: UserService
	) {}

	get isActive(): boolean {
		// FIXME: Fix active state
		if (this.chatPartner.uid) {
			return this.chatPartner.uid === this.chatService.activeChat;
		} else {
			return false;
		}
	}

	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
		this.chatService.handleNewMessage(false);
	}
}
