import { Component, Input, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Observable, of, Subscription } from "rxjs";
import { UserData } from "../../interfaces/user.interface";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import { ResponsiveService } from "../../services/responsive.service";
import { PresenceService, UserPresence } from "../../services/presence.service";
import { WorkspaceComponent } from "../workspace.component";
import { WorkspaceService } from "../../services/workspace.service";

/**
 * Component for displaying and managing a user's profile card, including viewing profile information,
 * editing user details, and initiating direct messaging with the user.
 */
@Component({
	selector: "app-profile-card",
	imports: [CommonModule, NgOptimizedImage, FormsModule],
	templateUrl: "./profile-card.component.html",
	styleUrl: "./profile-card.component.scss",
})
export class ProfileCardComponent implements OnInit {
	/**
	 * The user data of the person whose profile is being displayed.
	 */
	@Input() currentPerson!: UserData;

	/**
	 * Temporary storage for the new username during edit operations.
	 */
	newUserName: string = "";

	/**
	 * Subscription to screen width changes for responsive design.
	 */
	screenWidthSubscription!: Subscription;

	/**
	 * The current screen width in pixels.
	 */
	screenWidth!: number;

	/**
	 * Creates an instance of ProfileCardComponent.
	 *
	 * @param {UserService} userService - Service for user-related operations.
	 * @param {ChatService} chatService - Service for chat-related operations.
	 * @param {ResponsiveService} responsiveService - Service for responsive design features.
	 * @param {PresenceService} presenceService - Service for tracking user presence status.
	 */
	constructor(
		private workspaceService: WorkspaceService,
		private userService: UserService,
		private chatService: ChatService,
		private responsiveService: ResponsiveService,
		private presenceService: PresenceService
	) {}

	/**
	 * Initializes the component by setting up a subscription to screen width changes
	 * for responsive design adjustments.
	 *
	 * @return {void} This method does not return a value.
	 */
	ngOnInit(): void {
		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

	/**
	 * Determines if the profile card belongs to the current user.
	 *
	 * @return {boolean} True if the profile card is open and belongs to the current user, false otherwise.
	 */
	get isOwnProfile(): boolean {
		return this.isUserProfileCardOpen && this.currentPerson?.role?.user;
	}

	/**
	 * Gets whether the user profile card is currently open.
	 *
	 * @return {boolean} True if the user profile card is open, false otherwise.
	 */
	get isUserProfileCardOpen(): boolean {
		return this.userService.isUserProfileCardOpen;
	}

	/**
	 * Gets whether the profile card is open in the chat service.
	 *
	 * @return {boolean} True if the profile card is open in the chat service, false otherwise.
	 */
	get isProfileCardOpen(): boolean {
		return this.chatService.isProfileCardOpen;
	}

	/**
	 * Gets whether the user avatar edit mode is currently active.
	 *
	 * @return {boolean} True if the user avatar edit mode is active, false otherwise.
	 */
	get isUserAvatarEdit(): boolean {
		return this.userService.isUserAvatarEdit;
	}

	/**
	 * Gets whether the user profile edit mode is currently active.
	 *
	 * @return {boolean} True if the user profile edit mode is active, false otherwise.
	 */
	get isUserProfileEdit(): boolean {
		return this.userService.isUserProfileEdit;
	}

	/**
	 * Gets the presence status of the user whose profile is being displayed.
	 *
	 * @return {Observable<UserPresence | null>} An observable that emits the user's presence status or null if no user is available.
	 */
	getUserPresence(): Observable<UserPresence | null> {
		if (this.currentPerson?.uid) {
			return this.presenceService.getUserPresence(this.currentPerson.uid);
		}
		return of(null);
	}

	/**
	 * Closes the profile card in both user and chat services.
	 *
	 * @return {void} This method does not return a value.
	 */
	closeProfileCard(): void {
		this.userService.handleUserProfileCard(false);
		this.chatService.handleProfileCard(false);
	}

	/**
	 * Stops event propagation to prevent parent elements from handling the event.
	 *
	 * @param {Event} event - The DOM event to stop from propagating.
	 * @return {void} This method does not return a value.
	 */
	stopPropagation(event: Event): void {
		event.stopPropagation();
	}

	/**
	 * Enables or disables user avatar edit mode.
	 *
	 * @param {boolean} bool - True to enable avatar edit mode, false to disable it.
	 * @return {void} This method does not return a value.
	 */
	handleUserAvatarEdit(bool: boolean): void {
		this.userService.handleUserAvatarEdit(bool);
	}

	/**
	 * Enables or disables user profile edit mode.
	 *
	 * @param {boolean} bool - True to enable profile edit mode, false to disable it.
	 * @return {void} This method does not return a value.
	 */
	handleUserProfileEdit(bool: boolean): void {
		this.userService.handleUserProfileEdit(bool);
	}

	/**
	 * Updates the user's name with the new value and exits edit mode.
	 * Clears the temporary name storage after the update.
	 *
	 * @return {void} This method does not return a value.
	 */
	updateUserName(): void {
		this.userService.updateUserName(
			this.currentPerson.uid,
			this.newUserName
		);
		this.handleUserProfileEdit(false);
		this.newUserName = "";
	}

	/**
	 * Opens a direct message conversation with the current user and closes the profile card.
	 *
	 * @return {void} This method does not return a value.
	 */
	openDirectMessage(): void {
		this.closeProfileCard();
		this.userService.openDirectMessageWithUser(this.currentPerson);
		this.workspaceService.setMainMenuStatus(false);
	}
}
