import {Component, Input, OnInit} from "@angular/core";
import {IdtMessages, Message} from "../../../interfaces/message.interface";
import {ChatService} from "../../../services/chat.service";
import {ChatOptionBarComponent} from "../chat-option-bar/chat-option-bar.component";
import {CommonModule} from "@angular/common";

@Component({
    selector: "app-chat-message-other",
    imports: [CommonModule, ChatOptionBarComponent],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
})
export class ChatMessageComponent {
    @Input() message!: IdtMessages;
    isHovered = false;

    constructor(private chatService: ChatService) {
    }

    openThread() {
        this.chatService.toggleThread(true);
        this.chatService.selectedThreadMessageId = this.message.messageId
    }

    toggleHovered(bool: boolean) {
        this.isHovered = bool;
    }

    toggleProfileInfo(bool: boolean) {
        this.chatService.toggleProfileInfo(bool);
    }
}
