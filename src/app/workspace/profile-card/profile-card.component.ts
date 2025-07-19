import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Component, Input, OnInit} from "@angular/core";
import {ChatService} from "../../services/chat.service";
import {UserService} from "../../services/user.service";
import {PresenceService, UserPresence} from "../../services/PresenceManagementService";
import {UserData} from "../../interfaces/user.interface";
import {FormsModule} from "@angular/forms";
import {Observable, of, Subscription} from "rxjs";
import {ResponsiveService} from "../../services/responsive.service";

@Component({
	selector: "app-profile-card",
	imports: [CommonModule, NgOptimizedImage, FormsModule],
	templateUrl: "./profile-card.component.html",
	styleUrl: "./profile-card.component.scss",
})
export class ProfileCardComponent implements OnInit {
	@Input() currentPerson!: UserData;
	newUserName: string = "";
	screenWidthSubscription!: Subscription;
	screenWidth!: number;

	constructor(
		private userService: UserService,
		private chatService: ChatService,
		private responsiveService: ResponsiveService,
		private presenceService: PresenceService
	) {
	}

	ngOnInit(): void {
		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}


	getUserPresence(): Observable<UserPresence | null> {
		if (this.currentPerson?.uid) {
			return this.presenceService.getUserPresence(this.currentPerson.uid);
		}
		return of(null);
	}

	get isOwnProfile(): boolean {
		return this.isUserProfileCardOpen && this.currentPerson?.role?.user;
	}

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

	// ← EINFACH: Direkt UserService nutzen
	openDirectMessage() {
		this.closeProfileCard();

		// UserService Event emittieren
		this.userService.openDirectMessageWithUser(this.currentPerson);
	}
}
