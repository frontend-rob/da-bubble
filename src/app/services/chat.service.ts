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

	get isChatResponsive(): boolean {
		return this._isChatResponsive;
	}

	private _isThreadOpen = false;

	get isThreadOpen(): boolean {
		return this._isThreadOpen;
	}

	private _isNewMessage = false;

	get isNewMessage(): boolean {
		return this._isNewMessage;
	}

	private _isProfileCardOpen = false;

	get isProfileCardOpen(): boolean {
		return this._isProfileCardOpen;
	}

	private _activeChat!: string;

	get activeChat(): string {
		return this._activeChat;
	}

	private _currentPerson!: UserData;

	get currentPerson(): UserData {
		return this._currentPerson;
	}

	handleChatResponsive(bool: boolean) {
		this._isChatResponsive = bool;
	}

	setCurrentPerson(person: UserData) {
		this._currentPerson = person;
	}

	handleThread(bool: boolean) {
		this._isThreadOpen = bool;
	}

	handleNewMessage(bool: boolean) {
		this._isNewMessage = bool;
	}

	handleProfileCard(bool: boolean) {
		this._isProfileCardOpen = bool;
	}

	setActiveChat(str: string) {
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
	 * Aktualisiert die Reaktionen einer Nachricht in Firestore.
	 *
	 * @param channelId Die ID des Kanals, in dem sich die Nachricht befindet
	 * @param messageId Die ID der Nachricht
	 * @param reactions Das aktualisierte Reaktionen-Array
	 * @returns Promise<void>
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
	 * Aktualisiert die Reaktionen einer Thread-Nachricht in Firestore.
	 *
	 * @param channelId Die ID des Kanals
	 * @param threadId Die ID der Thread-Nachricht
	 * @param messageId Die ID der Thread-Nachricht
	 * @param reactions Das aktualisierte Reaktionen-Array
	 * @returns Promise<void>
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
	 * @param channelId The ID of the channel
	 * @param messageId The ID of the message
	 * @returns Promise<void> A promise that resolves when the message is deleted
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
	 * Removes a user from a channel's member list.
	 * @param channelId - The ID of the channel to remove the user from.
	 * @param userId - The ID of the user to remove.
	 * @returns Promise<void>
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
