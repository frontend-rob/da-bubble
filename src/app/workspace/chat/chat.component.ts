import {Component, OnInit, TrackByFunction} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {ChatService} from '../../services/chat.service';
import {ChannelData} from '../../interfaces/channel.interface';
import {Message} from '../../interfaces/message.interface';
import {ChatMessageComponent} from './chat-message-other/chat-message.component';
import {MessageInputFieldComponent} from '../../shared/message-input-field/message-input-field.component';
import {Timestamp} from '@angular/fire/firestore';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    imports: [
        ChatMessageComponent,
        MessageInputFieldComponent,
        NgIf,
        FormsModule,
        NgForOf,
        AsyncPipe
    ]
})
export class ChatComponent implements OnInit {
    channels$: Observable<ChannelData[]> | undefined;
    messages$: Observable<Message[]> | undefined;
    selectedChannel: ChannelData | null = null;
    modalIsOpen = false;
    nameIsEdit = false;
    descriptionIsEdit = false;
    newChannelName: string = '';
    newChannelDescription: string = '';

    constructor(private chatService: ChatService) {
    }

    trackByMessageId: TrackByFunction<Message> = (index: number, message: Message) => {
        return (message as any).id || index;
    };

    ngOnInit(): void {
        this.channels$ = this.chatService.getChannels();

        this.channels$?.subscribe((channels) => {
            if (channels.length > 0 && !this.selectedChannel) {
                this.selectChannel(channels[0]);
            }
        });
    }

    selectChannel(channel: ChannelData): void {
        this.selectedChannel = channel;
        this.newChannelName = channel.channelName || '';
        this.newChannelDescription = channel.channelDescription || '';
        this.messages$ = this.chatService.getMessages(channel.channelId || '');
    }

    toggleModal(): void {
        this.modalIsOpen = !this.modalIsOpen;
        this.nameIsEdit = false;
        this.descriptionIsEdit = false;
    }

    toggleNameEdit(): void {
        if (this.nameIsEdit && this.selectedChannel) {
            const updatedChannel = {
                ...this.selectedChannel,
                channelName: this.newChannelName,
                updatedAt: Timestamp.now(),
            };
            this.updateChannel(updatedChannel);
        }
        this.nameIsEdit = !this.nameIsEdit;
    }

    toggleDescriptionEdit(): void {
        if (this.descriptionIsEdit && this.selectedChannel) {
            const updatedChannel = {
                ...this.selectedChannel,
                channelDescription: this.newChannelDescription,
                updatedAt: Timestamp.now(),
            };
            this.updateChannel(updatedChannel);
        }
        this.descriptionIsEdit = !this.descriptionIsEdit;
    }

    async sendMessage(content: string): Promise<void> {
        console.log('send message triggerted:');

        console.log(!this.selectedChannel || !content.trim());
        if (!this.selectedChannel || !content.trim()) {
            return console.log(this.selectedChannel);
        }
        const message: Message = {
            text: content,
            timestamp: Date.now(),
            sender: '',
            reactions: []
        };
        try {
            console.log('send messagedwadwadawd:');
            await this.chatService.sendMessage(this.selectedChannel.channelId || '', message);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    private async updateChannel(channel: ChannelData): Promise<void> {
        if (!channel.channelId) {
            return;
        }
        try {
            await this.chatService.updateChannel(channel);
            this.selectChannel(channel);
        } catch (error) {
            console.error('Error updating channel:', error);
        }
    }
}
