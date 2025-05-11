import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChannelData } from "../../../interfaces/channel.interface";
import { UserData } from "../../../interfaces/user.interface";

@Component({
    selector: "app-message-input-modal",
    imports: [CommonModule],
    templateUrl: "./message-input-modal.component.html",
    styleUrl: "./message-input-modal.component.scss",
})
export class MessageInputModalComponent {
    @Input() isEmojiModalOpen!: boolean;
    @Input() isUserTagModalOpen!: boolean;
    @Input() isChannelTagModalOpen!: boolean;
    @Input() users!: UserData[];
    @Input() channels!: ChannelData[];
    @Input() emojiList!: string[];
    @Output() choosenChannelTag = new EventEmitter<string>();
    @Output() choosenUserTag = new EventEmitter<string>();
    @Output() choosenEmoji = new EventEmitter<string>();

    addUserTag(userName: string) {
        this.choosenUserTag.emit(userName);
    }

    addChannelTag(channelName: string) {
        this.choosenChannelTag.emit(channelName);
    }

    addEmoji(emojiName: string) {
        this.choosenChannelTag.emit(emojiName);
    }
}
