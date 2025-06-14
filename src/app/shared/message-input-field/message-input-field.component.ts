import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ChannelData} from "../../interfaces/channel.interface";
import {MessageInputModalComponent} from "./message-input-modal/message-input-modal.component";
import {UserData} from "../../interfaces/user.interface";
import {Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";

@Component({
    selector: "app-message-input-field",
    standalone: true,
    imports: [CommonModule, FormsModule, MessageInputModalComponent],
    templateUrl: "./message-input-field.component.html",
    styleUrl: "./message-input-field.component.scss",
})
export class MessageInputFieldComponent implements OnInit {
    @Input() selectedChannel!: ChannelData;
    @Input() placeholderText = "Type a message...";
    @Output() send: EventEmitter<string> = new EventEmitter<string>();
    @Output() isThread: EventEmitter<boolean> = new EventEmitter<boolean>();

    isEmojiModalOpen = false;
    isUserTagModalOpen = false;
    isChannelTagModalOpen = false;

    messageInputData = "";
    users!: UserData[];
    channelsSubscription!: Subscription;
    channels!: ChannelData[];
    emojiList: string[] = [
        "\u{1F60A}", // 😊
        "\u{1F602}", // 😂
        "\u{1F60D}", // 😍
        "\u{1F60E}", // 😎
        "\u{1F914}", // 🤔
        "\u{1F973}", // 🥳
        "\u{1F389}", // 🎉
        "\u{1F9D1}\u{200D}\u{1F4BB}", // 🧑‍💻
        "\u{1F44D}", // 👍
        "\u{1F44C}", // 👌
        "\u{2764}\u{FE0F}", // ❤️
        "\u{1F525}", // 🔥
        "\u{2B50}", // ⭐
        "\u{1F4AF}", // 💯
        "\u{2705}", // ✅
        "\u{1F680}", // 🚀
    ];

    constructor(private chatService: ChatService) {
    }

    ngOnInit() {
        this.users = this.chatService.selectedChannel.channelMembers;
        this.channelsSubscription = this.chatService
            .getChannels()
            .subscribe((channels) => {
                this.channels = channels.filter(
                    (channel) => !channel.channelType.directMessage
                );
            });
    }

    toggleEmojiModal() {
        if (
            !this.isEmojiModalOpen &&
            !this.isUserTagModalOpen &&
            !this.isChannelTagModalOpen
        ) {
            this.isEmojiModalOpen = true;
        } else {
            this.isEmojiModalOpen = false;
        }
    }

    toggleUserTagModal() {
        if (
            !this.isEmojiModalOpen &&
            !this.isUserTagModalOpen &&
            !this.isChannelTagModalOpen
        ) {
            this.isUserTagModalOpen = true;
            this.messageInputData += "@";
        } else {
            this.isUserTagModalOpen = false;

            if (this.messageInputData.endsWith("@")) {
                this.messageInputData = this.messageInputData.slice(0, -1);
            }
        }
    }

    toggleChannelTagModal() {
        if (
            !this.isEmojiModalOpen &&
            !this.isUserTagModalOpen &&
            !this.isChannelTagModalOpen
        ) {
            this.isChannelTagModalOpen = true;
            this.messageInputData += "#";
        } else {
            this.isChannelTagModalOpen = false;

            if (this.messageInputData.endsWith("#")) {
                this.messageInputData = this.messageInputData.slice(0, -1);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this.trySendMessage();
        }
        if (event.key === "@") {
            this.toggleUserTagModal();
        }

        if (event.key === "#") {
            this.toggleChannelTagModal();
        }
        if (
            (event.key === "Escape" && this.isUserTagModalOpen) ||
            (event.key === "Escape" && this.isChannelTagModalOpen)
        ) {
            if (this.isUserTagModalOpen) {
                this.toggleUserTagModal();
            }

            if (this.isChannelTagModalOpen) {
                this.toggleChannelTagModal();
            }
        }
    }

    trySendMessage() {
        const trimmedMessage = this.messageInputData.trim();
        if (trimmedMessage.length > 0) {
            this.send.emit(trimmedMessage);
            this.messageInputData = "";
        }
    }

    addUserTag(user: UserData) {
        this.messageInputData += user.userName;
        this.isUserTagModalOpen = false;
    }

    addChannelTag(channelName: string) {
        this.messageInputData += channelName;
        this.isChannelTagModalOpen = false;
    }

    addEmoji(emoji: string) {
        this.messageInputData += emoji;
        this.isEmojiModalOpen = false;
    }
}
