/**
 * TODO: This file exceeds the 400 LOC limit and should be split into multiple files.
 * Consider extracting functionality into separate service classes or component classes:
 * 1. Create a ChatMessageService to handle message-related functionality
 * 2. Create a ChannelManagementService to handle channel-related functionality
 * 3. Create a UserSearchService to handle user search functionality
 * 
 * Alternatively, split the component into multiple smaller components:
 * 1. Create a ChatHeaderComponent for the chat header
 * 2. Create a ChatMessagesComponent for the chat messages
 * 3. Create a ChatInputComponent for the chat input
 * 4. Create a ChannelInfoComponent for the channel information
 * 5. Create a MemberManagementComponent for member management
 */
import {Component, inject, OnDestroy, OnInit, TrackByFunction, ViewChild,} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {map, Observable, of, Subscription, switchMap} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Message} from "../../interfaces/message.interface";
import {ChatMessageComponent} from "./chat-message-other/chat-message.component";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {Timestamp} from "@angular/fire/firestore";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {HelperService} from "../../services/helper.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";
import {AutoScrollingDirective} from "../../directive/auto-scrolling.directive";
import {UserLookupService} from "../../services/user-lookup.service";
import {ChannelUserPipe} from "../../pipes/channel-user.pipe";
import {ResponsiveService} from "../../services/responsive.service";
import {PresenceService, UserPresence} from "../../services/presence.service";

@Component({
	selector: "app-chat",
	templateUrl: "./chat.component.html",
	styleUrls: ["./chat.component.scss"],
	imports: [
		ChatMessageComponent,
		MessageInputFieldComponent,
		CommonModule,
		FormsModule,
		NgForOf,
		NgOptimizedImage,
		AutoScrollingDirective,
		ChannelUserPipe,
	],
})
export class ChatComponent implements OnInit, OnDestroy {
	@ViewChild(MessageInputFieldComponent) messageInputField!: MessageInputFieldComponent;

	messages$: Observable<Message[]> | undefined;
	messages: Message[] = [];
	selectedChannel!: ChannelData;
	newChannelName: string = "";
	newChannelDescription: string = "";
	currentUser!: UserData;
	userSubscription!: Subscription;
	otherUser$!: Observable<UserData | null>;
	otherUserPresence$!: Observable<UserPresence | null>;
	functionTriggerSubscription!: Subscription;
	channelUpdateSubscription!: Subscription;

	isModalBGOpen = false;
	isModalOpen = false;
	isNameEdit = false;
	isDescriptionEdit = false;
	isAddNewChannel = false;
	isMembersMenuOpen = false;
	isAddMemberModalOpen = false;
	disabledButton = true;
	channels!: ChannelData[];
	newMessageInputData!: string;
	allUserDataSubscription!: Subscription;
	allUserData!: UserData[];
	selectedUsersToAdd: UserData[] = [];

	searchText: string = "";
	isSearchedUser!: UserData;
	filteredUsers: UserData[] = [];

	daysOfWeek = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	formattedDate = `${this.daysOfWeek[new Date().getDay()]}, ${
		this.months[new Date().getMonth()]
	} ${new Date().getDate()}`;
	screenWidthSubscription!: Subscription;
	screenWidth!: number;
	private userLookupService: UserLookupService = inject(UserLookupService);
	private presenceService = inject(PresenceService);
	private responsiveService: ResponsiveService = inject(ResponsiveService);
	private userService: UserService = inject(UserService);
	private helperService: HelperService = inject(HelperService);
	private functionTriggerService: FunctionTriggerService = inject(
		FunctionTriggerService
	);

	/**
	 * Constructor for initializing the class with a ChatService instance.
	 *
	 * @param {ChatService} chatService - The service instance used for chat operations.
	 * @return {void} - Does not return a value.
	 */
	constructor(public readonly chatService: ChatService) {
		this.selectedChannel = this.chatService.selectedChannel;
	}

	/**
	 * Determines whether there is a new message in the chat service.
	 *
	 * @return {boolean} Returns true if there is a new message, otherwise false.
	 */
	get isNewMessage() {
		return this.chatService.isNewMessage;
	}

	/**
	 * Determines whether the profile card is currently open.
	 *
	 * @return {boolean} Returns true if the profile card is open, otherwise false.
	 */
	get isProfileCardOpen() {
		return this.chatService.isProfileCardOpen;
	}

	/**
	 * Retrieves the presence status of a specific member.
	 *
	 * @param {string} uid - The unique identifier of the member whose presence is being retrieved.
	 * @return {Observable<UserPresence | null>} An observable that emits the presence status of the member or null if not available.
	 */
	getMemberPresence(uid: string): Observable<UserPresence | null> {
		return this.presenceService.getUserPresence(uid);
	}

	/**
	 * Handles the visibility of the profile card and updates the current person.
	 *
	 * @param {boolean} bool - A boolean value to toggle the visibility of the profile card.
	 * @param {UserData} person - An object containing the details of the current person.
	 * @return {void} This method does not return any value.
	 */
	handleProfileCard(bool: boolean, person: UserData) {
		this.chatService.handleProfileCard(bool);
		this.chatService.setCurrentPerson(person);
	}

	/**
	 * Gets the other user in a direct message channel (not the current user)
	 * @returns The other user in the direct message channel
	 */
	getOtherUserInDirectMessage(): Observable<UserData | null> {
		const selectedChannel = this.chatService.selectedChannel;

		if (!this.isValidDirectMessageChannel(selectedChannel)) {
			return of(null);
		}

		if (this.isSelfChannel(selectedChannel)) {
			return of(this.currentUser);
		}

		return this.getOtherUserObservable(selectedChannel);
	}

	/**
	 * Validates whether the provided channel is a valid direct message channel.
	 *
	 * @param {ChannelData | null} channel - The channel object to validate. Can be null.
	 * @return {boolean} Returns true if the channel exists and its type is a direct message; otherwise, false.
	 */
	private isValidDirectMessageChannel(channel: ChannelData | null): boolean {
		return !!channel && !!channel.channelType?.directMessage;
	}

	/**
	 * Determines whether the provided channel is a "self-channel,"
	 * meaning all members of the channel are the current user.
	 *
	 * @param {ChannelData} channel - The channel data to evaluate.
	 * @return {boolean} Returns true if all channel members are the current user; otherwise, false.
	 */
	private isSelfChannel(channel: ChannelData): boolean {
		return channel.channelMembers.every(
			(member) => member === this.currentUser.uid
		);
	}

	/**
	 * Retrieves an observable that emits the user data of the other participant in the provided channel.
	 *
	 * @param channel The channel data containing information about the participants.
	 * @return An observable that emits the data of the other user in the channel, or null if no such user exists.
	 */
	private getOtherUserObservable(channel: ChannelData): Observable<UserData | null> {
		const otherUserId = this.findOtherUserId(channel);

		if (otherUserId) {
			return this.userLookupService
				.getUserById(otherUserId)
				.pipe(map((user) => user || null));
		}

		return of(null);
	}

	/**
	 * Finds and returns the user ID of a member in the channel who is not the current user.
	 *
	 * @param {ChannelData} channel - The channel data object containing channel members.
	 * @return {string | undefined} Returns the user ID of the other member if found, or undefined if no such member exists.
	 */
	private findOtherUserId(channel: ChannelData): string | undefined {
		return channel.channelMembers.find(
			(member) => member !== this.currentUser.uid
		);
	}

	/**
	 * A custom tracking function for Angular's `trackBy` directive.
	 *
	 * This function determines how items in a collection are identified and tracked by their identity.
	 * Specifically, it allows reuse of DOM elements when rendering lists, improving performance.
	 *
	 * For the given `Message` object, the function tries to return a unique identifier for each item.
	 * If the `Message` object contains an `id` property, it will return that value.
	 * Otherwise, it will fall back to the index of the item within the list.
	 *
	 * @param index The index of the current item in the list.
	 * @param message The current `Message` item being iterated.
	 * @returns The unique identifier of the message, either its `id` or the index as a fallback.
	 */
	trackByMessageId: TrackByFunction<Message> = (
		index: number,
		message: Message
	) => {
		return (message as any).id || index;
	};

	/**
	 * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
	 * This method is used to set up various subscriptions and initialize necessary functionalities for the component.
	 *
	 * @return {void} Does not return a value.
	 */
	ngOnInit(): void {
		this.initializeUserPresence();
		this.setupFunctionTrigger();
		this.setupUserSubscription();
		this.setupAllUsersSubscription();
		this.setupChannelsSubscription();
		this.setupScreenWidthSubscription();
	}

	/**
	 * Initializes the presence status of the other user involved in a direct message.
	 * It retrieves the other user's information and sets up their presence details.
	 *
	 * @return {void} No value is returned by this method.
	 */
	private initializeUserPresence(): void {
		this.otherUser$ = this.getOtherUserInDirectMessage();
		this.setupOtherUserPresence();
	}

	/**
	 * Sets up the observable stream to monitor the presence status of another user.
	 * The method subscribes to the current other user observable and retrieves their presence status.
	 * If the user has a valid UID, the presence service is used to fetch the user's presence information.
	 * If no valid UID is found, a null value is emitted.
	 *
	 * @return {void} No value is returned by this method.
	 */
	private setupOtherUserPresence(): void {
		this.otherUserPresence$ = this.otherUser$.pipe(
			switchMap(user => {
				if (user?.uid) {
					console.info('Getting presence for user:', user.uid);
					return this.presenceService.getUserPresence(user.uid);
				} else {
					return of(null);
				}
			})
		);
	}

	/**
	 * Sets up a subscription trigger that listens to changes from the functionTriggerService
	 * and invokes the selectChannel method with the received channel.
	 *
	 * @return {void} This method does not return any value.
	 */
	private setupFunctionTrigger(): void {
		this.functionTriggerSubscription =
			this.functionTriggerService.trigger$.subscribe((channel) => {
				this.selectChannel(channel);
			});
	}

	/**
	 * Sets up a subscription to the current user's observable from the user service.
	 * This method initializes the current user data and triggers the setup of direct message observables
	 * when user data is available.
	 *
	 * @return {void} No return value.
	 */
	private setupUserSubscription(): void {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentUser = userData;
					this.initializeDirectMessageObservables();
				}
			}
		);
	}

	/**
	 * Sets up a subscription to monitor all user data changes.
	 * The subscription listens for updates from the `allUsers$` observable within the `userService`.
	 * Upon receiving user data, it applies necessary filtering and processes the data.
	 *
	 * @return {void} Does not return a value.
	 */
	private setupAllUsersSubscription(): void {
		this.allUserDataSubscription = this.userService.allUsers$.subscribe(
			(userData) => {
				if (userData) {
					this.filterAndSetAllUserData(userData);
				}
			}
		);
	}

	/**
	 * Filters the provided user data to exclude the current user and users with the username "Guest",
	 * then sets the filtered data to the `allUserData` property.
	 *
	 * @param {UserData[]} userData - The array of user data to be filtered.
	 * @return {void} No return value.
	 */
	private filterAndSetAllUserData(userData: UserData[]): void {
		this.allUserData = userData.filter(
			(user) =>
				user.uid !== this.currentUser.uid &&
				user.userName !== "Guest"
		);
	}

	/**
	 * Subscribes to the list of channels provided by the chat service and updates the local channel list.
	 *
	 * This method retrieves the channels by invoking `getChannels` from the chat service.
	 * It listens to changes in the channel data and assigns it to the local channels property.
	 *
	 * @return {void} No return value.
	 */
	private setupChannelsSubscription(): void {
		this.chatService.getChannels().subscribe((channels: ChannelData[]) => {
			this.channels = channels;
		});
	}

	/**
	 * Sets up a subscription to listen for changes in screen width from the responsive service.
	 * The screen width value is updated whenever there is a change emitted by the responsive service.
	 *
	 * @return {void} This method does not return any value.
	 */
	private setupScreenWidthSubscription(): void {
		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

	/**
	 * Selects a communication channel, updates its properties, and sets up necessary subscriptions.
	 * Additionally, initializes direct message observables for the current user if applicable
	 * and focuses on the message input field.
	 *
	 * @param {ChannelData} channel The channel data object to be selected and initialized.
	 * @return {void} No return value.
	 */
	selectChannel(channel: ChannelData): void {
		this.updateChannelProperties(channel);
		this.setupMessagesSubscription(channel);
		this.setupChannelUpdateSubscription(channel);

		if (this.currentUser) {
			this.initializeDirectMessageObservables();
		}

		this.focusMessageInputField();
	}

	/**
	 * Updates the properties of the selected channel with the provided channel data.
	 *
	 * @param {ChannelData} channel - The channel object containing updated properties such as channelName and channelDescription.
	 * @return {void} This method does not return a value.
	 */
	private updateChannelProperties(channel: ChannelData): void {
		this.chatService.selectedChannel = channel;
		this.newChannelName = channel.channelName;
		this.newChannelDescription = channel.channelDescription;
	}

	/**
	 * Sets up a subscription to the messages of a specified channel.
	 *
	 * @param {ChannelData} channel - The channel object containing data needed to retrieve messages.
	 * @return {void} This method does not return a value.
	 */
	private setupMessagesSubscription(channel: ChannelData): void {
		this.messages$ = this.chatService.getMessages(
			channel.channelId.toString()
		);
		this.messages$.subscribe((messages) => {
			this.chatService.selectedChannelsMessages = messages;
			this.messages = messages;
		});
	}

	/**
	 * Sets up a subscription that listens for updates to a specific channel and handles them.
	 *
	 * @param {ChannelData} channel - The data object representing the channel to be subscribed to.
	 * @return {void} This method does not return a value.
	 */
	private setupChannelUpdateSubscription(channel: ChannelData): void {
		if (this.channelUpdateSubscription) {
			this.channelUpdateSubscription.unsubscribe();
		}

		this.channelUpdateSubscription = this.chatService
			.getChannelById(channel.channelId.toString())
			.subscribe(this.handleChannelUpdate.bind(this));
	}

	/**
	 * Handles updates to the channel by updating the current selected channel and its details.
	 *
	 * @param {ChannelData | undefined} updatedChannel - The channel data that has been updated or undefined if no update is available.
	 * @return {void} No return value.
	 */
	private handleChannelUpdate(updatedChannel: ChannelData | undefined): void {
		if (updatedChannel) {
			this.chatService.selectedChannel = updatedChannel;
			this.newChannelName = updatedChannel.channelName;
			this.newChannelDescription = updatedChannel.channelDescription;
		}
	}

	/**
	 * Focuses the message input field by invoking its focusInput method.
	 * This ensures the input field has the user's attention for typing.
	 *
	 * @return {void} Does not return a value.
	 */
	private focusMessageInputField(): void {
		setTimeout(() => {
			if (this.messageInputField) {
				this.messageInputField.focusInput();
			}
		});
	}

	/**
	 * Opens the modal by toggling related modal state properties.
	 * Updates the modal background visibility, modal open state, new channel creation state,
	 * and resets name and description edit states.
	 *
	 * @return {void} Does not return any value.
	 */
	openModal(): void {
		this.isModalBGOpen = true;
		this.isModalOpen = !this.isModalOpen;
		this.isAddNewChannel = !this.isAddNewChannel;
		this.isNameEdit = false;
		this.isDescriptionEdit = false;
	}

	/**
	 * Toggles the name edit mode for a channel. If the edit mode is currently active,
	 * it updates the selected channel's name with the new name and sends the update
	 * to the server. Otherwise, it changes the state to allow editing.
	 *
	 * @return {void} Does not return any value.
	 */
	toggleNameEdit(): void {
		if (this.isNameEdit && this.chatService.selectedChannel) {
			const updatedChannel = {
				...this.chatService.selectedChannel,
				channelName: this.newChannelName,
				updatedAt: Timestamp.now(),
			};
			this.updateChannel(updatedChannel).then((r) => {
				console.info(r);
			});
		}
		this.isNameEdit = !this.isNameEdit;
	}

	/**
	 * Toggles the state of `isDescriptionEdit` to enable or disable the editing mode for a channel's description.
	 * If editing is active and a channel is selected, updates the channel's description with the provided new description and timestamp.
	 *
	 * @return {void} This method does not return any value.
	 */
	toggleDescriptionEdit(): void {
		if (this.isDescriptionEdit && this.chatService.selectedChannel) {
			const updatedChannel = {
				...this.chatService.selectedChannel,
				channelDescription: this.newChannelDescription,
				updatedAt: Timestamp.now(),
			};
			this.updateChannel(updatedChannel).then((r) => {
				console.info(r);
			});
		}
		this.isDescriptionEdit = !this.isDescriptionEdit;
	}

	/**
	 * Sends a chat message to the intended channel after validating its content.
	 *
	 * @param {string} content - The content of the chat message to be sent. It must be valid according to defined constraints.
	 * @return {Promise<void>} Resolves when the message is successfully sent. If the content is invalid, the method resolves without sending the message.
	 */
	async sendChatMessage(content: string): Promise<void> {
		if (!this.isValidMessageContent(content)) {
			return;
		}

		const message = this.createMessageObject(content);
		await this.sendMessageToChannel(message);
	}

	/**
	 * Validates if the provided message content is considered valid.
	 *
	 * @param {string} content - The message content to validate.
	 * @return {boolean} Returns true if the message content is valid, otherwise false.
	 */
	private isValidMessageContent(content: string): boolean {
		if (!this.chatService.selectedChannel || !content.trim()) {
			console.info(this.chatService.selectedChannel);
			return false;
		}
		return true;
	}

	/**
	 * Creates a message object with the given content.
	 *
	 * @param {string} content - The text content of the message.
	 * @return {Message} The constructed message object including metadata such as timestamp, formatted date, and user ID.
	 */
	private createMessageObject(content: string): Message {
		return {
			text: content,
			uid: this.currentUser.uid,
			edited: false,
			timestamp: Timestamp.fromDate(new Date()),
			time: this.helperService.getBerlinTime24h(),
			date: this.helperService.getBerlinDateFormatted(),
			reactions: [],
		};
	}

	/**
	 * Sends a message to the currently selected channel.
	 *
	 * @param {Message} message - The message object to be sent.
	 * @return {Promise<void>} A promise that resolves when the message is successfully sent or logs an error if the operation fails.
	 */
	private async sendMessageToChannel(message: Message): Promise<void> {
		try {
			await this.chatService.sendMessage(
				this.chatService.selectedChannel.channelId.toString(),
				message
			);
		} catch (error) {
			console.error("Error sending message:", error);
		}
	}

	/**
	 * Determines whether the date should be displayed for the message at the given index.
	 *
	 * @param {Message[]} messages - An array of message objects.
	 * @param {number} index - The index of the current message in the messages array.
	 * @return {boolean} Returns true if the date should be shown for the message; otherwise, false.
	 */
	shouldShowDate(messages: Message[], index: number): boolean {
		if (index === 0) return true;
		return messages[index].date !== messages[index - 1].date;
	}

	/**
	 * Lifecycle hook that is called when a directive, pipe, or service is destroyed.
	 * This method performs necessary cleanup such as unsubscribing from services to prevent memory leaks.
	 *
	 * @return {void} Does not return a value.
	 */
	ngOnDestroy() {
		this.unsubscribeFromAllServices();
	}
	
	/**
	 * Unsubscribes from all active service subscriptions to release resources and prevent memory leaks.
	 *
	 * @return {void} No return value.
	 */
	private unsubscribeFromAllServices(): void {
		this.screenWidthSubscription.unsubscribe();
		this.allUserDataSubscription.unsubscribe();
		this.channelUpdateSubscription.unsubscribe();
		this.functionTriggerSubscription.unsubscribe();
		this.userSubscription.unsubscribe();
	}

	/**
	 * Opens the members menu by setting the appropriate state variables.
	 * Sets `isModalBGOpen` and `isMembersMenuOpen` to true,
	 * enabling the members menu functionality alongside its background modal.
	 *
	 * @return {void} Does not return a value.
	 */
	openMembersMenu() {
		this.isModalBGOpen = true;
		this.isMembersMenuOpen = true;
	}

	/**
	 * Opens the "Add Member" modal. If the screen width is less than 768 pixels and the members menu is not already open,
	 * it opens the members menu instead of the modal. Otherwise, it closes the members menu, activates the modal background,
	 * and opens the "Add Member" modal.
	 *
	 * @return {void} This method does not return a value.
	 */
	openAddMemberModal() {
		if (this.screenWidth < 768 && !this.isMembersMenuOpen) {
			this.openMembersMenu();
		} else {
			this.isModalBGOpen = true;
			this.isMembersMenuOpen = false;
			this.isAddMemberModalOpen = true;
		}
	}

	/**
	 * Handles changes to the search input by normalizing the input text,
	 * retrieving the current channel members, and filtering users based
	 * on the search criteria. Clears the filtered user list if the input
	 * text is empty.
	 *
	 * @return {void} This method does not return a value.
	 */
	onSearchInputChange(): void {
		const text = this.getNormalizedSearchText();
		const currentMembers = this.getCurrentChannelMembers();
		
		if (!text) {
			this.clearFilteredUsers();
			return;
		}
		
		this.filterUsersBySearchCriteria(text, currentMembers);
	}
	
	/**
	 * Normalizes the search text by trimming whitespace and converting it to lowercase.
	 * If the search text is null or undefined, an empty string is returned.
	 *
	 * @return {string} The normalized search text.
	 */
	private getNormalizedSearchText(): string {
		return this.searchText?.trim().toLowerCase() ?? "";
	}
	
	/**
	 * Retrieves the list of members in the currently selected chat channel.
	 *
	 * @return {string[]} An array of strings representing the members in the current channel.
	 * If no channel is selected, returns an empty array.
	 */
	private getCurrentChannelMembers(): string[] {
		return this.chatService.selectedChannel?.channelMembers ?? [];
	}
	
	/**
	 * Clears the list of filtered users by setting it to an empty array.
	 *
	 * @return {void} This method does not return a value.
	 */
	private clearFilteredUsers(): void {
		this.filteredUsers = [];
	}
	
	/**
	 * Filters the list of all users based on the provided search text and current member list.
	 * Updates the filteredUsers property with the filtered result.
	 *
	 * @param {string} text The search text used to filter users.
	 * @param {string[]} currentMembers A list of current members to exclude from the results.
	 * @return {void} Does not return a value. Updates the filteredUsers property internally.
	 */
	private filterUsersBySearchCriteria(text: string, currentMembers: string[]): void {
		this.filteredUsers = this.allUserData?.filter(
			(user) => this.userMatchesSearchCriteria(user, text, currentMembers)
		) ?? [];
	}
	
	/**
	 * Checks if a given user matches the search criteria based on their username,
	 * whether they are already selected, and if they are part of the current members.
	 *
	 * @param {UserData} user - The user data object containing user details, including username and ID.
	 * @param {string} text - The search text used to match against the user's username.
	 * @param {string[]} currentMembers - An array of user IDs representing the current members.
	 * @return {boolean} Returns true if the user matches the search criteria; otherwise, false.
	 */
	private userMatchesSearchCriteria(user: UserData, text: string, currentMembers: string[]): boolean {
		return user.userName.toLowerCase().includes(text) &&
			!this.isUserAlreadySelected(user) &&
			!currentMembers.includes(user.uid);
	}
	
	/**
	 * Checks if a user is already selected from the list of users.
	 *
	 * @param user The user data object to check for selection status.
	 * @return Returns true if the user is already selected, otherwise false.
	 */
	private isUserAlreadySelected(user: UserData): boolean {
		return this.selectedUsersToAdd?.some((sel) => sel.uid === user.uid) ?? false;
	}

	/**
	 * Adds a user to the selection and resets related properties.
	 *
	 * @param {UserData} user - The user object to be added to the selection.
	 * @return {void} This method does not return a value.
	 */
	addUserToSelection(user: UserData): void {
		this.selectedUsersToAdd.push(user);
		this.filteredUsers = [];
		this.searchText = "";
		this.disabledButton = false;
	}

	/**
	 * Removes a user from the selection list based on their unique identifier.
	 *
	 * @param {UserData} user - The user to be removed from the selection list. It should contain a unique identifier (uid).
	 * @return {void} This method does not return any value.
	 */
	removeUserFromSelection(user: UserData): void {
		this.selectedUsersToAdd = this.selectedUsersToAdd.filter(
			(u) => u.uid !== user.uid
		);
	}

	/**
	 * Removes the current user from the selected chat channel.
	 *
	 * This method interacts with the chat service to remove the user from the active channel.
	 * It also handles closing any modals and re-selects the current channel to update the application state.
	 * If an error occurs during the channel-leaving process, it logs the error to the console.
	 *
	 * @return {Promise<void>} A promise that resolves when the user has successfully left the channel or rejects with an error if the operation fails.
	 */
	async leaveChannel() {
		try {
			await this.chatService.removeUserFromChannel(
				this.chatService.selectedChannel.channelId,
				this.currentUser.uid
			);

			this.closeModals();
			this.selectChannel(this.chatService.selectedChannel);
		} catch (error) {
			console.error("Error leaving channel:", error);
		}
	}

	/**
	 * Adds a new member to the currently selected channel if the user has permission.
	 * It validates whether members can be added to the selected channel, then updates
	 * the channel with the new member list.
	 *
	 * @return {Promise<void>} A promise that resolves when the channel has been successfully updated with the new member.
	 */
	async addNewMember() {
		const channel = this.chatService.selectedChannel;

		if (!this.canAddMembers(channel)) return;

		const updatedChannel = this.createUpdatedChannelWithNewMembers(channel);
		await this.updateChannelWithNewMembers(updatedChannel);
	}

	/**
	 * Determines if members can be added to the given channel.
	 *
	 * @param {ChannelData | null} channel - The channel to which members may be added.
	 * @return {boolean} Returns true if the channel exists and there are selected users to add, otherwise false.
	 */
	private canAddMembers(channel: ChannelData | null): boolean {
		return !!channel && this.selectedUsersToAdd.length > 0;
	}

	/**
	 * Creates an updated channel object by incorporating new members into the existing channel members.
	 *
	 * @param channel The original channel data containing current channel members.
	 * @return A new channel object with updated members and the current timestamp.
	 */
	private createUpdatedChannelWithNewMembers(channel: ChannelData): ChannelData {
		const newUsers = this.filterNewUsers(channel);

		return {
			...channel,
			channelMembers: this.combineChannelMembers(channel, newUsers),
			updatedAt: Timestamp.now(),
		};
	}

	/**
	 * Filters out users who are already members of the given channel.
	 *
	 * @param {ChannelData} channel - The channel from which to compare user membership.
	 * @return {UserData[]} An array of users that are not members of the given channel.
	 */
	private filterNewUsers(channel: ChannelData): UserData[] {
		return this.selectedUsersToAdd.filter(
			(newUser) => !channel.channelMembers.includes(newUser.uid)
		);
	}

	/**
	 * Combines the existing channel members with a new list of users and returns a new array of member IDs.
	 *
	 * @param {ChannelData} channel - The channel object containing current channel members.
	 * @param {UserData[]} newUsers - An array of user objects to be added as channel members.
	 * @return {string[]} An array of strings representing the unique IDs of all channel members.
	 */
	private combineChannelMembers(channel: ChannelData, newUsers: UserData[]): string[] {
		return [
			...channel.channelMembers,
			...newUsers.map((user) => user.uid),
		];
	}

	/**
	 * Updates a channel with newly added members.
	 *
	 * @param {ChannelData} updatedChannel - The channel data containing the updated list of members.
	 * @return {Promise<void>} A promise that resolves when the channel has been successfully updated.
	 */
	private async updateChannelWithNewMembers(updatedChannel: ChannelData): Promise<void> {
		try {
			await this.chatService.updateChannel(updatedChannel);
			this.chatService.selectedChannel = updatedChannel;
			this.resetAfterAddingMembers();
		} catch (error) {
			console.error("Error adding members:", error);
		}
	}

	/**
	 * Resets the state after adding members by clearing the list of selected users and closing any modals.
	 * @return {void} No return value.
	 */
	private resetAfterAddingMembers(): void {
		this.selectedUsersToAdd = [];
		this.closeModals();
	}

	/**
	 * Handles the keydown event for specific keys when a new message is being composed.
	 * It triggers actions based on the pressed key (e.g., "Enter" or "Escape").
	 *
	 * @param {KeyboardEvent} event - The keyboard event triggered by the key press.
	 * @return {void} This method does not return a value.
	 */
	onKeyDown(event: KeyboardEvent): void {
		if (event.key === "Enter" && this.isNewMessage) {
			this.submitNewMessageInput();
		}

		if (event.key === "Escape" && this.isNewMessage) {
			this.chatService.handleNewMessage(false);
		}
	}

	/**
	 * Closes all currently open modals by resetting their states and clearing related data.
	 *
	 * @return {void} Does not return any value.
	 */
	closeModals() {
		this.resetModalStates();
		this.resetSearchAndSelectionStates();
	}
	
	/**
	 * Resets the state of various modal-related properties to their default values.
	 * Sets all modal state flags to false, ensuring no modal is active or open.
	 *
	 * @return {void} Does not return a value.
	 */
	private resetModalStates(): void {
		this.isModalBGOpen = false;
		this.isModalOpen = false;
		this.isNameEdit = false;
		this.isDescriptionEdit = false;
		this.isAddNewChannel = false;
		this.isMembersMenuOpen = false;
		this.isAddMemberModalOpen = false;
	}
	
	/**
	 * Resets the search text, selected users, filtered users, and button states to their initial values.
	 *
	 * @return {void} No return value.
	 */
	private resetSearchAndSelectionStates(): void {
		this.searchText = "";
		this.selectedUsersToAdd = [];
		this.filteredUsers = [];
		this.disabledButton = true;
	}

	/**
	 * Handles the provided input data based on the context of the channel reference.
	 * This method checks if the current input is a channel reference and processes
	 * it accordingly if the condition is met.
	 *
	 * @return {void} This method does not return a value.
	 */
	handleInputData() {
		if (this.isChannelReference()) {
			this.processChannelReference();
		}
	}
	
	/**
	 * Checks if the input data in `newMessageInputData` corresponds to a channel reference.
	 *
	 * @return {boolean} Returns true if the first character of `newMessageInputData` is "#" and its length is greater than 1. Otherwise, returns false.
	 */
	private isChannelReference(): boolean {
		return this.newMessageInputData[0] === "#" && 
			this.newMessageInputData.length > 1;
	}
	
	/**
	 * Processes the current channel reference by checking if the `channels` property exists.
	 * If `channels` is present, it invokes the `findMatchingChannel` method to locate a corresponding channel.
	 *
	 * @return {void} This method does not return any value.
	 */
	private processChannelReference(): void {
		if (this.channels) {
			this.findMatchingChannel();
		}
	}
	
	/**
	 * Iterates through the list of available channels and checks if the `newMessageInputData` matches a channel name prefixed with '#'.
	 * The behavior or actions to be executed when a match is found are currently not defined.
	 *
	 * @return {void} This method does not return a value.
	 */
	private findMatchingChannel(): void {
		for (const channel of this.channels) {
			if (this.newMessageInputData === "#" + channel.channelName) {
				// This appears to be empty in the original code
			}
		}
	}

	/**
	 * Adds a new channel with the specified name, type, and an optional description.
	 *
	 * @param {string} name - The name of the new channel to be added.
	 * @param {string} type - The type of the new channel to be added.
	 * @param {string} [description=""] - An optional description for the new channel.
	 * @return {void} This method does not return any value.
	 */
	addNewChannel(name: string, type: string, description: string = "") {
		const newChannel = this.createChannelObject(name, type, description);
		this.saveNewChannel(newChannel);
	}

	/**
	 * Creates and returns a new channel object with the given parameters.
	 *
	 * @param {string} name - The name of the channel.
	 * @param {string} type - The type of the channel.
	 * @param {string} description - A brief description of the channel.
	 * @return {ChannelData} The newly created channel object containing relevant properties.
	 */
	private createChannelObject(name: string, type: string, description: string): ChannelData {
		return {
			channelId: this.helperService.getRandomNumber().toString(),
			channelName: name,
			channelType: this.determineChannelType(type),
			channelDescription: description,
			createdBy: this.currentUser.uid,
			channelMembers: [this.currentUser.uid],
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		};
	}

	private determineChannelType(type: string): { channel: boolean; directMessage: boolean } {
		return {
			channel: type === "channel",
			directMessage: type === "directMessage",
		};
	}

	/**
	 * Saves a new chat channel using the provided channel data.
	 *
	 * @param {ChannelData} newChannel - The data for the new channel to be created.
	 * @return {void} This method does not return a value.
	 */
	private saveNewChannel(newChannel: ChannelData): void {
		try {
			this.chatService.createChannel(newChannel);
		} catch (error) {
			console.error("Error creating channel:", error);
			// You could add user notification here, such as a toast message
		}
	}

	/**
	 * Processes the input from the new message input field and determines the appropriate action
	 * based on the input type, which can be an existing channel, direct message, email address, or
	 * a new channel creation.
	 *
	 * @return {void} This method does not return a value.
	 */
	submitNewMessageInput() {
		const isChannel = this.findChannelByPrefix("#");
		const isDirectMessage = this.findChannelByPrefix("@");
		const isEmailAdress = this.isValidEmail(this.newMessageInputData);

		if (isChannel && isChannel.channelType.channel && !isEmailAdress) {
			this.handleExistingChannel(isChannel);
		} else if (
			isDirectMessage &&
			isDirectMessage.channelType.directMessage &&
			!isEmailAdress
		) {
			this.handleExistingDirectMessage(isDirectMessage);
		} else if (isEmailAdress && !isDirectMessage && !isChannel) {
			this.handleEmailInput();
		} else {
			this.handleNewChannelCreation();
		}
	}

	/**
	 * Searches for a channel whose name, when concatenated with the given prefix, matches the new message input data.
	 *
	 * @param {string} prefix - The string to be prefixed to the channel name for comparison.
	 * @return {ChannelData | undefined} The matching channel data if found, otherwise undefined.
	 */
	private findChannelByPrefix(prefix: string): ChannelData | undefined {
		return this.channels.find(
			(channel) => this.newMessageInputData === prefix + channel.channelName
		);
	}

	/**
	 * Validates whether the provided text is a valid email address.
	 *
	 * @param text - The string to be checked for email validity.
	 * @return A boolean value that indicates whether the input string is a valid email address.
	 */
	private isValidEmail(text: string): boolean {
		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailPattern.test(text);
	}

	/**
	 * Handles operations for an existing chat channel, including setting it as the active chat, handling new message states,
	 * and clearing the new message input data.
	 *
	 * @param {ChannelData} channel - The data of the channel to be handled, including its unique identifier.
	 * @return {void} This method does not return a value.
	 */
	private handleExistingChannel(channel: ChannelData): void {
		this.chatService.setActiveChat(channel.channelId);
		this.chatService.selectedChannel = channel;
		this.chatService.handleNewMessage(false);
		this.newMessageInputData = "";
	}

	/**
	 * Handles an existing direct message by setting the active chat, updating
	 * the selected channel, and resetting the message input data.
	 *
	 * @param {ChannelData} channel - The channel data object representing the
	 * direct message to be handled.
	 * @return {void} This method does not return a value.
	 */
	private handleExistingDirectMessage(channel: ChannelData): void {
		this.chatService.setActiveChat(channel.channelId);
		this.chatService.selectedChannel = channel;
		this.chatService.handleNewMessage(false);
		this.newMessageInputData = "";
	}

	/**
	 * Handles the input provided in the email field and attempts to find a user matching the input.
	 * If a user with the specified email is found, it updates the state with the found user's data
	 * and invokes the method to find or create a direct message channel with that user.
	 *
	 * @return {void} This method does not return a value.
	 */
	private handleEmailInput(): void {
		const userWithEmail = this.allUserData.find(
			(user) => user.email === this.newMessageInputData
		);

		if (userWithEmail) {
			this.isSearchedUser = userWithEmail;
			this.findOrCreateDirectMessageChannel(userWithEmail);
		}
	}

	/**
	 * Finds or creates a direct message channel with a specified user.
	 * If an existing channel with the specified user is found, it sets the channel
	 * as the active chat. Otherwise, the method takes no further action.
	 *
	 * @param {UserData} user - The user object with whom a direct message channel is being searched or created.
	 * @return {void} This method does not return anything.
	 */
	private findOrCreateDirectMessageChannel(user: UserData): void {
		const directMessageChannel = this.channels.find(
			(channel) =>
				channel.channelType.directMessage &&
				channel.channelMembers.includes(this.currentUser.uid) &&
				channel.channelMembers.includes(user.uid)
		);

		if (directMessageChannel) {
			this.chatService.selectedChannel = directMessageChannel;
			this.chatService.setActiveChat(this.isSearchedUser.uid);
		}
	}

	/**
	 * Handles the creation of a new chat channel based on the current input data.
	 * Determines the type of channel (channel or direct message) by analyzing the prefix
	 * of the input data. If the input starts with "#", a new channel is created.
	 * If the input starts with "@", a new direct message channel is created.
	 * After creating the channel, it resets the input data and updates the
	 * messaging service.
	 *
	 * @return {void} No return value.
	 */
	private handleNewChannelCreation(): void {
		if (this.newMessageInputData[0] === "#") {
			this.addNewChannel(
				this.newMessageInputData.slice(1),
				"channel"
			);
		} else if (this.newMessageInputData[0] === "@") {
			this.addNewChannel(
				this.newMessageInputData.slice(1),
				"directMessage"
			);
		}
		this.chatService.handleNewMessage(false);
		this.newMessageInputData = "";
	}

	/**
	 * Checks if both user IDs are present in the provided array.
	 *
	 * @param {string[]} arr - The array of strings to search within.
	 * @param {string} userId1 - The first user ID to look for.
	 * @param {string} userId2 - The second user ID to look for.
	 * @return {boolean} Returns true if both user IDs are present in the array, otherwise false.
	 */
	findDirectMessage(
		arr: string[],
		userId1: string,
		userId2: string
	): boolean {
		const hasUser1 = arr.includes(userId1);
		const hasUser2 = arr.includes(userId2);
		return hasUser1 && hasUser2;
	}

	/**
	 * Initializes observables related to direct message interactions.
	 * Sets up streams for tracking the other user's information
	 * and their presence status in a direct message context.
	 *
	 * @return {void} No return value.
	 */
	private initializeDirectMessageObservables(): void {
		this.otherUser$ = this.getOtherUserInDirectMessage();

		this.otherUserPresence$ = this.otherUser$.pipe(
			switchMap(user => {
				if (user?.uid) {
					console.info('Getting presence for user:', user.uid);
					return this.presenceService.getUserPresence(user.uid);
				} else {
					return of(null);
				}
			})
		);
	}

	/**
	 * Updates an existing channel with new data.
	 *
	 * @param {ChannelData} channel - The channel data to update, which must include a valid channelId.
	 * @return {Promise<void>} A promise that resolves when the channel is successfully updated or rejects if an error occurs.
	 */
	private async updateChannel(channel: ChannelData): Promise<void> {
		if (!channel.channelId) {
			return;
		}
		try {
			await this.chatService.updateChannel(channel);
			this.selectChannel(channel);
		} catch (error) {
			console.error("Error updating channel:", error);
		}
	}
}
