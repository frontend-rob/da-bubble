import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Observable } from 'rxjs';
import { UserData } from "../../../interfaces/user.interface";
import { ChatService } from "../../../services/chat.service";
import { PresenceService, UserPresence } from '../../../services/presence.service';

/**
 * Component for displaying a direct message list item that represents either
 * a direct message channel or a potential chat partner.
 */
@Component({
    selector: "app-direct-message-list-item",
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: "./direct-message-list-item.component.html",
    styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent implements OnInit {
    
    @Input() chatPartner: UserData | undefined | null;
    @Input() dmChannel: any;
    @Output() channelSelected = new EventEmitter<{ channelId: string, userData: UserData | null }>();

    allUsers: UserData[] = [];
    availableUsersForDM: UserData[] = [];
    chatPartnerPresence$!: Observable<UserPresence | null>;

    /**
     * Creates an instance of DirectMessageListItemComponent.
     * 
     * @param {ChatService} chatService - Service for chat-related operations (public for template access).
     * @param {PresenceService} presenceService - Service for tracking user presence status.
     */
    constructor(
        public chatService: ChatService,
        private presenceService: PresenceService
    ) { }

    /**
     * Initializes the component by setting up the chat partner presence subscription
     * if a chat partner with a valid UID is available.
     * 
     * @return {void} This method does not return a value.
     */
    ngOnInit(): void {
        console.log(this.dmChannel);
        if (this.chatPartner?.uid) {
            this.chatPartnerPresence$ = this.presenceService.getUserPresence(this.chatPartner.uid);
        }
    }

    /**
     * Handles clicks on the direct message list item.
     * Delegates to appropriate handler based on whether a DM channel or chat partner is available.
     * 
     * @return {void} This method does not return a value.
     */
    onItemClick() {
        if (this.dmChannel) {
            this.handleDMChannelClick();
        } else if (this.chatPartner) {
            this.handleChatPartnerClick();
        }
    }

    /**
     * Handles clicks when a DM channel is available.
     * Sets the active chat and emits the channel selection event.
     * 
     * @return {void} This method does not return a value.
     */
    private handleDMChannelClick(): void {
        this.chatService.setActiveChat(this.dmChannel.channelId);
        this.channelSelected.emit({
            channelId: this.dmChannel.channelId,
            userData: null
        });
    }

    /**
     * Handles clicks when only a chat partner is available.
     * Sets the active chat using the partner's UID and emits the channel selection event.
     * 
     * @return {void} This method does not return a value.
     */
    private handleChatPartnerClick(): void {
        this.chatService.setActiveChat(this.chatPartner!.uid);
        this.channelSelected.emit({
            channelId: this.chatPartner!.uid,
            userData: this.chatPartner || null
        });
    }
}
