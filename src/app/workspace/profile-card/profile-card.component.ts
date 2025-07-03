import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import { UserData } from "../../interfaces/user.interface";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-profile-card",
	imports: [CommonModule, NgOptimizedImage, FormsModule],
	templateUrl: "./profile-card.component.html",
	styleUrl: "./profile-card.component.scss",
})
export class ProfileCardComponent {
	@Input() currentPerson!: UserData;
	newUserName: string = "";

	constructor(
		private userService: UserService,
		private chatService: ChatService
	) {}

	get isUserProfileCardOpen() {
		return this.userService.isUserProfileCardOpen;
	}

	get isProfileCardOpen() {
		return this.chatService.isProfileCardOpen;
	}

	get isUserAvatarEdit() {
		return this.userService.isUserAvatarEdit;
	}

	get isUserProfileEdit() {
		return this.userService.isUserProfileEdit;
	}

	closeProfileCard() {
		this.userService.handleUserProfileCard(false);
		this.chatService.handleProfileCard(false);
	}

	stopPropagation(event: Event): void {
		event.stopPropagation();
	}

	handleUserAvatarEdit(bool: boolean) {
		this.userService.handleUserAvatarEdit(bool);
	}

	handleUserProfileEdit(bool: boolean) {
		this.userService.handleUserProfileEdit(bool);
	}

	updateUserName() {
		this.userService.updateUserName(
			this.currentPerson.uid,
			this.newUserName
		);

		this.handleUserProfileEdit(false);

		this.newUserName = "";
	}
}
