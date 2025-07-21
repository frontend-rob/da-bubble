import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {UserData} from "../../../interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import {ChannelData} from "../../../interfaces/channel.interface";
import {ChatService} from "../../../services/chat.service";
import {ResponsiveService} from "../../../services/responsive.service";

@Component({
	selector: "app-channel-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./channel-list-item.component.html",
	styleUrl: "./channel-list-item.component.scss",
})
export class ChannelListItemComponent implements OnInit, OnDestroy {
	@Input() channel!: ChannelData;
	currentUser!: UserData;
	screenWidth!: number;
	private screenWidthSubscription!: Subscription;
	private userSubscription!: Subscription;

	constructor(
		private chatService: ChatService,
		private userService: UserService,
		private responsiveService: ResponsiveService
	) {
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

		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
		this.screenWidthSubscription.unsubscribe();
	}
}
