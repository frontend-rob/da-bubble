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
import { PresenceService, UserPresence } from "../../services/PresenceManagementService";

@Component({
    selector: "app-workspace-header",
    imports: [
        CommonModule,
        ProfileCardComponent,
        SearchCardComponent,
        AvatarsComponent,
        NgOptimizedImage
    ],
    templateUrl: "./workspace-header.component.html",
    styleUrl: "./workspace-header.component.scss",
})
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {

    currentPerson!: UserData;
    userSubscription!: Subscription;
    isMainMenuOpenSubscription!: Subscription;
    screenWidthSubscription!: Subscription;
    screenWidth!: number;
    isMainMenuOpen: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService,
        private chatService: ChatService,
        private workspaceService: WorkspaceService,
        private responsiveService: ResponsiveService,
        private presenceService: PresenceService
    ) { }

    /**
     * Angular lifecycle hook: Initializes subscriptions for user, menu and screen width.
     */
    ngOnInit() {
        this.userSubscription = this.userService.currentUser$.subscribe(userData => {
            if (userData) this.currentPerson = userData;
        });

        this.isMainMenuOpenSubscription = this.workspaceService.isMainMenuOpen$.subscribe(val => {
            this.isMainMenuOpen = val;
        });

        this.screenWidthSubscription = this.responsiveService.screenWidth$.subscribe(val => {
            this.screenWidth = val;
        });
    }

    /**
     * Angular lifecycle hook: Unsubscribes from all subscriptions to prevent memory leaks.
     */
    ngOnDestroy() {
        if (this.userSubscription) this.userSubscription.unsubscribe();
        this.isMainMenuOpenSubscription.unsubscribe();
        this.screenWidthSubscription.unsubscribe();
    }

    /** Returns true if the user menu is open. */
    get isUserMenuOpen() {
        return this.userService.isUserMenuOpen;
    }

    /** Returns true if the user profile card is open. */
    get isUserProfileCardOpen() {
        return this.userService.isUserProfileCardOpen;
    }

    /** Returns true if the user avatar edit mode is active. */
    get isUserAvatarEdit() {
        return this.userService.isUserAvatarEdit;
    }

    /** Returns true if the user profile edit mode is active. */
    get isUserProfileEdit() {
        return this.userService.isUserProfileEdit;
    }

    /** Returns true if chat is in responsive mode. */
    get isChatResponsive() {
        return this.chatService.isChatResponsive;
    }

    /**
     * Gets the presence status of the current person.
     * @returns Observable with UserPresence or null.
     */
    getCurrentPersonPresence(): Observable<UserPresence | null> {
        if (this.currentPerson?.uid) {
            return this.presenceService.getUserPresence(this.currentPerson.uid);
        }
        return of(null);
    }

    /** Opens or closes the user menu.
     * @param bool True to open, false to close.
    */
    handleUserMenu(bool: boolean) {
        this.userService.handleUserMenu(bool);
    }

    /** Opens or closes the user profile card
     *  @param bool True to open, false to close.
    */
    handleUserProfileCard(bool: boolean) {
        this.userService.handleUserProfileCard(bool);
    }

    /** Enables or disables user avatar edit mode.
     * @param bool True to enable, false to disable.
    */
    handleUserAvatarEdit(bool: boolean) {
        this.userService.handleUserAvatarEdit(bool);
    }

    /** Enables or disables user profile edit mode.
     * @param bool True to enable, false to disable.
    */
    handleUserProfileEdit(bool: boolean) {
        this.userService.handleUserProfileEdit(bool);
    }

    /**
     * Navigates back to the main menu and resets chat responsiveness.
     */
    goBackToMenu() {
        const chatElement = document.querySelector('app-chat');
        if (chatElement) (chatElement as HTMLElement).style.display = '';
        this.workspaceService.setStatus(!this.isMainMenuOpen);
        this.chatService.handleChatResponsive(false);
    }

    /**
     * Logs out the current user and navigates to login page.
     */
    logOut(): void {
        this.authService
            .logOut()
            .then(() => {
                this.router.navigate(["/"]).then(r => console.info(r, "navigated to login"));
            })
            .catch(error => {
                console.error("Logout failed:", error);
            });
        this.userService.handleUserMenu(false);
    }
}
