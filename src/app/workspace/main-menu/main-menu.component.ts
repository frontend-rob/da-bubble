/**
 * TODO: This file exceeds the 400 LOC limit and should be split into multiple files.
 * Consider extracting functionality into separate service classes or component classes:
 * 1. Create a ChannelSelectionService to handle channel selection functionality
 * 2. Create a DirectMessageService to handle direct message functionality
 * 3. Create a ChannelManagementUIService to handle channel management UI functionality
 *
 * Alternatively, split the component into multiple smaller components:
 * 1. Create a ChannelListComponent for the channel list
 * 2. Create a DirectMessageListComponent for the direct message list
 * 3. Create a ChannelCreationComponent for channel creation
 * 4. Create a UserSelectionComponent for user selection
 */
import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
	ChangeDetectorRef,
	Component,
	inject,
	OnDestroy,
	OnInit,
} from "@angular/core";
import { ChannelListItemComponent } from "./channel-list-item/channel-list-item.component";
import { DirectMessageListItemComponent } from "./direct-message-list-item/direct-message-list-item.component";
import { ChannelData } from "../../interfaces/channel.interface";
import { ChatService } from "../../services/chat.service";
import { Timestamp } from "firebase/firestore";
import { FormsModule } from "@angular/forms";
import { UserData } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { FunctionTriggerService } from "../../services/function-trigger.service";
import {
	combineLatest,
	map,
	Observable,
	of,
	Subject,
	Subscription,
	takeUntil,
} from "rxjs";
import { UserLookupService } from "../../services/user-lookup.service";
import { ResponsiveService } from "../../services/responsive.service";
import { WorkspaceService } from "../../services/workspace.service";
import { SearchCardComponent } from "../workspace-header/search-card/search-card.component";
import { ChannelManagementService } from "../../services/channel-management.service";

@Component({
	selector: "app-main-menu",
	imports: [
		CommonModule,
		ChannelListItemComponent,
		DirectMessageListItemComponent,
		FormsModule,
		NgOptimizedImage,
		SearchCardComponent,
	],
	templateUrl: "./main-menu.component.html",
	styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent implements OnInit, OnDestroy {
	showChannelList = false;
	showUserList = false;
	isModalOpen = false;
	isMainMenuOpen: boolean = false;
	screenWidth!: number;
	isOpenText = "Close Workspace Menu";
	isClosedText = "Open Workspace Menu";
	currentUser!: UserData;
	channels: ChannelData[] = [];
	directMessageChannels: ChannelData[] = [];
	allUsers: UserData[] = [];
	availableUsersForDM: UserData[] = [];
	selfChannel!: ChannelData;
	channelFormData = {
		name: "",
		description: "",
	};

	channelFormError = "";
	private isMainMenuOpenSubscription!: Subscription;
	private screenWidthSubscription!: Subscription;
	private isInitialLoad = true;
	private userLookupService: UserLookupService = inject(UserLookupService);
	private userService: UserService = inject(UserService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);
	private chatService: ChatService = inject(ChatService);
	private responsiveService: ResponsiveService = inject(ResponsiveService);
	private channelManagementService: ChannelManagementService = inject(
		ChannelManagementService
	);

	private destroy$ = new Subject<void>();

	constructor(
		private workspaceService: WorkspaceService,
		private cdr: ChangeDetectorRef
	) {}

	/**
	 * Gets the current state of the user menu from the user service.
	 *
	 * @return {boolean} True if the user menu is open, false otherwise.
	 */
	get isUserMenuOpen() {
		return this.userService.isUserMenuOpen;
	}

	/**
	 * Initializes the component by setting up the current user, data subscriptions,
	 * and various event listeners for menu state, screen width, and direct message requests.
	 *
	 * @return {void} This method does not return a value.
	 */
	ngOnInit() {
		this.initializeCurrentUser();
		this.subscribeToData();

		this.isMainMenuOpenSubscription =
			this.workspaceService.isMainMenuOpen$.subscribe((val) => {
				this.isMainMenuOpen = val;
			});

		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});

		this.userService.directMessageUser$.subscribe((user) => {
			if (user) {
				this.onUserClickForDirectMessage(user);
			}
		});
	}

	/**
	 * Cleans up resources when the component is destroyed by completing observables
	 * and unsubscribing from subscriptions to prevent memory leaks.
	 *
	 * @return {void} This method does not return a value.
	 */
	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		this.isMainMenuOpenSubscription.unsubscribe();
		this.screenWidthSubscription.unsubscribe();
	}

	/**
	 * Toggles the main menu's open/closed state by calling the workspace service
	 * with the opposite of the current state.
	 *
	 * @return {void} This method does not return a value.
	 */
	toggleMainMenu() {
		this.workspaceService.setMainMenuStatus(!this.isMainMenuOpen);
	}

	/**
	 * Toggles the visibility of the channel list in the UI.
	 *
	 * @return {void} This method does not return a value.
	 */
	toggleChannelList() {
		this.showChannelList = !this.showChannelList;
	}

	/**
	 * Toggles the visibility of the direct message user list in the UI.
	 *
	 * @return {void} This method does not return a value.
	 */
	toggleDirectMessageList() {
		this.showUserList = !this.showUserList;
	}

	/**
	 * Toggles the modal's open/closed state and logs the new state to the console.
	 *
	 * @return {void} This method does not return a value.
	 */
	toggleModal() {
		this.isModalOpen = !this.isModalOpen;
		console.info("isModalOpen", this.isModalOpen);
	}

	/**
	 * Returns the list of users available for direct messaging.
	 *
	 * @return {UserData[]} An array of user data objects available for direct messaging.
	 */
	getAvailableUsersForDM(): UserData[] {
		return this.availableUsersForDM;
	}

	/**
	 * Retrieves user data for a direct message channel by finding the other user
	 * in the channel and looking up their information. If no other user is found,
	 * returns the current user's data.
	 *
	 * @param {ChannelData} dmChannel - The direct message channel to get user data for.
	 * @return {Observable<UserData>} An observable that emits the user data of the other participant.
	 */
	getDirectMessageUserData(dmChannel: ChannelData): Observable<UserData> {
		const otherUser: string | undefined = dmChannel.channelMembers.find(
			(member) => member !== this.currentUser.uid
		);
		if (otherUser) {
			return this.userLookupService
				.getUserById(otherUser)
				.pipe(map((user) => user || this.currentUser));
		} else {
			return of(this.currentUser);
		}
	}

	/**
	 * Sets the active chat channel in the chat service.
	 *
	 * @param {string} id - The ID of the channel to set as active.
	 * @return {void} This method does not return a value.
	 */
	setActiveChat(id: string) {
		this.chatService.setActiveChat(id);
	}

	/**
	 * Sets the selected channel based on the provided ID or event object and user data.
	 * Parses the input, logs the selection, and handles the channel selection process.
	 *
	 * @param {string | { channelId: string; userData: UserData | null }} idOrEvent - Either a channel ID string or an object containing channel ID and user data.
	 * @param {UserData | null} [userData] - Optional user data associated with the channel selection.
	 * @return {void} This method does not return a value.
	 */
	setSelectedChannel(
		idOrEvent: string | { channelId: string; userData: UserData | null },
		userData?: UserData | null
	) {
		const { id, user } = this.parseChannelSelection(idOrEvent, userData);
		this.logChannelSelection(id, user);
		this.prepareAndHandleChannelSelection(id, user);
	}

	/**
	 * Logs the channel selection details to the console for debugging purposes.
	 *
	 * @param {string} id - The ID of the selected channel.
	 * @param {UserData | null} user - The user data associated with the channel selection.
	 * @return {void} This method does not return a value.
	 */
	private logChannelSelection(id: string, user: UserData | null): void {
		console.info("setSelectedChannel called with:", { id, user });
		console.info("dmchannels", this.directMessageChannels);
	}

	/**
	 * Prepares and handles the channel selection by closing the thread window,
	 * setting the active chat, and handling the channel selection.
	 *
	 * @param {string} id - The ID of the selected channel.
	 * @param {UserData | null} user - The user data associated with the channel selection.
	 * @return {void} This method does not return a value.
	 */
	private prepareAndHandleChannelSelection(
		id: string,
		user: UserData | null
	): void {
		this.closeThreadWindow();
		this.setActiveChat(id);
		this.handleChannelSelection(id, user);
	}

	/**
	 * Closes the thread window by calling the chat service's handleThread method with false.
	 *
	 * @return {void} This method does not return a value.
	 */
	private closeThreadWindow(): void {
		this.chatService.handleThread(false);
	}

	/**
	 * Parses the channel selection input to extract the channel ID and user data.
	 * Handles both string IDs and object inputs with different parsing strategies.
	 *
	 * @param {string | { channelId: string; userData: UserData | null }} idOrEvent - Either a channel ID string or an object containing channel ID and user data.
	 * @param {UserData | null} [userData] - Optional user data associated with the channel selection.
	 * @return {{ id: string; user: UserData | null }} An object containing the parsed channel ID and user data.
	 */
	private parseChannelSelection(
		idOrEvent: string | { channelId: string; userData: UserData | null },
		userData?: UserData | null
	): { id: string; user: UserData | null } {
		if (this.isChannelSelectionObject(idOrEvent)) {
			return this.extractFromChannelSelectionObject(idOrEvent);
		} else {
			return this.createFromStringAndUserData(
				idOrEvent as string,
				userData
			);
		}
	}

	private isChannelSelectionObject(
		value: string | { channelId: string; userData: UserData | null }
	): value is { channelId: string; userData: UserData | null } {
		return typeof value === "object" && value !== null;
	}

	private extractFromChannelSelectionObject(obj: {
		channelId: string;
		userData: UserData | null;
	}): { id: string; user: UserData | null } {
		return { id: obj.channelId, user: obj.userData };
	}

	private createFromStringAndUserData(
		id: string,
		userData?: UserData | null
	): { id: string; user: UserData | null } {
		return { id, user: userData || null };
	}

	private handleChannelSelection(id: string, user: UserData | null): void {
		const selectedChannel = this.findChannelById(id);

		if (selectedChannel) {
			this.handleExistingChannel(selectedChannel);
		} else {
			this.handleNonExistingChannel(id, user);
		}
	}

	private handleExistingChannel(channel: ChannelData): void {
		this.functionTriggerService.callSelectChannel(channel);
		this.handleResponsiveUI();
	}

	private handleNonExistingChannel(id: string, user: UserData | null): void {
		if (user) {
			this.onUserClickForDirectMessage(user);
		} else {
			this.onUserClickForDirectMessage(id);
		}
	}

	onChannelSelected(event: { channelId: string; userData: UserData | null }) {
		console.info("Channel selected:", event);

		if (event.userData) {
			this.onUserClickForDirectMessage(event.userData);
		} else {
			this.setSelectedChannel(event.channelId, event.userData);
		}
	}

	async onUserClickForDirectMessage(data: string | UserData): Promise<void> {
		try {
			const clickedUser = data as UserData;

			if (!this.canCreateDirectMessage(clickedUser)) {
				return;
			}

			this.closeThreadWindow();
			await this.processDirectMessageRequest(clickedUser);
		} catch (error) {
			this.handleDirectMessageError(error);
		}
	}

	private canCreateDirectMessage(user: UserData): boolean {
		if (user.role?.guest) {
			console.warn("Cannot create DM with guest user");
			return false;
		}
		return true;
	}

	private async processDirectMessageRequest(
		clickedUser: UserData
	): Promise<void> {
		if (clickedUser.uid === this.currentUser.uid) {
			await this.handleSelfChannel();
			return;
		}

		const dmChannel = await this.findOrCreateDMChannel(clickedUser);
		this.activateChannel(dmChannel);
	}

	private handleDirectMessageError(error: unknown): void {
		console.error("Error creating/finding direct message channel:", error);
	}

	private async handleSelfChannel(): Promise<void> {
		console.info("Self-Channel ausgewählt");

		if (this.selfChannel) {
			this.useSelfChannel();
		} else {
			await this.createSelfChannel();
		}
	}

	private useSelfChannel(): void {
		console.info(
			"Verwende existierenden Self-Channel:",
			this.selfChannel.channelId
		);

		this.activateChannel(this.selfChannel);
	}

	private async createSelfChannel(): Promise<void> {
		console.info("Erstelle neuen Self-Channel");

		const selfChannel = await this.chatService.createDirectMessageChannel(
			this.currentUser,
			this.currentUser
		);

		this.selfChannel = selfChannel;
		this.activateChannel(selfChannel);
	}

	private async findOrCreateDMChannel(
		clickedUser: UserData
	): Promise<ChannelData> {
		let dmChannel = this.findExistingDMChannel(clickedUser);

		if (!dmChannel) {
			dmChannel = await this.createNewDMChannel(clickedUser);
		}

		return dmChannel;
	}

	private findExistingDMChannel(
		clickedUser: UserData
	): ChannelData | undefined {
		let dmChannel = this.findChannelInLocalList(clickedUser);

		if (!dmChannel) {
			dmChannel = this.searchForChannelInService(clickedUser);
		}

		return dmChannel;
	}

	private findChannelInLocalList(
		clickedUser: UserData
	): ChannelData | undefined {
		return this.directMessageChannels.find((channel) =>
			this.channelContainsMember(channel, clickedUser.uid)
		);
	}

	private channelContainsMember(
		channel: ChannelData,
		userId: string
	): boolean {
		return channel.channelMembers.some((member) => member === userId);
	}

	private searchForChannelInService(
		clickedUser: UserData
	): ChannelData | undefined {
		let result: ChannelData | undefined;

		this.chatService
			.findDirectMessageChannel(this.currentUser, clickedUser)
			.then((foundChannel) => {
				result = foundChannel || undefined;
			});

		return result;
	}

	private async createNewDMChannel(
		clickedUser: UserData
	): Promise<ChannelData> {
		console.info("Erstelle neuen DM-Channel für:", clickedUser.userName);

		const dmChannel = await this.chatService.createDirectMessageChannel(
			this.currentUser,
			clickedUser
		);

		this.directMessageChannels.push(dmChannel);
		return dmChannel;
	}

	private activateChannel(channel: ChannelData): void {
		this.chatService.selectedChannel = channel;
		this.chatService.setActiveChat(channel.channelId);
		this.functionTriggerService.callSelectChannel(channel);

		this.handleResponsiveUI();
		this.cdr.detectChanges();
	}

	private handleResponsiveUI(): void {
		if (this.screenWidth <= 1024) {
			this.toggleMainMenu();
			this.chatService.handleChatResponsive(true);
		}
	}

	goBackToMenu() {
		this.toggleMainMenu();
		this.chatService.handleChatResponsive(false);
	}

	async addNewChannel(
		channelName: string,
		channelDescription: string
	): Promise<void> {
		if (!this.currentUser) {
			console.error("No current user found");
			return;
		}

		this.channelFormError = "";
		const newChannel = this.createChannelObject(
			channelName,
			channelDescription
		);
		await this.saveNewChannel(newChannel);
	}

	private createChannelObject(
		channelName: string,
		channelDescription: string
	): ChannelData {
		return {
			channelId: "",
			channelName: channelName,
			channelDescription: channelDescription,
			channelType: {
				channel: true,
				directMessage: false,
			},
			createdBy: this.currentUser.uid,
			channelMembers: [this.currentUser.uid],
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		};
	}

	private async saveNewChannel(newChannel: ChannelData): Promise<void> {
		try {
			const createdChannelId = await this.chatService.createChannel(
				newChannel
			);
			this.handleSuccessfulChannelCreation(createdChannelId);
		} catch (error) {
			this.handleChannelCreationError(error);
		}
	}

	private handleSuccessfulChannelCreation(channelId: string): void {
		console.info("Channel created with ID:", channelId);
		this.toggleModal();
		this.resetForm();
	}

	private handleChannelCreationError(error: unknown): void {
		console.info("Error creating channel:", error);
		if (error instanceof Error) {
			this.setErrorMessageFromError(error);
		} else {
			this.channelFormError = "An unexpected error occurred.";
		}
	}

	private setErrorMessageFromError(error: Error): void {
		if (error.message.includes("already exists")) {
			this.channelFormError = error.message;
		} else {
			this.channelFormError =
				"Failed to create channel. Please try again.";
		}
	}

	stopPropagation(event: Event): void {
		event.stopPropagation();
	}



	resetForm() {
		this.channelFormData = {
			name: "",
			description: "",
		};
		this.channelFormError = "";
	}

	private initializeCurrentUser() {
		this.userService.currentUser$.subscribe((user) => {
			if (user) {
				this.currentUser = user;
			}
		});
	}

	private subscribeToData() {
		this.setupDataSubscription();
	}

	private setupDataSubscription(): void {
		combineLatest([
			this.chatService.getChannels(),
			this.userService.allUsers$,
		])
			.pipe(takeUntil(this.destroy$))
			.subscribe(this.handleDataUpdate.bind(this));
	}

	private async handleDataUpdate([channels, users]: [
		ChannelData[],
		UserData[] | null
	]): Promise<void> {
		this.processDMChannels(channels);
		const updatedChannels = this.updateChannelMembersStatus(
			channels,
			users
		);

		this.updateChannelsAndUsers(updatedChannels, users);
		await this.finalizeDataUpdate();
	}

	private updateChannelsAndUsers(
		channels: ChannelData[],
		users: UserData[] | null
	): void {
		this.handleChannelsUpdate(channels);
		this.handleUsersUpdate(users);
	}

	private async finalizeDataUpdate(): Promise<void> {
		await this.updateAvailableUsers();
		this.handleInitialChannelSelection();
	}

	private processDMChannels(channels: ChannelData[]): void {
		const dmChannels = channels.filter(
			(ch) => ch.channelType?.directMessage
		);

		this.createDMPairsMap(dmChannels);
	}

	private createDMPairsMap(dmChannels: ChannelData[]): void {
		const dmPairs = new Map<string, ChannelData[]>();

		dmChannels.forEach((ch) => {
			this.addChannelToPairsMap(ch, dmPairs);
		});
	}

	private addChannelToPairsMap(
		channel: ChannelData,
		dmPairs: Map<string, ChannelData[]>
	): void {
		if (!this.isValidDMChannel(channel)) {
			return;
		}

		const pairKey = this.createPairKey(channel);
		this.addChannelToPairsList(channel, dmPairs, pairKey);
	}

	private isValidDMChannel(channel: ChannelData): boolean {
		return (
			!!channel.channelMembers &&
			channel.channelMembers.length === 2 &&
			!!channel.channelMembers[0] &&
			!!channel.channelMembers[1]
		);
	}

	private createPairKey(channel: ChannelData): string {
		const member1 = channel.channelMembers[0];
		const member2 = channel.channelMembers[1];
		return [member1, member2].sort().join("|");
	}

	private addChannelToPairsList(
		channel: ChannelData,
		dmPairs: Map<string, ChannelData[]>,
		pairKey: string
	): void {
		if (!dmPairs.has(pairKey)) {
			dmPairs.set(pairKey, []);
		}
		dmPairs.get(pairKey)!.push(channel);
	}

	private handleInitialChannelSelection(): void {
		if (this.isInitialLoad && this.channels.length > 0) {
			this.selectInitialChannel();
			this.isInitialLoad = false;
		}
	}

	private selectInitialChannel(): void {
		if (this.screenWidth < 768) {
			this.setActiveChat("");
			this.setSelectedChannel("", null);
		} else {
			this.setActiveChat(this.channels[0].channelId);
			this.setSelectedChannel(this.channels[0].channelId, null);
		}
	}

	private handleChannelsUpdate(channelsData: ChannelData[]) {
		if (!this.currentUser) return;

		const { regularChannels, directMessageChannels, selfChannel } =
			this.channelManagementService.categorizeChannels(
				channelsData,
				this.currentUser
			);

		this.channels = regularChannels;
		this.directMessageChannels = directMessageChannels;
		if (selfChannel) this.selfChannel = selfChannel;
	}

	private handleUsersUpdate(users: UserData[] | null) {
		if (!users || !this.currentUser) return;

		this.allUsers = users.filter(
			(user) => !user.role?.guest && user.uid !== this.currentUser?.uid
		);
	}

	private async updateAvailableUsers() {
		this.directMessageChannels = this.filterValidChannels(
			this.directMessageChannels
		);
		this.directMessageChannels = this.removeDuplicateChannels(
			this.directMessageChannels
		);
		this.availableUsersForDM = this.getAvailableUsersForNewDM();
	}

	private filterValidChannels(channels: ChannelData[]): ChannelData[] {
		return this.channelManagementService.filterValidChannels(
			channels,
			this.currentUser
		);
	}

	private removeDuplicateChannels(channels: ChannelData[]): ChannelData[] {
		return this.channelManagementService.removeDuplicateChannels(channels);
	}

	private getAvailableUsersForNewDM(): UserData[] {
		return this.channelManagementService.getAvailableUsersForNewDM(
			this.allUsers,
			this.directMessageChannels
		);
	}

	private findChannelById(id: string): ChannelData | null {
		return this.channelManagementService.findChannelById(
			id,
			this.channels,
			this.directMessageChannels,
			this.selfChannel
		);
	}

	private updateChannelMembersStatus(
		channels: ChannelData[],
		users: UserData[] | null
	): ChannelData[] {
		return channels;
	}
}
