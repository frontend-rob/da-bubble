import {Component, Input} from '@angular/core';
import {Message} from '../../../interfaces/message.interface';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-chat-message-other',
    imports: [
        DatePipe
    ],
    templateUrl: './chat-message.component.html',
    styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
    @Input() message!: Message;
}
