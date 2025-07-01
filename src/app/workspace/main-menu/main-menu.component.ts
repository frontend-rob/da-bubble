import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {ChannelListItemComponent} from "./channel-list-item/channel-list-item.component";
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

	isOpenText = "Close Workspace Menu";
	isClosedText = "Open Workspace Menu";

	currentUser!: UserData;
	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];
	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];
	selfChannel: ChannelData | null = null; // Kanal für Selbst-Chat

	// Combined list for direct messages display
	combinedDirectMessagesList: { user: UserData; type: 'current' | 'channel' | 'other'; channelId?: string }[] = [];

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

	toggleModal() {
		this.isModalOpen = !this.isModalOpen;
	}


	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
	}

	setSelectedChannel(id: string) {
		console.log("SELECTED CHANNEL ID:", id);
		const selectedChannel = this.findChannelById(id);
		if (selectedChannel) {
			this.functionTriggerService.callSelectChannel(selectedChannel);
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

				// Only set active chat and selected channel if channels array is not empty
				if (this.channels.length > 0) {
					this.setActiveChat(this.channels[0].channelId);
					this.setSelectedChannel(this.channels[0].channelId);
				}
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
					// Prüfe, ob es sich um einen Selbst-Chat handelt
					const isSelfChannel = channel.channelMembers.length === 1 ||
						(channel.channelMembers.length === 2 && 
						 channel.channelMembers.every(m => m.uid === this.currentUser.uid));
					
					if (isSelfChannel) {
						this.selfChannel = channel;
					} else {
						this.directMessageChannels.push(channel);
					}
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


	private findChannelById(id: string): ChannelData | null {
		// Suche auch im Selbst-Chat-Kanal
		if (this.selfChannel && this.selfChannel.channelId === id) {
			return this.selfChannel;
		}

		return this.channels.find((channel) => channel.channelId === id) || null;
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
}
