import { AfterViewInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Observable } from "rxjs";
import { ChannelData } from "../../../interfaces/channel.interface";
import { UserData } from "../../../interfaces/user.interface";
import { PresenceService, UserPresence } from "../../../services/PresenceManagementService";

@Component({
    selector: "app-message-input-modal",
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: "./message-input-modal.component.html",
    styleUrl: "./message-input-modal.component.scss",
})
export class MessageInputModalComponent implements AfterViewInit {
    
    @Input() isEmojiModalOpen!: boolean;
    @Input() isUserTagModalOpen!: boolean;
    @Input() isChannelTagModalOpen!: boolean;

    @Input() users!: UserData[];
    @Input() channels!: ChannelData[];
    @Input() emojiList!: string[];

    @Output() chosenChannelTag = new EventEmitter<string>();
    @Output() chosenUser = new EventEmitter<UserData>();
    @Output() chosenEmoji = new EventEmitter<string>();

    /**
     * Creates the component and injects the presence service.
     * @param presenceService Service for user presence
     */
    constructor(private presenceService: PresenceService) { }

    /**
     * Lifecycle hook called after view initialization.
     */
    ngAfterViewInit(): void { }

    /**
     * Returns an observable of the user's presence status.
     * @param uid User ID
     * @returns Observable of UserPresence or null
     */
    getUserPresence(uid: string): Observable<UserPresence | null> {
        return this.presenceService.getUserPresence(uid);
    }

    /**
     * Emits the selected user for tagging.
     * @param user The user to tag
     */
    addUserTag(user: UserData) {
        this.chosenUser.emit(user);
    }

    /**
     * Emits the selected channel name for tagging.
     * @param channelName The channel name to tag
     */
    addChannelTag(channelName: string) {
        this.chosenChannelTag.emit(channelName);
    }

    /**
     * Emits the selected emoji.
     * @param emojiName The emoji to add
     */
    addEmoji(emojiName: string) {
        this.chosenEmoji.emit(emojiName);
    }
}
