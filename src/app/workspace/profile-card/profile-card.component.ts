import { Component, Input, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Observable, of, Subscription } from "rxjs";
import { UserData } from "../../interfaces/user.interface";
import { ChatService } from "../../services/chat.service";
import { UserService } from "../../services/user.service";
import { ResponsiveService } from "../../services/responsive.service";
import { PresenceService, UserPresence } from "../../services/presence.service";

/**
 * ProfileCardComponent displays and manages a user's profile card, including editing and direct messaging.
 */
@Component({
    selector: "app-profile-card",
    imports: [
        CommonModule,
        NgOptimizedImage,
        FormsModule
    ],
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
    ) { }

    /**
     * Initializes the component and subscribes to screen width changes.
     */
    ngOnInit(): void {
        this.screenWidthSubscription =
            this.responsiveService.screenWidth$.subscribe((val) => {
                this.screenWidth = val;
            });
    }

    /** Returns true if the profile card belongs to the current user. */
    get isOwnProfile(): boolean {
        return this.isUserProfileCardOpen && this.currentPerson?.role?.user;
    }

    /** Returns true if the user profile card is open. */
    get isUserProfileCardOpen(): boolean {
        return this.userService.isUserProfileCardOpen;
    }

    /** Returns true if the profile card is open in the chat service. */
    get isProfileCardOpen(): boolean {
        return this.chatService.isProfileCardOpen;
    }

    /** Returns true if the user avatar edit mode is active. */
    get isUserAvatarEdit(): boolean {
        return this.userService.isUserAvatarEdit;
    }

    /** Returns true if the user profile edit mode is active. */
    get isUserProfileEdit(): boolean {
        return this.userService.isUserProfileEdit;
    }

    /**
     * Returns an observable of the user's presence status.
     * @returns Observable of UserPresence or null
     */
    getUserPresence(): Observable<UserPresence | null> {
        if (this.currentPerson?.uid) {
            return this.presenceService.getUserPresence(this.currentPerson.uid);
        }
        return of(null);
    }

    /**
     * Closes the profile card in both user and chat services.
     */
    closeProfileCard(): void {
        this.userService.handleUserProfileCard(false);
        this.chatService.handleProfileCard(false);
    }

    /**
     * Stops event propagation.
     * @param event The DOM event
     */
    stopPropagation(event: Event): void {
        event.stopPropagation();
    }

    /**
     * Sets the user avatar edit mode.
     * @param bool True to enable, false to disable
     */
    handleUserAvatarEdit(bool: boolean): void {
        this.userService.handleUserAvatarEdit(bool);
    }

    /**
     * Sets the user profile edit mode.
     * @param bool True to enable, false to disable
     */
    handleUserProfileEdit(bool: boolean): void {
        this.userService.handleUserProfileEdit(bool);
    }

    /**
     * Updates the user's name and exits edit mode.
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
     * Opens a direct message with the current user and closes the profile card.
     */
    openDirectMessage(): void {
        this.closeProfileCard();
        this.userService.openDirectMessageWithUser(this.currentPerson);
    }
}
