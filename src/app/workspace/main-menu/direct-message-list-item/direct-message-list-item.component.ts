import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, Input } from "@angular/core";
import { UserData } from "../../../interfaces/user.interface";
import { ChatService } from "../../../services/chat.service";
import { ChannelData } from "../../../interfaces/channel.interface";
import { FunctionTriggerService } from "../../../services/function-trigger.service";
import { combineLatest, Subject, takeUntil } from "rxjs";
import { UserService } from "../../../services/user.service";

@Component({
	selector: "app-direct-message-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./direct-message-list-item.component.html",
	styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent {
	@Input() chatPartner!: UserData;
	@Input() currentUser!: UserData;
	@Input() dmUserData!: UserData;

	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];
	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];

	// private destroy$ = new Subject<void>();

	constructor(
		private chatService: ChatService // private functionTriggerService: FunctionTriggerService, // private userService: UserService
	) {}

	// ngOnInit() {
	// 	this.subscribeToData();
	// }

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

		// const selectedChannel = this.findChannelById(id);
		// if (selectedChannel) {
		// 	this.functionTriggerService.callSelectChannel(selectedChannel);
		// }

		console.log("chatPartner: ", this.chatPartner);
		console.log("channels: ", this.channels);
		console.log("DM Channels: ", this.directMessageChannels);
		console.log("allUsers: ", this.allUsers);
	}

	// getDirectMessageUserData(dmChannel: ChannelData): UserData {
	// 	const otherUser = dmChannel.channelMembers.find(
	// 		(member) => member.uid !== this.currentUser.uid
	// 	);
	// 	return otherUser || this.currentUser;
	// }

	// getAvailableUsersForDM(): UserData[] {
	// 	return this.availableUsersForDM;
	// }

	// async onUserClickForDirectMessage(data: string | UserData): Promise<void> {
	// 	try {
	// 		if (typeof data === "string") {
	// 			this.setActiveChat(data);
	// 			return;
	// 		}

	// 		const clickedUser = data as UserData;

	// 		if (clickedUser.role?.guest) {
	// 			console.warn("Cannot create DM with guest user");
	// 			return;
	// 		}

	// 		let dmChannel = await this.chatService.findDirectMessageChannel(
	// 			this.currentUser,
	// 			clickedUser
	// 		);

	// 		if (!dmChannel) {
	// 			dmChannel = await this.chatService.createDirectMessageChannel(
	// 				this.currentUser,
	// 				clickedUser
	// 			);
	// 			this.directMessageChannels.push(dmChannel);
	// 			this.updateAvailableUsers();
	// 		}

	// 		this.chatService.selectedChannel = dmChannel;
	// 		this.chatService.setActiveChat(dmChannel.channelId);
	// 		this.functionTriggerService.callSelectChannel(dmChannel);
	// 	} catch (error) {
	// 		console.error(
	// 			"Error creating/finding direct message channel:",
	// 			error
	// 		);
	// 	}
	// }

	// private updateAvailableUsers() {
	// 	this.availableUsersForDM = this.allUsers.filter((user) => {
	// 		if (!user) return false; // Zusätzliche Sicherheitsprüfung
	// 		return !this.directMessageChannels.some((dmChannel) =>
	// 			dmChannel.channelMembers.some(
	// 				(member) => member && member.uid === user.uid
	// 			)
	// 		);
	// 	});
	// }

	// private handleChannelsUpdate(channelsData: ChannelData[]) {
	// 	this.channels = [];
	// 	this.directMessageChannels = [];

	// 	if (!this.currentUser) return;

	// 	for (const channel of channelsData) {
	// 		const isMember = channel.channelMembers?.some(
	// 			(m) => m?.uid === this.currentUser?.uid
	// 		);
	// 		if (isMember) {
	// 			if (channel.channelType?.directMessage) {
	// 				this.directMessageChannels.push(channel);
	// 			} else {
	// 				this.channels.push(channel);
	// 			}
	// 		}
	// 	}
	// }

	// private handleUsersUpdate(users: UserData[] | null) {
	// 	if (!users || !this.currentUser) return;

	// 	this.allUsers = users.filter(
	// 		(user) => !user.role?.guest && user.uid !== this.currentUser?.uid
	// 	);
	// }

	// private findChannelById(id: string): ChannelData | null {
	// 	return (
	// 		this.channels.find((channel) => channel.channelId === id) ||
	// 		this.directMessageChannels.find(
	// 			(channel) => channel.channelId === id
	// 		) ||
	// 		null
	// 	);
	// }

	// private updateChannelMembersStatus(
	// 	channels: ChannelData[],
	// 	users: UserData[] | null
	// ): ChannelData[] {
	// 	if (!users || users.length === 0) return channels;

	// 	return channels.map((channel) => ({
	// 		...channel,
	// 		channelMembers: channel.channelMembers.map((member) => {
	// 			const currentUser = users.find(
	// 				(user) => user.uid === member.uid
	// 			);
	// 			return currentUser
	// 				? { ...member, status: currentUser.status }
	// 				: member;
	// 		}),
	// 	}));
	// }

	// private subscribeToData() {
	// 	combineLatest([
	// 		this.chatService.getChannels(),
	// 		this.userService.allUsers$,
	// 	])
	// 		.pipe(takeUntil(this.destroy$))
	// 		.subscribe(([channels, users]) => {
	// 			const updatedChannels = this.updateChannelMembersStatus(
	// 				channels,
	// 				users
	// 			);

	// 			this.handleChannelsUpdate(updatedChannels);
	// 			this.handleUsersUpdate(users);
	// 			this.updateAvailableUsers();
	// 			this.selectFirstChannelIfNoneActive();
	// 		});
	// }

	// private selectFirstChannelIfNoneActive() {
	// 	//TODO:
	// 	// - Add direct message
	// 	// - If there no channel or dm, show the hole chat with new message header

	// 	if (!this.chatService.activeChat && this.channels.length > 0) {
	// 		const firstChannel = this.channels[0];
	// 		this.setActiveChat(firstChannel.channelId);
	// 		this.chatService.selectedChannel = firstChannel;
	// 	}
	// }
}
