import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {IdtMessages} from "../../../interfaces/message.interface";
import {ChatService} from "../../../services/chat.service";
import {ChatOptionBarComponent} from "../chat-option-bar/chat-option-bar.component";
import {CommonModule} from "@angular/common";
import {UserService} from '../../../services/user.service';
import {Subscription} from 'rxjs';
import {UserData} from '../../../interfaces/user.interface';

@Component({
    selector: "app-chat-message-other",
    imports: [CommonModule, ChatOptionBarComponent],
    templateUrl: "./chat-message.component.html",
    styleUrl: "./chat-message.component.scss",
})
export class ChatMessageComponent implements OnInit, OnDestroy {
    @Input() message!: IdtMessages;
    isHovered = false;
    currentUserSubscription!: Subscription;
    currentUser!: UserData;

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
}
