import { Component } from "@angular/core";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { ChatComponent } from "./chat/chat.component";
import { WorkspaceHeaderComponent } from "./workspace-header/workspace-header.component";
import { ThreadComponent } from "./thread/thread.component";
import { CommonModule } from "@angular/common";
import { ChatService } from "../services/chat.service";
import { ProfileCardComponent } from "./profile-card/profile-card.component";
import { UserService } from "../services/user.service";

@Component({
    selector: "app-workspace",
    imports: [
        CommonModule,
        MainMenuComponent,
        ChatComponent,
        ThreadComponent,
        WorkspaceHeaderComponent,
        ThreadComponent,
        ProfileCardComponent,
    ],
    templateUrl: "./workspace.component.html",
    styleUrls: ["./workspace.component.scss"],
    providers: [ChatService],
})
export class WorkspaceComponent {

    constructor(
        private chatService: ChatService,
        private userService: UserService
    ) {}

    get isThreadOpen() {
        return this.chatService.isThreadOpen;
    }

    get isProfileCardOpen() {
        return this.chatService.isProfileCardOpen;
    }

    get isUserMenuOpen() {
        return this.userService.isUserMenuOpen;
    }

    get currentPerson() {
        return this.chatService.currentPerson;
    }

    handleProfileCard(bool: boolean) {
        this.chatService.handleProfileCard(bool);
    }

    handleUserProfileCard(bool: boolean) {
        this.userService.handleUserProfileCard(bool);
    }

    closeProfileModals() {
        this.handleProfileCard(false);
        this.handleUserProfileCard(false);
        this.userService.handleUserMenu(false);
    }
}
