import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-chat-option-bar',
    imports: [CommonModule],
    templateUrl: './chat-option-bar.component.html',
    styleUrl: './chat-option-bar.component.scss'
})
export class ChatOptionBarComponent {
    @Input() isOwnMessage: boolean = false;
}
