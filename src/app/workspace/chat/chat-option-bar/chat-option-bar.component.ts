import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ChatService } from "../../../services/chat.service";
import { IdtMessages } from "../../../interfaces/message.interface";

@Component({
    selector: "app-chat-option-bar",
    imports: [CommonModule],
    templateUrl: "./chat-option-bar.component.html",
    styleUrl: "./chat-option-bar.component.scss",
})
export class ChatOptionBarComponent {
    @Input() message!: IdtMessages;
    @Input() isOwnMessage: boolean = false;

    constructor(private chatService: ChatService) {}

    openThread() {
        this.chatService.handleThread(true);
        if (this.message.messageId) {
            this.chatService.selectedThreadMessageId = this.message.messageId;
        }
    }
}
