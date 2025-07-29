import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { WorkspaceHeaderComponent } from "./workspace-header/workspace-header.component";
import { ChatComponent } from "./chat/chat.component";
import { ThreadComponent } from "./thread/thread.component";
import { ProfileCardComponent } from "./profile-card/profile-card.component";
import { ChatService } from "../services/chat.service";
import { UserService } from "../services/user.service";

/**
 * WorkspaceComponent manages the main application view, including chats, threads etc.
 */
@Component({
    selector: "app-workspace",
    imports: [
        CommonModule,
        MainMenuComponent,
        WorkspaceHeaderComponent,
        ChatComponent,
        ThreadComponent,
        ProfileCardComponent,
    ],
    templateUrl: "./workspace.component.html",
    styleUrls: ["./workspace.component.scss"],
    providers: [ChatService],
})
export class WorkspaceComponent {
    /**
     * Creates an instance of WorkspaceComponent.
     * @param chatService Service for chat-related state and actions.
     * @param userService Service for user-related state and actions.
     */
    constructor(private chatService: ChatService, private userService: UserService) { }

    /** Returns true if the thread view is open. */
    get isThreadOpen() {
        return this.chatService.isThreadOpen;
    }

    /** Returns true if the profile card is open. */
    get isProfileCardOpen() {
        return this.chatService.isProfileCardOpen;
    }

    /** Returns true if the user menu is open. */
    get isUserMenuOpen() {
        return this.userService.isUserMenuOpen;
    }

    /** Gets the current person selected in chat. */
    get currentPerson() {
        return this.chatService.currentPerson;
    }

    /** Opens or closes the profile card. */
    handleProfileCard(bool: boolean) {
        this.chatService.handleProfileCard(bool);
    }

    /** Opens or closes the user profile card. */
    handleUserProfileCard(bool: boolean) {
        this.userService.handleUserProfileCard(bool);
    }

    /** Closes all profile-related modals and menus. */
    closeProfileModals() {
        this.handleProfileCard(false);
        this.handleUserProfileCard(false);
        this.userService.handleUserMenu(false);
    }
}
