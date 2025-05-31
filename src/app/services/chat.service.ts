import {
    EnvironmentInjector,
    inject,
    Injectable,
    runInInjectionContext,
} from "@angular/core";
import { Observable } from "rxjs";
import { Message } from "../interfaces/message.interface";
import { ChannelData } from "../interfaces/channel.interface";
import {
    collection,
    collectionData,
    doc,
    Firestore,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
} from "@angular/fire/firestore";

@Injectable({
    providedIn: "root",
})
export class ChatService {
    selectedChannel!: ChannelData;
    selectedChannelsMessages!: Message[];
    selectedThreadMessageId!: string;
    private environmentInjector = inject(EnvironmentInjector);
    private _isThreadOpen = false;
    private _isNewMessage = false;
    private _isProfileCardOpen = false;

    get isThreadOpen(): boolean {
        return this._isThreadOpen;
    }

    get isNewMessage(): boolean {
        return this._isNewMessage;
    }

    get isProfileCardOpen(): boolean {
        return this._isProfileCardOpen;
    }

    toggleThread(bool: boolean) {
        this._isThreadOpen = bool;
    }

    toggleNewMessageHeader(bool: boolean) {
        this._isNewMessage = bool;
    }

    handleProfileCard(bool: boolean) {
        this._isProfileCardOpen = bool;
    }

    updateThreadMessagesInformation(
        time: string,
        count: number
    ): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const messageId = this.selectedThreadMessageId;
            const channelId = this.selectedChannel.channelId.toString();
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
            await updateDoc(msgRef, { threadChannelName: name });
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
            return collectionData(q, { idField: "channelId" }) as Observable<
                ChannelData[]
            >;
        });
    }

    /**
     * Creates a new channel document in the Firestore database with the provided channel details.
     *
     * @param {Channel} channel - The channel object containing channel details such as type, channelName,
     *                            channelDescription, createdBy, channelMembers, createdAt, and updatedAt.
     * @return {Promise<void>} - A promise that resolves when the channel is successfully created and stored in Firestore.
     */
    async createChannel(channel: ChannelData): Promise<void> {
        return runInInjectionContext(this.environmentInjector, async () => {
            const firestore = inject(Firestore);
            const channelsRef = collection(firestore, "channels");
            const newDocRef = doc(channelsRef);
            await setDoc(newDocRef, {
                channelId: channel.channelId,
                channelName: channel.channelName,
                channelDescription: channel.channelDescription || "",
                createdBy: channel.createdBy,
                channelMembers: channel.channelMembers || [],
                createdAt: channel.createdAt || Timestamp.fromDate(new Date()),
                updatedAt: Timestamp.fromDate(new Date()),
            });
        });
    }

    /**
     * Updates the channel document in the Firestore database.
     *
     * @param {ChannelData} channel The channel document to update.
     * @returns {Promise<void>} A promise that resolves when the update is complete.
     */
    async updateChannel(channel: ChannelData): Promise<void> {
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
            createdBy: channel.createdBy,
            channelMembers: channel.channelMembers,
            createdAt: channel.createdAt,
            updatedAt: Timestamp.fromDate(new Date()),
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
            return collectionData(q, { idField: "messageId" }) as Observable<
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
            return collectionData(q, { idField: "messageId" }) as Observable<
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
}
