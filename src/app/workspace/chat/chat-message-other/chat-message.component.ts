import { Component, Input, OnInit } from "@angular/core";
import { Message } from "../../../interfaces/message.interface";
import { ChatService } from "../../../services/chat.service";
import { ChatOptionBarComponent } from "../chat-option-bar/chat-option-bar.component";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-chat-message-other",
    imports: [CommonModule, ChatOptionBarComponent],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
})
export class ChatMessageComponent implements OnInit {
    @Input() message!: Message;
    isHovered = false;

    constructor(private chatService: ChatService) {}

    ngOnInit(): void {
        console.log(this.message);
        console.log(this.isHovered);
    }

    openThread() {
        this.chatService.toggleThread(true);
    }

    toggleHovered(bool: boolean) {
        this.isHovered = bool;
    }

    toggleProfileInfo(bool: boolean) {
        this.chatService.toggleProfileInfo(bool);
    }
}
