import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {UserData} from '../../../interfaces/user.interface';

@Component({
	selector: "app-direct-message-list-item",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./direct-message-list-item.component.html",
	styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent {
	@Input() chat!: UserData;
	@Input() active: boolean = false;
	@Output() activeMenuItem: EventEmitter<any> = new EventEmitter<any>();
	@Input() channelId?: string;

	setActiveChat() {
		if (this.channelId) {
			this.activeMenuItem.emit(this.channelId);
		} else {
			this.activeMenuItem.emit(this.chat);
		}
	}
}
