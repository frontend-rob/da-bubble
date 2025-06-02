import {Component, inject, OnDestroy, OnInit, TrackByFunction,} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {ChannelData} from "../../interfaces/channel.interface";
import {Message} from "../../interfaces/message.interface";
import {ChatMessageComponent} from "./chat-message-other/chat-message.component";
import {MessageInputFieldComponent} from "../../shared/message-input-field/message-input-field.component";
import {Timestamp} from "@angular/fire/firestore";
import {AsyncPipe, CommonModule, NgForOf} from "@angular/common";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {HelperService} from "../../services/helper.service";
import {FunctionTriggerService} from "../../services/function-trigger.service";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"],
    imports: [
        ChatMessageComponent,
        MessageInputFieldComponent,
        CommonModule,
        FormsModule,
        NgForOf,
    ],
})
export class ChatComponent implements OnInit, OnDestroy {
    messages$: Observable<Message[]> | undefined;
    messages!:Message[];
    selectedChannel!: ChannelData;
    modalIsOpen = false;
    nameIsEdit = false;
    descriptionIsEdit = false;
    newChannelName: string = "";
    newChannelDescription: string = "";
    currentUser!: UserData;
    userSubscription!: Subscription;
    functionTriggerSubscription!: Subscription;

    private userService: UserService = inject(UserService);
    private helperService: HelperService = inject(HelperService);
    private functionTriggerService: FunctionTriggerService = inject(
        FunctionTriggerService
    );

    constructor(public readonly chatService: ChatService) {
        this.selectedChannel = this.chatService.selectedChannel;
    }

    get isNewMessage() {
        return this.chatService.isNewMessage;
    }

    trackByMessageId: TrackByFunction<Message> = (
        index: number,
        message: Message
    ) => {
        return (message as any).id || index;
    };

    ngOnInit(): void {
        this.functionTriggerSubscription =
            this.functionTriggerService.trigger$.subscribe((channel) => {
                this.selectChannel(channel);
            });

        this.userSubscription = this.userService.currentUser$.subscribe(
            (userData) => {
                if (userData) {
                    this.currentUser = userData;
                }
            }
        );


    }

    selectChannel(channel: ChannelData): void {
        this.chatService.selectedChannel = channel;
        this.newChannelName = channel.channelName || "";
        this.newChannelDescription = channel.channelDescription || "";
        this.messages$ = this.chatService.getMessages(
            channel.channelId.toString()
        );
        this.messages$.subscribe((messages) => {
            this.chatService.selectedChannelsMessages = messages;
            this.messages = messages;
        });
    }

    toggleModal(): void {
        this.modalIsOpen = !this.modalIsOpen;
        this.nameIsEdit = false;
        this.descriptionIsEdit = false;
    }

    toggleNameEdit(): void {
        if (this.nameIsEdit && this.chatService.selectedChannel) {
            const updatedChannel = {
                ...this.chatService.selectedChannel,
                channelName: this.newChannelName,
                updatedAt: Timestamp.now(),
            };
            this.updateChannel(updatedChannel);
        }
        this.nameIsEdit = !this.nameIsEdit;
    }

    toggleDescriptionEdit(): void {
        if (this.descriptionIsEdit && this.chatService.selectedChannel) {
            const updatedChannel = {
                ...this.chatService.selectedChannel,
                channelDescription: this.newChannelDescription,
                updatedAt: Timestamp.now(),
            };
            this.updateChannel(updatedChannel);
        }
        this.descriptionIsEdit = !this.descriptionIsEdit;
    }

    async sendChatMessage(content: string): Promise<void> {
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
            await this.chatService.sendMessage(
                this.chatService.selectedChannel.channelId.toString(),
                message
            );
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    shouldShowDate(messages: Message[], index: number): boolean {
        if (index === 0) return true;
        return messages[index].date !== messages[index - 1].date;
    }


    ngOnDestroy() {
        this.userSubscription.unsubscribe();
        this.functionTriggerSubscription.unsubscribe();
    }

    onKeyDown(event: KeyboardEvent): void {
        // TODO: ADD LOGIC
        if (event.key === "Enter" && this.isNewMessage) {
        }

        if (event.key === "Escape" && this.isNewMessage) {
            this.chatService.toggleNewMessageHeader(false);
        }
    }

    private async updateChannel(channel: ChannelData): Promise<void> {
        if (!channel.channelId) {
            return;
        }
        try {
            await this.chatService.updateChannel(channel);
            this.selectChannel(channel);
        } catch (error) {
            console.error("Error updating channel:", error);
        }
    }
}
