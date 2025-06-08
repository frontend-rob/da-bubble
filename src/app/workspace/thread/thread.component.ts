import {CommonModule} from "@angular/common";
import {Component, inject, OnDestroy, OnInit, TrackByFunction,} from "@angular/core";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {ChatService} from "../../services/chat.service";
import {Message} from "../../interfaces/message.interface";
import {Timestamp} from "@angular/fire/firestore";
import {HelperService} from "../../services/helper.service";
import {UserData} from "../../interfaces/user.interface";
import {firstValueFrom, map, Observable, Subscription} from "rxjs";
import {UserService} from "../../services/user.service";
import {ChatMessageComponent} from "../chat/chat-message-other/chat-message.component";

@Component({
    selector: "app-thread",
    imports: [CommonModule, MessageInputFieldComponent, ChatMessageComponent],
    templateUrl: "./thread.component.html",
    styleUrl: "./thread.component.scss",
})
export class ThreadComponent implements OnInit, OnDestroy {
    hoverEmoji = false;
    hoverTag = false;
    currentUser!: UserData;
    userSubscription!: Subscription;
    userService: UserService = inject(UserService);
    helperService: HelperService = inject(HelperService);
    chatService: ChatService = inject(ChatService);
    messages$: Observable<Message[]>;
    messages!: Message[];
    threadChannelName: string | undefined;

    constructor() {
        this.messages$ = this.chatService.getThreadMessages(
            this.chatService.selectedChannel.channelId.toString(),
            this.chatService.selectedThreadMessageId
        );
    }

    trackByMessageId: TrackByFunction<Message> = (
        index: number,
        message: Message
    ) => {
        return (message as any).id || index;
    };

    shouldShowDate(messages: Message[], index: number): boolean {
        if (index === 0) return true;
        return messages[index].date !== messages[index - 1].date;
    }

    ngOnInit() {
        this.userSubscription = this.userService.currentUser$.subscribe(
            (userData) => {
                if (userData) {
                    this.currentUser = userData;
                }
            }
        );
        this.threadChannelName = this.chatService.selectedChannel.channelName;

        this.messages$.subscribe((msgs) => {
            this.messages = msgs;
        });
    }

    handleThread() {
        this.chatService.handleThread(false);
    }

    async returnThreadAnswerCount(): Promise<number> {
        if (!this.messages$) return -1;
        return await firstValueFrom(
            this.messages$.pipe(map((messages) => messages.length + 1))
        );
    }

    async sendThreadMessage(content: string): Promise<void> {
        console.log("Sending thread...");
        if (!this.chatService.selectedChannel || !content.trim()) {
            return console.log(this.chatService.selectedChannel);
        }
        const message: Message = {
            text: content,
            sender: this.currentUser,
            edited: false,
            timestamp: Timestamp.fromDate(new Date()),
            time: this.helperService.getBerlinTime24h(),
            date: this.helperService.getBerlinDateFormatted(),
            reactions: [],
        };
        try {
            await this.chatService.updateThreadMessagesInformation(
                this.helperService.getBerlinTime24h(),
                await this.returnThreadAnswerCount()
            );
            await this.chatService.updateThreadMessagesName();
            await this.returnThreadAnswerCount();
            await this.chatService.sendThreadMessage(
                this.chatService.selectedChannel.channelId.toString(),
                this.chatService.selectedThreadMessageId,
                message
            );
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    ngOnDestroy() {
        this.userSubscription.unsubscribe();
    }
}
