import {CommonModule} from "@angular/common";
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {ChannelData} from "../../../interfaces/channel.interface";
import {UserData} from "../../../interfaces/user.interface";

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
	@Output() chosenChannelTag = new EventEmitter<string>();
	@Output() chosenUser = new EventEmitter<UserData>();
	@Output() chosenEmoji = new EventEmitter<string>();

	addUserTag(user: UserData) {
		this.chosenUser.emit(user);
	}

	addChannelTag(channelName: string) {
		this.chosenChannelTag.emit(channelName);
	}

	addEmoji(emojiName: string) {
		this.chosenEmoji.emit(emojiName);
	}
}
