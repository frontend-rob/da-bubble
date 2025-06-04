import {CommonModule} from "@angular/common";
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ChatService} from "../../../services/chat.service";
import {IdtMessages} from "../../../interfaces/message.interface";

@Component({
    selector: "app-chat-option-bar",
    imports: [CommonModule],
    templateUrl: "./chat-option-bar.component.html",
    styleUrl: "./chat-option-bar.component.scss",
})
export class ChatOptionBarComponent {
    @Input() message!: IdtMessages;
    @Input() isOwnMessage: boolean = false;
    @Input() emojiList!: string[];

    isEmojiModalOpen: boolean = false;
    isOptionsMenuOpen: boolean = false;

    @Output() chosenEmoji = new EventEmitter<string>();
    @Output() editMessage = new EventEmitter<IdtMessages>();

    constructor(private chatService: ChatService) {
    }

    openThread() {
        this.chatService.handleThread(true);
        if (this.message.messageId) {
            this.chatService.selectedThreadMessageId = this.message.messageId;
        }
    }

    toggleEmojiModal() {
        this.isEmojiModalOpen = !this.isEmojiModalOpen;
        this.isOptionsMenuOpen = false;
    }

    toggleOptionsMenu() {
        this.isOptionsMenuOpen = !this.isOptionsMenuOpen;
        this.isEmojiModalOpen = false;
    }

    addEmoji(emojiName: string) {
        this.chosenEmoji.emit(emojiName);
        this.isEmojiModalOpen = false;
    }

    startEditing() {
        this.editMessage.emit(this.message);
        this.isOptionsMenuOpen = false;
    }

    deleteMessage() {}

    addQuickReaction() {
        this.chosenEmoji.emit("\u{1F44D}");
    }
}
