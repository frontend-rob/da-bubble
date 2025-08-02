import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { Observable, of, Subscription } from "rxjs";
import { ProfileCardComponent } from "../profile-card/profile-card.component";
import { SearchCardComponent } from "./search-card/search-card.component";
import { AvatarsComponent } from "../../onboarding/avatars/avatars.component";
import { AuthService } from "../../services/auth.service";
import { UserData } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { ChatService } from "../../services/chat.service";
import { WorkspaceService } from "../../services/workspace.service";
import { ResponsiveService } from "../../services/responsive.service";
import { PresenceService, UserPresence } from "../../services/presence.service";

@Component({
	selector: "app-workspace-header",
	imports: [
		CommonModule,
		ProfileCardComponent,
		SearchCardComponent,
		AvatarsComponent,
		NgOptimizedImage,
	],
	templateUrl: "./workspace-header.component.html",
	styleUrl: "./workspace-header.component.scss",
})
/**
 * Component for the workspace header that displays user information, navigation controls,
 * and provides access to user profile and search functionality.
 */
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {
	/**
	 * The current user's data.
	 */
	currentPerson!: UserData;

	/**
	 * Subscription to the current user data updates.
	 */
	userSubscription!: Subscription;

	/**
	 * Subscription to the main menu open/closed state.
	 */
	isMainMenuOpenSubscription!: Subscription;

	/**
	 * Subscription to screen width changes for responsive design.
	 */
	screenWidthSubscription!: Subscription;

	/**
	 * The current screen width in pixels.
	 */
	screenWidth!: number;

	/**
	 * Flag indicating whether the main menu is open.
	 */
	isMainMenuOpen: boolean = false;

	/**
	 * Creates an instance of WorkspaceHeaderComponent.
	 *
	 * @param {Router} router - Angular router for navigation.
	 * @param {AuthService} authService - Service for authentication operations.
	 * @param {UserService} userService - Service for user-related operations.
	 * @param {ChatService} chatService - Service for chat-related operations.
	 * @param {WorkspaceService} workspaceService - Service for workspace-related operations.
	 * @param {ResponsiveService} responsiveService - Service for responsive design features.
	 * @param {PresenceService} presenceService - Service for tracking user presence status.
	 */
	constructor(
		private router: Router,
		private authService: AuthService,
		private userService: UserService,
		private chatService: ChatService,
		private workspaceService: WorkspaceService,
		private responsiveService: ResponsiveService,
		private presenceService: PresenceService
	) {}

	/**
	 * Initializes the component by setting up subscriptions for user data,
	 * main menu state, and screen width for responsive design.
	 *
	 * @return {void} This method does not return a value.
	 */
	ngOnInit() {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) this.currentPerson = userData;
			}
		);

		this.isMainMenuOpenSubscription =
			this.workspaceService.isMainMenuOpen$.subscribe((val) => {
				this.isMainMenuOpen = val;
			});

		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

	/**
	 * Cleans up resources when the component is destroyed by unsubscribing
	 * from all subscriptions to prevent memory leaks.
	 *
	 * @return {void} This method does not return a value.
	 */
	ngOnDestroy() {
		if (this.userSubscription) this.userSubscription.unsubscribe();
		this.isMainMenuOpenSubscription.unsubscribe();
		this.screenWidthSubscription.unsubscribe();
	}

	/**
	 * Gets whether the user menu is currently open.
	 *
	 * @return {boolean} True if the user menu is open, false otherwise.
	 */
	get isUserMenuOpen() {
		return this.userService.isUserMenuOpen;
	}

	/**
	 * Gets whether the user profile card is currently open.
	 *
	 * @return {boolean} True if the user profile card is open, false otherwise.
	 */
	get isUserProfileCardOpen() {
		return this.userService.isUserProfileCardOpen;
	}

	/**
	 * Gets whether the user avatar edit mode is currently active.
	 *
	 * @return {boolean} True if the user avatar edit mode is active, false otherwise.
	 */
	get isUserAvatarEdit() {
		return this.userService.isUserAvatarEdit;
	}

	/**
	 * Gets whether the user profile edit mode is currently active.
	 *
	 * @return {boolean} True if the user profile edit mode is active, false otherwise.
	 */
	get isUserProfileEdit() {
		return this.userService.isUserProfileEdit;
	}

	/**
	 * Gets whether the chat is in responsive mode.
	 *
	 * @return {boolean} True if the chat is in responsive mode, false otherwise.
	 */
	get isChatResponsive() {
		return this.chatService.isChatResponsive;
	}

	/**
	 * Gets the presence status of the current person.
	 *
	 * @return {Observable<UserPresence | null>} An observable that emits the user's presence status or null if no user is available.
	 */
	getCurrentPersonPresence(): Observable<UserPresence | null> {
		if (this.currentPerson?.uid) {
			return this.presenceService.getUserPresence(this.currentPerson.uid);
		}
		return of(null);
	}

	/**
	 * Opens or closes the user menu.
	 *
	 * @param {boolean} bool - True to open the user menu, false to close it.
	 * @return {void} This method does not return a value.
	 */
	handleUserMenu(bool: boolean) {
		this.userService.handleUserMenu(bool);
	}

	/**
	 * Opens or closes the user profile card.
	 *
	 * @param {boolean} bool - True to open the user profile card, false to close it.
	 * @return {void} This method does not return a value.
	 */
	handleUserProfileCard(bool: boolean) {
		this.userService.handleUserProfileCard(bool);
	}

	/**
	 * Enables or disables user avatar edit mode.
	 *
	 * @param {boolean} bool - True to enable avatar edit mode, false to disable it.
	 * @return {void} This method does not return a value.
	 */
	handleUserAvatarEdit(bool: boolean) {
		this.userService.handleUserAvatarEdit(bool);
	}

	/**
	 * Enables or disables user profile edit mode.
	 *
	 * @param {boolean} bool - True to enable profile edit mode, false to disable it.
	 * @return {void} This method does not return a value.
	 */
	handleUserProfileEdit(bool: boolean) {
		this.userService.handleUserProfileEdit(bool);
	}

	/**
	 * Navigates back to the main menu and resets chat responsiveness.
	 * Adjusts the display of the chat element and updates the main menu state.
	 *
	 * @return {void} This method does not return a value.
	 */
	goBackToMenu() {
		const chatElement = document.querySelector("app-chat");
		if (chatElement) (chatElement as HTMLElement).style.display = "";
		this.workspaceService.setMainMenuStatus(!this.isMainMenuOpen);
		this.chatService.handleChatResponsive(false);
	}

	/**
	 * Logs out the current user and navigates to the login page.
	 * Closes the user menu after logout is initiated.
	 *
	 * @return {void} This method does not return a value.
	 */
	logOut(): void {
		this.authService
			.logOut()
			.then(() => {
				this.router
					.navigate(["/"])
					.then((r) => console.info(r, "navigated to login"));
			})
			.catch((error) => {
				console.error("Logout failed:", error);
			});
		this.userService.handleUserMenu(false);
	}
}
