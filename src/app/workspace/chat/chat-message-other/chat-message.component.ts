import {Component, inject, Input} from "@angular/core";
import {IdtMessages} from "../../../interfaces/message.interface";
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

    constructor(private chatService: ChatService) {}

    openThread() {
        this.chatService.toggleThread(
            this.toggleBoolean(this.chatService.isThreadOpen)
        );
        if (this.message.messageId)
            this.chatService.selectedThreadMessageId = this.message.messageId;
    }

    toggleBoolean(bool: boolean) {
        return !bool;
    }

    toggleHovered(bool: boolean) {
        this.isHovered = bool;
    }

    handleProfileCard(bool: boolean) {
        this.chatService.handleProfileCard(bool);
    }
}
