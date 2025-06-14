import {CommonModule} from "@angular/common";
import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output,} from "@angular/core";
import {Subscription} from "rxjs";
import {UserData} from "../../../interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import {ChannelData} from "../../../interfaces/channel.interface";
import {ChatService} from "../../../services/chat.service";

@Component({
	selector: "app-channel-list-item",
	imports: [CommonModule],
	templateUrl: "./channel-list-item.component.html",
	styleUrl: "./channel-list-item.component.scss",
})
export class ChannelListItemComponent implements OnInit, OnDestroy {
	@Input() channel!: ChannelData;
	@Input() active: boolean = false;
	@Output() activeMenuItem: EventEmitter<string> = new EventEmitter<string>();

	currentUser!: UserData;
	private userService: UserService = inject(UserService);
	private userSubscription!: Subscription;

	constructor(private chatService: ChatService) {
	}

	setActiveChat(id: string) {
		this.activeMenuItem.emit(id);
		this.chatService.handleNewMessage(false);
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

	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
	}
}
