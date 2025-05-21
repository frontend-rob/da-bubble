import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output,} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ChatService} from "../../services/chat.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Timestamp} from "firebase/firestore";
import {MessageInputModalComponent} from "./message-input-modal/message-input-modal.component";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from '../../services/user.service';
import {Subscription} from 'rxjs';
import {HelperService} from '../../services/helper.service';

@Component({
    selector: "app-message-input-field",
    standalone: true,
    imports: [CommonModule, FormsModule, MessageInputModalComponent],
    templateUrl: "./message-input-field.component.html",
    styleUrl: "./message-input-field.component.scss",
})
export class MessageInputFieldComponent implements OnInit, OnDestroy {
    @Input() selectedChannel!: ChannelData;
    @Input() channels$: any;
    @Input() placeholderText = "Type a message...";
    @Output() send = new EventEmitter<string>();

    isEmojiModalOpen = false;
    isUserTagModalOpen = false;
    isChannelTagModalOpen = false;

    messageInputData = "";
    currentUser$!: UserData;
    userSubscription!: Subscription;
    users: UserData[] = [];
    emojiList: string[] = [
        '\u{1F60A}', // 😊
        '\u{1F602}', // 😂
        '\u{1F60D}', // 😍
        '\u{1F60E}', // 😎
        '\u{1F914}', // 🤔
        '\u{1F973}', // 🥳
        '\u{1F389}', // 🎉
        '\u{1F9D1}\u{200D}\u{1F4BB}', // 🧑‍💻
        '\u{1F44D}', // 👍
        '\u{1F44C}', // 👌
        '\u{2764}\u{FE0F}', // ❤️
        '\u{1F525}', // 🔥
        '\u{2B50}', // ⭐
        '\u{1F4AF}', // 💯
        '\u{2705}', // ✅
        '\u{1F680}', // 🚀
    ];
    private chatService: ChatService = inject(ChatService);
    private userService: UserService = inject(UserService);
    private helperService: HelperService = inject(HelperService);

    ngOnInit() {}

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
        console.log("try send message");
        const trimmedMessage = this.messageInputData.trim();
        if (trimmedMessage.length > 0) {
            console.log(this.send);
            this.send.emit(trimmedMessage);
            this.messageInputData = "";
        }
    }

    addUserTag(userName: string) {
        this.messageInputData += userName;
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

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }
}
