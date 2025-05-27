import {CommonModule} from "@angular/common";
import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {ChatService} from "../../services/chat.service";
import {Message} from '../../interfaces/message.interface';
import {Timestamp} from '@angular/fire/firestore';
import {HelperService} from '../../services/helper.service';
import {UserData} from '../../interfaces/user.interface';
import {Subscription} from 'rxjs';
import {UserService} from '../../services/user.service';


@Component({
    selector: "app-thread",
    imports: [CommonModule, MessageInputFieldComponent],
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


    constructor() {

    }

    ngOnInit() {
        this.userSubscription = this.userService.currentUser$.subscribe(
            (userData) => {
                if (userData) {
                    this.currentUser = userData;
                }
            }
        );
    }

    toggleThread() {
        this.chatService.toggleThread(false);
    }

    async sendThreadMessage(content: string): Promise<void> {
        console.log("Sending thread...");
        if (!this.chatService.selectedChannel || !content.trim()) {
            return console.log(this.chatService.selectedChannel);
        }
        const message: Message = {
            text: content,
            sender: this.currentUser,
            timestamp: Timestamp.fromDate(new Date()),
            time: this.helperService.getBerlinTime24h(),
            date: this.helperService.getBerlinDateFormatted(),
            reactions: [],
        };
        try {
            console.log("Sending thread...lol");
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
