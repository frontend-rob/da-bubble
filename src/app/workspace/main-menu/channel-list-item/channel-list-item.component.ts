import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, inject, Input, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {UserData} from "../../../interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import {ChannelData} from "../../../interfaces/channel.interface";
import {ChatService} from "../../../services/chat.service";

@Component({
	selector: "app-channel-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./channel-list-item.component.html",
	styleUrl: "./channel-list-item.component.scss",
})
export class ChannelListItemComponent implements OnInit, OnDestroy {
	@Input() channel!: ChannelData;

	currentUser!: UserData;
	private userService: UserService = inject(UserService);
	private userSubscription!: Subscription;

	constructor(private chatService: ChatService) {
	}

	get isActive(): boolean {
		return this.channel.channelId === this.chatService.activeChat;
	}

	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
		this.chatService.handleNewMessage(false);
	}

	ngOnInit() {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentUser = userData;
				}
			}
		);
	}

	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
	}
}
