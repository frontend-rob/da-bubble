import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Channel } from '../../interfaces/channel.interface';
import { Timestamp } from 'firebase/firestore';

@Component({
    selector: 'app-message-input-field',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './message-input-field.component.html',
    styleUrls: ['./message-input-field.component.scss'],
})
export class MessageInputFieldComponent implements OnInit  {
    @Input() selectedChannel: Channel | undefined;
    @Input() channels$: any;
    @Input() placeholderText = 'Type a message...';
    @Output() send = new EventEmitter<string>();

    userTagModalIsOpen = false;
    emojiModalIsOpen = false;
    messageInputData = '';
    chatService = inject(ChatService);

    ngOnInit(): void {

        this.channels$ = this.chatService.getChannels();

        this.channels$?.subscribe(async (channels: Channel[]) => {
            if (channels.length === 0) {
                // Noch keine Channels vorhanden, daher Default-Channel erstellen
                const defaultChannel: Channel = {
                    channelId: '', // Firestore setzt die ID automatisch
                    type: 'default',
                    channelName: 'Entwicklerteam',
                    channelDescription: 'Default Channel',
                    createdBy: 'system',
                    channelMembers: [],
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };
                try {
                    await this.chatService.createChannel(defaultChannel);
                    // Channels erneut laden, damit der neue Channel sichtbar wird
                    this.channels$ = this.chatService.getChannels();
                } catch (error) {
                    console.error('Fehler beim Anlegen des Default-Channels:', error);
                }
            } else if (!this.selectedChannel) {
                this.selectedChannel = channels[0];
            }
        });
    }

    toggleEmojiModal() {
        this.emojiModalIsOpen = !this.emojiModalIsOpen;
    }

    toggleUserTagModal() {
        this.userTagModalIsOpen = !this.userTagModalIsOpen;
        if (this.userTagModalIsOpen) {
            this.messageInputData = '@';
        } else {
            this.messageInputData = '';
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.trySendMessage();
        }
    }

    trySendMessage() {
        console.log('try send message');
        const trimmedMessage = this.messageInputData.trim();
        if (trimmedMessage.length > 0) {
            console.log(this.send);
            this.send.emit(trimmedMessage);
            this.messageInputData = ''; // clear input after sending
        }
    }
}
