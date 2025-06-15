import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ChannelListItemComponent } from "./channel-list-item/channel-list-item.component";
import { DirectMessageListItemComponent } from "./direct-message-list-item/direct-message-list-item.component";
import { ChannelData } from "../../interfaces/channel.interface";
import { ChatService } from "../../services/chat.service";
import { Subscription } from "rxjs";
import { HelperService } from "../../services/helper.service";
import { Timestamp } from "firebase/firestore";
import { FormsModule } from "@angular/forms";
import { UserData } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { FunctionTriggerService } from "../../services/function-trigger.service";

@Component({
	selector: "app-main-menu",
	imports: [
		CommonModule,
		ChannelListItemComponent,
		DirectMessageListItemComponent,
		FormsModule,
	],
	templateUrl: "./main-menu.component.html",
	styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent implements OnInit, OnDestroy {
	showChannelList = false;
	showUserList = false;
	isOpen = false;
	isModalOpen = false;
	activeMenuItem!: string | null;

	isOpenText = "Close workspace menu";
	isClosedText = "Open workspace menu";
	currentUser!: UserData;
	userSubscription!: Subscription;
	userDataSubscription!: Subscription;
	channelFormData = {
		name: "",
		description: "",
	};
	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];

	chats!: UserData[];
	private helperService: HelperService = inject(HelperService);
	private userService: UserService = inject(UserService);
	private channelsSubscription!: Subscription;
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);

	constructor(private chatService: ChatService) {}

	ngOnInit(): void {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentUser = userData;
					this.loadChannels();
				}
			}
		);

		this.userDataSubscription = this.userService.allUsers$.subscribe(
			(userData) => {
				if (userData) {
					this.chats = userData.filter((user) => {
						if (user) {
							user.role.user;
						}
					});
				}
			}
		);
	}

	ngOnDestroy(): void {
		if (this.channelsSubscription) {
			this.channelsSubscription.unsubscribe();
		}

		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}

		if (this.userDataSubscription) {
			this.userDataSubscription.unsubscribe();
		}
	}

	loadChannels(): void {
		this.channelsSubscription = this.chatService.getChannels().subscribe(
			(channelsData: ChannelData[]) => {
				const currentActiveId = this.activeMenuItem;

				for (const channel of channelsData) {
					const isMember = channel.channelMembers.some(
						(m) => m.uid === this.currentUser.uid
					);
					if (isMember) {
						if (channel.channelType.directMessage) {
							this.directMessageChannels.push(channel);
						} else {
							this.channels.push(channel);
						}
					}
				}

				if (!this.activeMenuItem && this.channels.length !== 0) {
					this.setActiveChat(this.channels[0].channelId);
				} else if (currentActiveId) {
					this.activeMenuItem = currentActiveId;
				}
			},
			(error) => {
				console.error("Error loading channels:", error);
			}
		);
	}

	toggleNav() {
		this.isOpen = !this.isOpen;
	}

	toggleChannelList() {
		this.showChannelList = !this.showChannelList;
	}

	toggleDirectMessageList() {
		this.showUserList = !this.showUserList;
	}

	setActiveChat(id: string) {
		this.activeMenuItem = id;

		this.channels.forEach((channel: ChannelData) => {
			if (channel.channelId === id) {
				this.functionTriggerService.callSelectChannel(channel);
			}
		});

		this.directMessageChannels.forEach((channel: ChannelData) => {
			if (channel.channelId === id) {
				this.functionTriggerService.callSelectChannel(channel);
			}
		});
	}

	async onUserClickForDirectMessage(data: string | UserData): Promise<void> {
		try {
			if (typeof data === "string") {
				this.setActiveChat(data);
				return;
			}

			const clickedUser = data as UserData;

			if (clickedUser.role && clickedUser.role.guest) {
				return;
			}

			let dmChannel = await this.chatService.findDirectMessageChannel(
				this.currentUser,
				clickedUser
			);

			if (!dmChannel) {
				dmChannel = await this.chatService.createDirectMessageChannel(
					this.currentUser,
					clickedUser
				);
				this.directMessageChannels.push(dmChannel);
			}

			this.chatService.selectedChannel = dmChannel;
			this.activeMenuItem = dmChannel.channelId;

			this.functionTriggerService.callSelectChannel(dmChannel);
		} catch (error) {
			console.error(
				"Error creating/finding direct message channel:",
				error
			);
		}
	}

	getDirectMessageUserData(dmChannel: ChannelData): UserData {
		const otherUser = dmChannel.channelMembers.find(
			(member) => member.uid !== this.currentUser.uid
		);
		return otherUser || this.currentUser;
	}

	getAvailableUsersForDM(): UserData[] {
		if (!this.chats) return [];

		return this.chats.filter((user) => {
			return !this.directMessageChannels.some((dmChannel) =>
				dmChannel.channelMembers.some(
					(member) => member.uid === user.uid
				)
			);
		});
	}

	addNewChannel(name: string, description: string) {
		this.toggleModal();
		const newChannel: ChannelData = {
			channelId: this.helperService.getRandomNumber().toString(),
			channelName: name,
			channelType: {
				channel: true,
				directMessage: false,
			},
			channelDescription: description,
			createdBy: this.currentUser,
			channelMembers: [this.currentUser],
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		};
		this.chatService.createChannel(newChannel).then((r) => {
			console.log(r);
		});
	}

	toggleModal() {
		this.isModalOpen = !this.isModalOpen;
	}

	handleNewMessage(bool: boolean) {
		this.chatService.handleNewMessage(bool);

		if (bool) {
			this.activeMenuItem = null;
		}
	}
}
