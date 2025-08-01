import {EnvironmentInjector, inject, Injectable, runInInjectionContext,} from "@angular/core";
import {Observable} from "rxjs";
import {Message, Reaction} from "../interfaces/message.interface";
import {ChannelData} from "../interfaces/channel.interface";
import {
	collection,
	collectionData,
	deleteDoc,
	doc,
	Firestore,
	getDoc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	Timestamp,
	updateDoc,
	where,
} from "@angular/fire/firestore";
import {UserData} from "../interfaces/user.interface";
import {HelperService} from "./helper.service";

@Injectable({
	providedIn: "root",
})
export class ChatService {
	selectedChannel!: ChannelData;
	selectedChannelsMessages!: Message[];
	selectedThreadMessageId!: string;

	private environmentInjector = inject(EnvironmentInjector);
	private helperService: any = inject(HelperService);
	private _isChatResponsive = false;

	/**
	 * Gets the current responsive state of the chat interface.
	 *
	 * @return {boolean} True if the chat is in responsive mode, false otherwise.
	 */
	get isChatResponsive(): boolean {
		return this._isChatResponsive;
	}

	private _isThreadOpen = false;

	/**
	 * Gets the current state of the thread panel.
	 *
	 * @return {boolean} True if the thread panel is open, false otherwise.
	 */
	get isThreadOpen(): boolean {
		return this._isThreadOpen;
	}

	private _isNewMessage = false;

	/**
	 * Gets the state indicating if a new message is being composed.
	 *
	 * @return {boolean} True if a new message is being composed, false otherwise.
	 */
	get isNewMessage(): boolean {
		return this._isNewMessage;
	}

	private _isProfileCardOpen = false;

	/**
	 * Gets the current state of the profile card.
	 *
	 * @return {boolean} True if the profile card is open, false otherwise.
	 */
	get isProfileCardOpen(): boolean {
		return this._isProfileCardOpen;
	}

	private _activeChat!: string;

	/**
	 * Gets the ID of the currently active chat.
	 *
	 * @return {string} The ID of the active chat.
	 */
	get activeChat(): string {
		return this._activeChat;
	}

	private _currentPerson!: UserData;

	/**
	 * Gets the user data of the currently selected person.
	 *
	 * @return {UserData} The user data of the current person.
	 */
	get currentPerson(): UserData {
		return this._currentPerson;
	}

	/**
	 * Sets the responsive state of the chat interface.
	 *
	 * @param {boolean} bool - The new responsive state to set.
	 * @return {void} No return value.
	 */
	handleChatResponsive(bool: boolean): void {
		this._isChatResponsive = bool;
	}

	/**
	 * Sets the currently selected person in the chat.
	 *
	 * @param {UserData} person - The user data of the person to set as current.
	 * @return {void} No return value.
	 */
	setCurrentPerson(person: UserData): void {
		this._currentPerson = person;
	}

	/**
	 * Sets the open/closed state of the thread panel.
	 *
	 * @param {boolean} bool - True to open the thread panel, false to close it.
	 * @return {void} No return value.
	 */
	handleThread(bool: boolean): void {
		this._isThreadOpen = bool;
	}

	/**
	 * Sets the state indicating if a new message is being composed.
	 *
	 * @param {boolean} bool - True if a new message is being composed, false otherwise.
	 * @return {void} No return value.
	 */
	handleNewMessage(bool: boolean): void {
		this._isNewMessage = bool;
	}

	/**
	 * Sets the open/closed state of the profile card.
	 *
	 * @param {boolean} bool - True to open the profile card, false to close it.
	 * @return {void} No return value.
	 */
	handleProfileCard(bool: boolean): void {
		this._isProfileCardOpen = bool;
	}

	/**
	 * Sets the ID of the currently active chat.
	 *
	 * @param {string} str - The ID of the chat to set as active.
	 * @return {void} No return value.
	 */
	setActiveChat(str: string): void {
		this._activeChat = str;
	}

	/**
	 * Updates the thread messages information in Firestore for a selected thread message.
	 *
	 * @param {string} time - The last timestamp of the thread activity.
	 * @param {number} count - The total number of answers in the thread.
	 * @return {Promise<void>} A promise that resolves when the thread information is successfully updated in Firestore.
	 */
	updateThreadMessagesInformation(
		time: string,
		count: number
	): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const messageId = this.selectedThreadMessageId;
			const channelId = this.selectedChannel.channelId;
			const firestore = inject(Firestore);
			const msgRef = doc(
				firestore,
				`channels/${channelId}/messages/${messageId}`
			);
			await updateDoc(msgRef, {
				threadLastTime: time,
				threadAnswerCount: count,
				hasThread: true,
			});
		});
	}

	/**
	 * Updates the name of thread messages in the Firestore database.
	 * The method retrieves the current channel's name, identifies the targeted
	 * thread message via its ID, and updates the respective document's
	 * thread channel name in the Firestore database.
	 *
	 * @return {Promise<void>} A promise that resolves when the thread messages' name has been successfully updated.
	 */
	updateThreadMessagesName(): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			let name = this.selectedChannel.channelName;
			const messageId = this.selectedThreadMessageId;
			const channelId = this.selectedChannel.channelId.toString();
			const firestore = inject(Firestore);
			const msgRef = doc(
				firestore,
				`channels/${channelId}/messages/${messageId}`
			);
			await updateDoc(msgRef, {threadChannelName: name});
		});
	}

	/**
	 * Fetches a list of channels from Firestore, ordered by their creation date in descending order.
	 *
	 * @return {Observable<Channel[]>} An observable that emits an array of channels.
	 */
	getChannels(): Observable<ChannelData[]> {
		return runInInjectionContext(this.environmentInjector, () => {
			const firestore = inject(Firestore);
			const channelsRef = collection(firestore, "channels");
			const q = query(channelsRef, orderBy("createdAt", "desc"));
			return collectionData(q, {idField: "channelId"}) as Observable<
				ChannelData[]
			>;
		});
	}

	/**
	 * Checks if a channel with the given name already exists.
	 * 
	 * @param {string} channelName - The name to check for duplicates.
	 * @return {Promise<boolean>} - A promise that resolves to true if a duplicate exists, false otherwise.
	 */
	async isChannelNameDuplicate(channelName: string): Promise<boolean> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const channelsRef = collection(firestore, "channels");
			const q = query(
				channelsRef,
				where("channelName", "==", channelName),
				where("channelType.channel", "==", true)
			);

			const querySnapshot = await getDocs(q);
			return !querySnapshot.empty;
		});
	}

 /**
	 * Creates a new channel in the Firestore database.
	 * For regular channels (not direct messages), checks if a channel with the same name already exists.
	 * Generates a new document ID and uses it as the channel ID.
	 *
	 * @param {ChannelData} channel - The channel data object containing properties like name, description, type, and members.
	 * @return {Promise<string>} A promise that resolves to the ID of the newly created channel.
	 */
	async createChannel(channel: ChannelData): Promise<string> {
		// Only check for duplicates if it's a regular channel, not a direct message
		if (channel.channelType.channel && !channel.channelType.directMessage) {
			const isDuplicate = await this.isChannelNameDuplicate(channel.channelName);
			if (isDuplicate) {
				throw new Error(`A channel with the name "${channel.channelName}" already exists.`);
			}
		}

		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const channelsRef = collection(firestore, "channels");
			const newDocRef = doc(channelsRef);  // Generiert eine neue Document ID
			
			// Aktualisiere die channelId im übergebenen Objekt
			channel.channelId = newDocRef.id;
			
			await setDoc(newDocRef, {
				channelId: newDocRef.id,  // Verwende die Firestore Document ID als channelId
				channelName: channel.channelName,
				channelDescription: channel.channelDescription,
				channelType: channel.channelType,
				createdBy: channel.createdBy,
				channelMembers: channel.channelMembers,
				createdAt: channel.createdAt || Timestamp.fromDate(new Date()),
				updatedAt: Timestamp.fromDate(new Date()),
			});
		
			return newDocRef.id; // Rückgabe der Document ID
		});
	}

	/**
	 * Updates the channel document in the Firestore database.
	 *
	 * @param {ChannelData} channel The channel document to update.
	 * @returns {Promise<void>} A promise that resolves when the update is complete.
	 */
	async updateChannel(channel: ChannelData): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			if (!channel.channelId) return;
			const channelDoc = doc(
				firestore,
				"channels",
				channel.channelId.toString()
			);
			await updateDoc(channelDoc, {
				channelId: channel.channelId,
				channelName: channel.channelName,
				channelDescription: channel.channelDescription,
				channelType: channel.channelType,
				createdBy: channel.createdBy,
				channelMembers: channel.channelMembers,
				createdAt: channel.createdAt,
				updatedAt: Timestamp.fromDate(new Date()),
			});
		});
	}

	/**
	 * Retrieves a stream of messages for a specified channel, ordered by timestamp in ascending order.
	 *
	 * @param {string} channelId - The unique identifier of the channel for which messages need to be fetched.
	 * @return {Observable<Message[]>} An observable that emits an array of messages for the specified channel.
	 */
	getMessages(channelId: string): Observable<Message[]> {
		return runInInjectionContext(this.environmentInjector, () => {
			const firestore = inject(Firestore);
			const messagesRef = collection(
				firestore,
				`channels/${channelId}/messages`
			);
			const q = query(messagesRef, orderBy("timestamp", "asc"));
			return collectionData(q, {idField: "messageId"}) as Observable<
				Message[]
			>;
		});
	}

	/**
	 * Sends a message to a specific channel.
	 *
	 * @param {string} channelId - The unique identifier of the channel where the message should be sent.
	 * @param {Message} message - The message object containing the content and details to be sent.
	 * @return {Promise<void>} A promise that resolves when the message has been successfully sent.
	 */

	async sendMessage(channelId: string, message: Message): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const messagesRef = collection(
				firestore,
				`channels/${channelId}/messages`
			);
			const newMsgDoc = doc(messagesRef);
			await setDoc(newMsgDoc, message);
		});
	}

	/**
	 * Retrieves thread messages for a given channel ID and parent message ID.
	 *
	 * This method retrieves the thread messages associated with a specific channel and parent message.
	 * It uses Firestore to fetch the messages and then parses them into an Observable.
	 *
	 * @param channelId The ID of the channel to retrieve messages from.
	 * @param parentMessageId The ID of the parent message to retrieve messages from.
	 * @return An Observable<Message[]> that emits the thread messages.
	 */
	getThreadMessages(
		channelId: string,
		parentMessageId: string | undefined
	): Observable<Message[]> {
		return runInInjectionContext(this.environmentInjector, () => {
			const firestore = inject(Firestore);
			const messagesRef = collection(
				firestore,
				`channels/${channelId}/messages/${parentMessageId}/thread`
			);
			const q = query(messagesRef, orderBy("timestamp", "asc"));
			return collectionData(q, {idField: "messageId"}) as Observable<
				Message[]
			>;
		});
	}

	/**
	 * Asynchronously sends a message to a thread within a Firestore channel.
	 *
	 * @param {string} channelId - The ID of the channel to send the message to.
	 * @param {string} parentMessageId - The ID of the parent message for this thread.
	 * @param {Message} message - The message to send.
	 * @returns {Promise<void>} A promise that resolves when the message has been sent.
	 */
	async sendThreadMessage(
		channelId: string,
		parentMessageId: string | undefined,
		message: Message
	): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const threadRef = collection(
				firestore,
				`channels/${channelId}/messages/${parentMessageId}/thread`
			);
			const newDocRef = doc(threadRef);
			await setDoc(newDocRef, message);
		});
	}

 /**
	 * Updates the reactions for a message in Firestore.
	 *
	 * @param {string} channelId - The ID of the channel containing the message.
	 * @param {string} messageId - The ID of the message to update.
	 * @param {Reaction[]} reactions - The updated array of reactions.
	 * @return {Promise<void>} A promise that resolves when the update is complete.
	 */
	async updateMessageReactions(
		channelId: string,
		messageId: string,
		reactions: Reaction[]
	): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const messageRef = doc(
				firestore,
				`channels/${channelId}/messages/${messageId}`
			);

			await updateDoc(messageRef, {
				reactions: reactions,
			});
		});
	}

 /**
	 * Updates the reactions for a message within a thread in Firestore.
	 *
	 * @param {string} channelId - The ID of the channel containing the thread.
	 * @param {string} threadId - The ID of the parent thread message.
	 * @param {string} messageId - The ID of the thread message to update.
	 * @param {Reaction[]} reactions - The updated array of reactions.
	 * @return {Promise<void>} A promise that resolves when the update is complete.
	 */
	async updateThreadMessageReactions(
		channelId: string,
		threadId: string,
		messageId: string,
		reactions: Reaction[]
	): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const messageRef = doc(
				firestore,
				`channels/${channelId}/messages/${threadId}/thread/${messageId}`
			);

			await updateDoc(messageRef, {
				reactions: reactions,
			});
		});
	}

	/**
	 * Updates the text of an existing message in a specific channel.
	 *
	 * @param {string} channelId - The unique identifier of the channel containing the message.
	 * @param {string} messageId - The unique identifier of the message to be updated.
	 * @param {string} newText - The new text content to update the message with.
	 * @return {Promise<void>} A promise that resolves when the update operation is complete.
	 */
	async updateMessageText(
		channelId: string,
		messageId: string,
		newText: string
	): Promise<void> {
		const r = await runInInjectionContext(this.environmentInjector, () => {
			const firestore = inject(Firestore);
			const messageRef = doc(
				firestore,
				"channels",
				channelId,
				"messages",
				messageId
			);

			return updateDoc(messageRef, {
				text: newText,
				edited: true,
				editedAt: Timestamp.fromDate(new Date()),
			});
		});
		console.info(r);
	}

 /**
	 * Deletes a message from Firestore by channel and message ID.
	 *
	 * @param {string} channelId - The ID of the channel containing the message.
	 * @param {string} messageId - The ID of the message to be deleted.
	 * @return {Promise<void>} A promise that resolves when the message is deleted.
	 */
	async deleteMessage(channelId: string, messageId: string): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const messageRef = doc(
				firestore,
				`channels/${channelId}/messages/${messageId}`
			);
			await deleteDoc(messageRef);
		});
	}

	/**
	 * Finds a direct message channel between two users.
	 *
	 * @param {UserData} user1 The first user data object.
	 * @param {UserData} user2 The second user data object.
	 * @return {Promise<ChannelData | null>} A promise that resolves to the direct message channel data if found, or null if no such channel exists.
	 */
	async findDirectMessageChannel(
		user1: UserData,
		user2: UserData
	): Promise<ChannelData | null> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const channelsRef = collection(firestore, "channels");
			const q = query(
				channelsRef,
				where("channelType.directMessage", "==", true)
			);

			const querySnapshot = await getDocs(q);

			for (const doc of querySnapshot.docs) {
				const channel = doc.data() as ChannelData;
				const memberUids = channel.channelMembers.map(
					(member) => member
				);

				if (
					memberUids.length === 2 &&
					memberUids.includes(user1.uid) &&
					memberUids.includes(user2.uid)
				) {
					return channel;
				}
			}

			return null;
		});
	}

	/**
	 * Creates a direct message channel between two users.
	 *
	 * @param {UserData} user1 - The first user who will be part of the direct message channel.
	 * @param {UserData} user2 - The second user who will be part of the direct message channel.
	 * @return {Promise<ChannelData>} A promise that resolves to the newly created direct message channel data.
	 */
	async createDirectMessageChannel(
		user1: UserData,
		user2: UserData
	): Promise<ChannelData> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const channelsRef = collection(firestore, "channels");
			const newDocRef = doc(channelsRef);  // Generiert automatisch eine Document ID
			
			const newChannel: ChannelData = {
				channelId: newDocRef.id,  // Verwende die Firestore Document ID
				channelName: `${user2.userName}`,
				channelType: {
					channel: false,
					directMessage: true,
				},
				channelDescription: `Direct message between ${user1.userName} and ${user2.userName}`,
				createdBy: user1.uid,
				channelMembers: [user1.uid, user2.uid],
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};

			await setDoc(newDocRef, {
				channelId: newChannel.channelId,
				channelName: newChannel.channelName,
				channelDescription: newChannel.channelDescription,
				channelType: newChannel.channelType,
				createdBy: newChannel.createdBy,
				channelMembers: newChannel.channelMembers,
				createdAt: newChannel.createdAt,
				updatedAt: newChannel.updatedAt,
			});

			return newChannel;
		});
	}

 /**
	 * Removes a user from a channel's member list and updates the channel document.
	 *
	 * @param {string} channelId - The ID of the channel to remove the user from.
	 * @param {string} userId - The ID of the user to remove from the channel.
	 * @return {Promise<void>} A promise that resolves when the user has been successfully removed from the channel.
	 */
	async removeUserFromChannel(
		channelId: string,
		userId: string
	): Promise<void> {
		return runInInjectionContext(this.environmentInjector, async () => {
			const firestore = inject(Firestore);
			const channelRef = doc(firestore, `channels/${channelId}`);
			try {
				const channelDoc = await getDoc(channelRef);
				const channelData = channelDoc.data() as ChannelData;
				const updatedMembers = channelData.channelMembers.filter(
					(member) => member !== userId
				);
				await updateDoc(channelRef, {
					channelMembers: updatedMembers,
					updatedAt: Timestamp.fromDate(new Date()),
				});
				if (this.selectedChannel?.channelId === channelId) {
					this.selectedChannel = {
						...this.selectedChannel,
						channelMembers: updatedMembers,
					};
				}
			} catch (error) {
				console.error("Error removing user from channel:", error);
				throw error;
			}
		});
	}

	/**
	 * Gets a real-time Observable for a specific channel by ID.
	 * This allows components to subscribe to changes in a specific channel's data.
	 * 
	 * @param {string} channelId - The ID of the channel to observe.
	 * @returns {Observable<ChannelData | undefined>} An Observable that emits the channel data whenever it changes.
	 */
	getChannelById(channelId: string): Observable<ChannelData | undefined> {
		return runInInjectionContext(this.environmentInjector, () => {
			const firestore = inject(Firestore);
			const channelRef = doc(firestore, `channels/${channelId}`);

			return new Observable<ChannelData | undefined>(observer => {
				// Set up real-time listener using onSnapshot
				const unsubscribe = onSnapshot(channelRef, 
					(docSnap) => {
						if (docSnap.exists()) {
							observer.next({ ...docSnap.data(), channelId: docSnap.id } as ChannelData);
						} else {
							observer.next(undefined);
						}
					},
					(error) => {
						console.error("Error getting channel updates:", error);
						observer.error(error);
					}
				);

				// Return the unsubscribe function to clean up when the Observable is unsubscribed
				return () => unsubscribe();
			});
		});
	}
}
