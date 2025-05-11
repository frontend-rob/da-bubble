import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChatService } from "../../services/chat.service";
import { ChannelData } from "../../interfaces/channel.interface";
import { Timestamp } from "firebase/firestore";
import { MessageInputModalComponent } from "./message-input-modal/message-input-modal.component";
import { UserData } from "../../interfaces/user.interface";

@Component({
    selector: "app-message-input-field",
    standalone: true,
    imports: [CommonModule, FormsModule, MessageInputModalComponent],
    templateUrl: "./message-input-field.component.html",
    styleUrl: "./message-input-field.component.scss",
})
export class MessageInputFieldComponent implements OnInit {
    @Input() selectedChannel: ChannelData | undefined;
    @Input() channels$: any;
    @Input() placeholderText = "Type a message...";
    @Output() send = new EventEmitter<string>();

    isEmojiModalOpen = false;
    isUserTagModalOpen = false;
    isChannelTagModalOpen = false;

    messageInputData = "";
    chatService = inject(ChatService);

    channels: ChannelData[] = [
        {
            channelName: "General",
            createdBy: "Admin",
            channelMembers: [],
            createdAt: Timestamp.fromMillis(1746858839934),
            updatedAt: Timestamp.fromMillis(1746858839934),
        },
        {
            channelName: "Development",
            createdBy: "Admin",
            channelMembers: [],
            createdAt: Timestamp.fromMillis(1746858839934),
            updatedAt: Timestamp.fromMillis(1746858839934),
        },
        {
            channelName: "Design",
            createdBy: "Admin",
            channelMembers: [],
            createdAt: Timestamp.fromMillis(1746858839934),
            updatedAt: Timestamp.fromMillis(1746858839934),
        },
    ];

    users: UserData[] = [
        {
            uid: "1",
            userName: "John Doe",
            email: "john.doe@testmail.dev",
            photoURL: "assets/img/avatars/av-01.svg",
            createdAt: Timestamp.fromMillis(1746858839934),
            status: "online",
        },
        {
            uid: "2",
            userName: "Jane Smith",
            email: "jane.smith@testmail.dev",
            photoURL: "assets/img/avatars/av-02.svg",
            createdAt: Timestamp.fromMillis(1746858839934),
            status: "offline",
        },
        {
            uid: "3",
            userName: "Alice Johnson",
            email: "alice.johnson@testmail.dev",
            photoURL: "assets/img/avatars/av-03.svg",
            createdAt: Timestamp.fromMillis(1746858839934),
            status: "offline",
        },
        {
            uid: "4",
            userName: "Bob Brown",
            email: "bob.brown@testmail.dev",
            photoURL: "assets/img/avatars/av-04.svg",
            createdAt: Timestamp.fromMillis(1746858839934),
            status: "online",
        },
        {
            uid: "5",
            userName: "Charlie Davis",
            email: "charlie.davis@testmail.dev",
            photoURL: "assets/img/avatars/av-05.svg",
            createdAt: Timestamp.fromMillis(1746858839934),
            status: "offline",
        },
    ];

    emojiList: string[] = [
        "01-white-heavy-check-mark.svg",
        "02-heavy-black-heart.svg",
        "03-party-popper.svg",
        "04-rocket.svg",
        "05-smiling-face-with-open-mouth.svg",
        "06-winking-face.svg",
        "07-smiling-face-with-sunglasses.svg",
        "08-nerd-face.svg",
        "09-smiling-face-with-heart-shaped-eyes.svg",
        "10-thinking-face.svg",
        "11-loudly-crying-face.svg",
        "12-face-with-look-of-triumph.svg",
        "13-thumbs-up-sign.svg",
        "14-waving-hand-sign.svg",
        "15-ok-hand-sign.svg",
        "16-person-raising-both-hands-in-celebration.svg",
    ];

    ngOnInit(): void {
        this.channels$ = this.chatService.getChannels();

        this.channels$?.subscribe(async (channels: ChannelData[]) => {
            if (channels.length === 0) {
                // Noch keine Channels vorhanden, daher Default-Channel erstellen
                const defaultChannel: ChannelData = {
                    channelId: "", // Firestore setzt die ID automatisch
                    type: "default",
                    channelName: "Entwicklerteam",
                    channelDescription: "Default Channel",
                    createdBy: "system",
                    channelMembers: [],
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };
                try {
                    await this.chatService.createChannel(defaultChannel);
                    // Channels erneut laden, damit der neue Channel sichtbar wird
                    this.channels$ = this.chatService.getChannels();
                } catch (error) {
                    console.error(
                        "Fehler beim Anlegen des Default-Channels:",
                        error
                    );
                }
            } else if (!this.selectedChannel) {
                this.selectedChannel = channels[0];
            }
        });
    }

    toggleEmojiModal() {
        if (!this.isEmojiModalOpen) {
            this.isEmojiModalOpen = true;
        } else {
            this.isEmojiModalOpen = false;
        }
    }

    toggleUserTagModal() {
        if (!this.isUserTagModalOpen) {
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
        if (!this.isChannelTagModalOpen) {
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
            this.messageInputData = ""; // clear input after sending
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
        this.messageInputData += `:${emoji}:`;
        this.isEmojiModalOpen = false;
    }
}
