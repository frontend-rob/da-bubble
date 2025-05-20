import {Component, Input} from "@angular/core";
import {Message} from "../../../interfaces/message.interface";
import {ThreadService} from "../../../services/thread.service";

@Component({
    selector: "app-chat-message-other",
    imports: [],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
})
export class ChatMessageComponent {
    @Input() message!: Message;

    constructor(private threadService: ThreadService) {
    }

    toggleThread() {
        this.threadService.toggleThread(true);
    }
}
