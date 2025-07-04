import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { IdtMessages, Reaction } from "../../../interfaces/message.interface";
import { ChatService } from "../../../services/chat.service";
import { ChatOptionBarComponent } from "../chat-option-bar/chat-option-bar.component";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { UserService } from "../../../services/user.service";
import { Subscription } from "rxjs";
import { UserData } from "../../../interfaces/user.interface";
import { Timestamp } from "@angular/fire/firestore";
import { FormsModule } from "@angular/forms";
import { chatMessageTagLink } from "../../../pipes/chat-message-tag-link.pipe";


@Component({
    selector: "app-chat-message-other",
    imports: [
        CommonModule,
        ChatOptionBarComponent,
        FormsModule,
        NgOptimizedImage,
        chatMessageTagLink
        
    ],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
    standalone: true
})
export class ChatMessageComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    @Input() message!: IdtMessages;
    @Input() isThisAThreadMessage!: boolean;
    currentUserSubscription!: Subscription;
    currentUser!: UserData;
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

    isEditing: boolean = false;
    editedText: string = "";
    hovered: boolean = false;
    isEmojiModalOpen: boolean = false;
    isOptionsMenuOpen: boolean = false;
    showAllReactions: boolean = false;

    @ViewChild(ChatOptionBarComponent) optionBar!: ChatOptionBarComponent;
    @ViewChild('messageContent', { static: false }) messageContentRef!: ElementRef;

    constructor(
        public chatService: ChatService,
        private userService: UserService
    ) {
    }

    get isOwnMessage(): boolean {
        return this.message.sender.uid === this.currentUser.uid;
    }

    get groupedReactions(): { emoji: string; count: number; users: string[] }[] {
        if (!this.message.reactions) return [];

        const groupedEmojis = this.message.reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = { count: 0, users: [] };
            }
            acc[reaction.emoji].count++;
            acc[reaction.emoji].users.push(reaction.userName);
            return acc;
        }, {} as Record<string, { count: number; users: string[] }>);

        return Object.entries(groupedEmojis).map(([emoji, data]) => ({
            emoji,
            count: data.count,
            users: data.users,
        }));
    }

    ngOnInit() {
        this.currentUserSubscription = this.userService.currentUser$.subscribe(
            (user) => {
                if (user) {
                    this.currentUser = user;
                }
            }
        );
    }

    openThread() {
        this.chatService.handleThread(true);
        if (this.message.messageId) {
            this.chatService.selectedThreadMessageId = this.message.messageId;
        }
    }

    toggleHovered(bool: boolean) {
        this.hovered = bool;
    }

    handleProfileCard(bool: boolean, person: UserData) {
        this.chatService.handleProfileCard(bool);
        this.chatService.setCurrentPerson(person);
    }

    ngOnDestroy() {
    }

    ngAfterViewInit() {
        this.addTagLinkHandlers();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['message']) {
            this.addTagLinkHandlers();
        }
    }

    addTagLinkHandlers() {
        setTimeout(() => {
            const messageElement = document.getElementById('message-' + this.message.messageId);
            if (!messageElement) return;
            const userLinks = messageElement.querySelectorAll('.user-tag-link');
            userLinks.forEach(link => {
                (link as HTMLElement).onclick = (event) => {
                    event.preventDefault();
                    const uid = (link as HTMLElement).getAttribute('data-uid');
                    const user = this.chatService.selectedChannel.channelMembers.find(u => u.uid === uid);
                    if (user) {
                        this.handleProfileCard(true, user);
                    }
                };
                (link as HTMLElement).onmouseenter = (event) => {
                    const uid = (link as HTMLElement).getAttribute('data-uid');
                    const user = this.chatService.selectedChannel.channelMembers.find(u => u.uid === uid);
                    if (user) {
                        this.handleProfileCard(true, user);
                    }
                };
            });
        }, 0);
    }

    handleEmojiReaction(emoji: string, message: IdtMessages) {
        if (!message.reactions) {
            message.reactions = [];
        }

        const reaction: Reaction = {
            emoji: emoji,
            userId: this.currentUser.uid,
            userName: this.currentUser.userName,
            timestamp: Timestamp.fromDate(new Date()),
        };

        const existingReactionIndex = message.reactions.findIndex(
            (r) => r.emoji === emoji && r.userId === this.currentUser.uid
        );

        if (existingReactionIndex === -1) {
            message.reactions.push(reaction);
        } else {
            message.reactions.splice(existingReactionIndex, 1);
        }

        if (message.messageId) {
            this.chatService.updateMessageReactions(
                this.chatService.selectedChannel.channelId,
                message.messageId,
                message.reactions
            ).then(r => {
                console.log(r);
            });
        }
    }

    hasUserReacted(emoji: string): boolean {
        if (!this.message.reactions) return false;
        return this.message.reactions.some(
            (r) => r.emoji === emoji && r.userId === this.currentUser.uid
        );
    }

    startEditingMessage(message: IdtMessages) {
        this.isEditing = true;
        this.editedText = message.text;
    }

    saveEditedMessage() {
        if (this.message.messageId && this.editedText.trim() !== "") {
            this.chatService.updateMessageText(
                this.chatService.selectedChannel.channelId,
                this.message.messageId,
                this.editedText
            ).then(r => {
                console.log(r);
            });
            this.isEditing = false;
        }
    }

    cancelEditing() {
        this.isEditing = false;
    }


    toggleEmojiModal() {
        this.isEmojiModalOpen = !this.isEmojiModalOpen;
        this.isOptionsMenuOpen = false;
    }

    handleDeleteMessage(message: IdtMessages) {
        if (message.messageId) {
            this.chatService.deleteMessage(
                this.chatService.selectedChannel.channelId,
                message.messageId
            ).then(() => {
                console.log('Nachricht gelöscht');
            });
        }
    }
}
