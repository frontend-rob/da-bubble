import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";
import {ChatService} from "../../../services/chat.service";
import {IdtMessages} from "../../../interfaces/message.interface";

@Component({
	selector: "app-chat-option-bar",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./chat-option-bar.component.html",
	styleUrl: "./chat-option-bar.component.scss",
	standalone: true,
})
export class ChatOptionBarComponent {
	@Input() message!: IdtMessages;
	@Input() isOwnMessage: boolean = false;
	@Input() emojiList!: string[];

	isEmojiModalOpen: boolean = false;
	isOptionsMenuOpen: boolean = false;

	@Output() chosenEmoji = new EventEmitter<string>();
	@Output() editMessage = new EventEmitter<IdtMessages>();
	@Output() deleteMessageEvent = new EventEmitter<IdtMessages>();
	@Input() isThisAThreadMessage!: boolean;

	constructor(private chatService: ChatService) {
	}

    openThread() {
        this.chatService.handleThread(true);
        if (this.message.messageId) {
            this.chatService.selectedThreadMessageId = this.message.messageId;
        }
        if (window.innerWidth <= 1024) {
            const chatElement = document.querySelector('app-chat');
            if (chatElement) {
                (chatElement as HTMLElement).style.display = 'none';
            }
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

	deleteMessage() {
		this.deleteMessageEvent.emit(this.message);
		this.isOptionsMenuOpen = false;
	}

	addQuickReactionThumbsUp() {
		this.chosenEmoji.emit("\u{1F44D}");
	}

	addQuickReactionCheckmark() {
		this.chosenEmoji.emit("\u{2705}");
	}
}
