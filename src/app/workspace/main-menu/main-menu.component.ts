import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {ChannelListItemComponent} from "./channel-list-item/channel-list-item.component";
import {DirectMessageListItemComponent} from "./direct-message-list-item/direct-message-list-item.component";
import {ChannelData} from "../../interfaces/channel.interface";
import {ChatService} from "../../services/chat.service";
import {HelperService} from "../../services/helper.service";
import {Timestamp} from "firebase/firestore";
import {FormsModule} from "@angular/forms";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {combineLatest, Subject, takeUntil} from "rxjs";

@Component({
	selector: "app-main-menu",
	imports: [
		CommonModule,
		ChannelListItemComponent,
		DirectMessageListItemComponent,
		FormsModule,
		NgOptimizedImage,
	],
	templateUrl: "./main-menu.component.html",
	styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent implements OnInit, OnDestroy {
	showChannelList = false;
	showUserList = false;
	isOpen = false;
	isModalOpen = false;

	isOpenText = "Close workspace menu";
	isClosedText = "Open workspace menu";

	currentUser!: UserData;
	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];
	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];

	channelFormData = {
		name: "",
		description: "",
	};

	private helperService: HelperService = inject(HelperService);
	private userService: UserService = inject(UserService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);
	private chatService: ChatService = inject(ChatService);

	private destroy$ = new Subject<void>();

	get activeChat() {
		return this.chatService.activeChat;
	}

	ngOnInit() {
		this.initializeCurrentUser();
		this.subscribeToData();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
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

	toggleModal() {
		this.isModalOpen = !this.isModalOpen;
	}

	getAvailableUsersForDM(): UserData[] {
		return this.availableUsersForDM;
	}

	getDirectMessageUserData(dmChannel: ChannelData): UserData {
		const otherUser = dmChannel.channelMembers.find(
			(member) => member.uid !== this.currentUser.uid
		);
		return otherUser || this.currentUser;
	}

	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);

		const selectedChannel = this.findChannelById(id);
		if (selectedChannel) {
			this.functionTriggerService.callSelectChannel(selectedChannel);
		}
	}

	async onUserClickForDirectMessage(data: string | UserData): Promise<void> {
		try {
			if (typeof data === "string") {
				this.setActiveChat(data);
				return;
			}

			const clickedUser = data as UserData;

			if (clickedUser.role?.guest) {
				console.warn("Cannot create DM with guest user");
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
				this.updateAvailableUsers();
			}

			this.chatService.selectedChannel = dmChannel;
			this.chatService.setActiveChat(dmChannel.channelId);
			this.functionTriggerService.callSelectChannel(dmChannel);
		} catch (error) {
			console.error(
				"Error creating/finding direct message channel:",
				error
			);
		}
	}

	addNewChannel(name: string, description: string) {
		if (!name.trim()) {
			console.warn("Channel name is required");
			return;
		}

		this.toggleModal();

		const newChannel: ChannelData = {
			channelId: this.helperService.getRandomNumber().toString(),
			channelName: name.trim(),
			channelType: {
				channel: true,
				directMessage: false,
			},
			channelDescription: description.trim(),
			createdBy: this.currentUser,
			channelMembers: [this.currentUser],
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		};

		this.chatService
			.createChannel(newChannel)
			.then((result) => {
				console.log("Channel created successfully:", result);
				this.channelFormData = {name: "", description: ""};
			})
			.catch((error) => {
				console.error("Error creating channel:", error);
			});
	}

	stopPropagation(event: Event): void {
		event.stopPropagation();
	}

	handleNewMessage(bool: boolean) {
		this.chatService.handleNewMessage(bool);

		if (bool) {
			this.chatService.setActiveChat("");
		}
	}

	private initializeCurrentUser() {
		this.userService.currentUser$.subscribe((user) => {
			if (user) {
				this.currentUser = user;
			}
		});
	}

	private subscribeToData() {
		combineLatest([
			this.chatService.getChannels(),
			this.userService.allUsers$,
		])
			.pipe(takeUntil(this.destroy$))
			.subscribe(([channels, users]) => {
				const updatedChannels = this.updateChannelMembersStatus(
					channels,
					users
				);

				this.handleChannelsUpdate(updatedChannels);
				this.handleUsersUpdate(users);
				this.updateAvailableUsers();
				this.selectFirstChannelIfNoneActive();
			});
	}

	private handleChannelsUpdate(channelsData: ChannelData[]) {
		this.channels = [];
		this.directMessageChannels = [];

		if (!this.currentUser) return;

		for (const channel of channelsData) {
			const isMember = channel.channelMembers?.some(
				(m) => m?.uid === this.currentUser?.uid
			);
			if (isMember) {
				if (channel.channelType?.directMessage) {
					this.directMessageChannels.push(channel);
				} else {
					this.channels.push(channel);
				}
			}
		}
	}

	private handleUsersUpdate(users: UserData[] | null) {
		if (!users || !this.currentUser) return;

		this.allUsers = users.filter(
			(user) => !user.role?.guest && user.uid !== this.currentUser?.uid
		);
	}

	private updateAvailableUsers() {
		this.availableUsersForDM = this.allUsers.filter((user) => {
			if (!user) return false; // Zusätzliche Sicherheitsprüfung
			return !this.directMessageChannels.some((dmChannel) =>
				dmChannel.channelMembers.some(
					(member) => member && member.uid === user.uid
				)
			);
		});
	}

	private findChannelById(id: string): ChannelData | null {
		return (
			this.channels.find((channel) => channel.channelId === id) ||
			this.directMessageChannels.find(
				(channel) => channel.channelId === id
			) ||
			null
		);
	}

	private updateChannelMembersStatus(
		channels: ChannelData[],
		users: UserData[] | null
	): ChannelData[] {
		if (!users || users.length === 0) return channels;

		return channels.map((channel) => ({
			...channel,
			channelMembers: channel.channelMembers.map((member) => {
				const currentUser = users.find(
					(user) => user.uid === member.uid
				);
				return currentUser
					? {...member, status: currentUser.status}
					: member;
			}),
		}));
	}

	private selectFirstChannelIfNoneActive() {
		//TODO:
		// - Add direct message
		// - If there no channel or dm, show the hole chat with new message header

		if (!this.chatService.activeChat && this.channels.length > 0) {
			const firstChannel = this.channels[0];
			this.setActiveChat(firstChannel.channelId);
			this.chatService.selectedChannel = firstChannel;
		}
	}
}
