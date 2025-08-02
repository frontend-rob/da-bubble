import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Subscription} from "rxjs";
import {ChannelData} from "../../../interfaces/channel.interface";
import {UserData} from "../../../interfaces/user.interface";
import {ChatService} from "../../../services/chat.service";
import {ResponsiveService} from "../../../services/responsive.service";
import {UserService} from "../../../services/user.service";

/**
 * ChannelListItemComponent displays the channel list and manages its selection and responsive state.
 */
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

	/**
	 * Creates an instance of ChannelListItemComponent.
	 * @param chatService Service for chat operations
	 * @param userService Service for user operations
	 * @param responsiveService Service for responsive design
	 */
	constructor(
		private chatService: ChatService,
		private userService: UserService,
		private responsiveService: ResponsiveService
	) { }

	/**
	 * Initializes subscriptions for user and screen width changes.
	 */
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

	/**
	 * Cleans up subscriptions on component destroy.
	 */
	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
		this.screenWidthSubscription.unsubscribe();
	}

	/**
	 * Returns true if this channel is the active chat.
	 */
	get isActive(): boolean {
		return this.channel.channelId === this.chatService.activeChat;
	}

	/**
	 * Sets the active chat to the given channel ID and resets new message state.
	 * @param id Channel ID to set as active
	 */
	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
		this.chatService.handleNewMessage(false);
	}
}
