import {Component, Input, OnInit} from "@angular/core";
import {Message} from "../../../interfaces/message.interface";
import {ChatService} from "../../../services/chat.service";

@Component({
    selector: "app-chat-message-other",
    imports: [],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
})
export class ChatMessageComponent implements OnInit {
    @Input() message!: Message;

    constructor(private chatService: ChatService) {
    }

    ngOnInit(): void {
        console.log(this.message);
    }

    toggleThread() {
        this.chatService.toggleThread(true);
    }
}
