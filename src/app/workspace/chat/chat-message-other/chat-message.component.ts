import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {IdtMessages, Reaction} from "../../../interfaces/message.interface";
import {ChatService} from "../../../services/chat.service";
import {ChatOptionBarComponent} from "../chat-option-bar/chat-option-bar.component";
import {CommonModule} from "@angular/common";
import {UserService} from '../../../services/user.service';
import {Subscription} from 'rxjs';
import {UserData} from '../../../interfaces/user.interface';
import {Timestamp} from '@angular/fire/firestore';

@Component({
    selector: "app-chat-message-other",
    imports: [CommonModule, ChatOptionBarComponent],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
})
export class ChatMessageComponent implements OnInit, OnDestroy {
    @Input() message!: IdtMessages;
    isHovered = true;
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

    constructor(
        private chatService: ChatService,
        private userService: UserService
    ) {

    }

    ngOnInit() {
        this.currentUserSubscription = this.userService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUser = user
            }
        })
    }

    openThread() {
        this.chatService.handleThread(true);
        if (this.message.messageId) {
            this.chatService.selectedThreadMessageId = this.message.messageId;

        }
    }

    toggleHovered(bool: boolean) {
        this.isHovered = bool;
    }

    handleProfileCard(bool: boolean) {
        this.chatService.handleProfileCard(bool);
    }

    get isOwnMessage(): boolean {
        return this.message.sender.uid === this.currentUser.uid;
    }

    ngOnDestroy() {

    }

    handleEmojiReaction(emoji: string, message: IdtMessages) {
        if (!message.reactions) {
            message.reactions = [];
        }

        const reaction: Reaction = {
            emoji: emoji,
            userId: this.currentUser.uid,
            userName: this.currentUser.userName,
            timestamp: Timestamp.fromDate(new Date())
        };

        const existingReactionIndex = message.reactions.findIndex(
            r => r.emoji === emoji && r.userId === this.currentUser.uid
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
            );
        }
    }

    get groupedReactions(): { emoji: string, count: number }[] {
        if (!this.message.reactions) return [];

        const groupedEmojis = this.message.reactions.reduce((acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = 0;
            }
            acc[reaction.emoji]++;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(groupedEmojis).map(([emoji, count]) => ({
            emoji,
            count
        }));
    }

    hasUserReacted(emoji: string): boolean {
        if (!this.message.reactions) return false;
        return this.message.reactions.some(
            r => r.emoji === emoji && r.userId === this.currentUser.uid
        );
    }
}
