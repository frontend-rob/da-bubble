import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { ChannelData } from '../interfaces/channel.interface';
import {
    collection,
    collectionData,
    doc,
    Firestore,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc
} from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private environmentInjector = inject(EnvironmentInjector);

    /**
     * Fetches a list of channels from Firestore, ordered by their creation date in descending order.
     *
     * @return {Observable<Channel[]>} An observable that emits an array of channels.
     */
    getChannels(): Observable<ChannelData[]> {
        return runInInjectionContext(this.environmentInjector, () => {
            const firestore = inject(Firestore);
            const channelsRef = collection(firestore, 'channels');
            const q = query(channelsRef, orderBy('createdAt', 'desc'));
            return collectionData(q, { idField: 'channelId' }) as Observable<ChannelData[]>;
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
            const channelsRef = collection(firestore, 'channels');
            const newDocRef = doc(channelsRef);
            await setDoc(newDocRef, {
                type: channel.type,
                channelName: channel.channelName,
                channelDescription: channel.channelDescription || '',
                createdBy: channel.createdBy,
                channelMembers: channel.channelMembers || [],
                createdAt: channel.createdAt || Timestamp.now(),
                updatedAt: channel.updatedAt || Timestamp.now(),
            });
        });
    }

    async updateChannel(channel: ChannelData): Promise<void> {
        const firestore = inject(Firestore);
        if (!channel.channelId) return;
        const channelDoc = doc(firestore, 'channels', channel.channelId);
        await updateDoc(channelDoc, {
            channelName: channel.channelName,
            channelDescription: channel.channelDescription,
            updatedAt: channel.updatedAt || Timestamp.now(),
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
            const messagesRef = collection(firestore, `channels/${channelId}/messages`);
            const q = query(messagesRef, orderBy('timestamp', 'asc'));
            return collectionData(q) as Observable<Message[]>;
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
            console.log('send message chat service triggerted:');
            const firestore = inject(Firestore);
            const messagesRef = collection(firestore, `channels/${channelId}/messages`);
            const newMsgDoc = doc(messagesRef);
            await setDoc(newMsgDoc, message);
        });
    }
}
