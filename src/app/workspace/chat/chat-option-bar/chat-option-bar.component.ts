import {CommonModule} from "@angular/common";
import {Component, Input} from "@angular/core";
import {ChatService} from "../../../services/chat.service";

@Component({
    selector: "app-chat-option-bar",
    imports: [CommonModule],
    templateUrl: "./chat-option-bar.component.html",
    styleUrl: "./chat-option-bar.component.scss",
})
export class ChatOptionBarComponent {
    @Input() isOwnMessage: boolean = false;

    constructor(private chatService: ChatService) {
    }

    openThread() {
        this.chatService.toggleThread(true);
    }
}
