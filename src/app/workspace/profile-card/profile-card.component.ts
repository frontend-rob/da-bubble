import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, Input} from "@angular/core";
import {ChatService} from "../../services/chat.service";
import {UserService} from "../../services/user.service";
import {UserData} from "../../interfaces/user.interface";

@Component({
	selector: "app-profile-card",
	imports: [CommonModule, NgOptimizedImage],
	templateUrl: "./profile-card.component.html",
	styleUrl: "./profile-card.component.scss",
})
export class ProfileCardComponent {
	@Input() currentPerson!: UserData;

	constructor(
		private userService: UserService,
		private chatService: ChatService
	) {
	}

	get isUserProfileCardOpen() {
		return this.userService.isUserProfileCardOpen;
	}

	get isProfileCardOpen() {
		return this.chatService.isProfileCardOpen;
	}

	closeProfileCard() {
		this.userService.handleUserProfileCard(false);
		this.chatService.handleProfileCard(false);
	}

	stopPropagation(event: Event): void {
		event.stopPropagation();
	}
}
