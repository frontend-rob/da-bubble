import { Component } from "@angular/core";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { ChatComponent } from "./chat/chat.component";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { WorkspaceHeaderComponent } from "./workspace-header/workspace-header.component";
import { ThreadComponent } from "./thread/thread.component";
import { CommonModule } from "@angular/common";
import { ChatService } from "../services/chat.service";
import { ProfileCardComponent } from "./profile-card/profile-card.component";

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
        private authService: AuthService,
        private router: Router,
        public chatService: ChatService
    ) {}

    get isThreadOpen() {
        return this.chatService.isThreadOpen;
    }

    get isProfileInfoOpen() {
        return this.chatService.isProfileInfoOpen;
    }

    get isProfileMenuOpen() {
        return this.chatService.isProfileInfoOpen;
    }

    logOut(): void {
        this.authService
            .logOut()
            .then(() => {
                this.router.navigate(["/"]);
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    }

    toggleProfileInfo(bool: boolean) {
        this.chatService.toggleProfileInfo(bool);
    }

    toggleProfileMenu(bool: boolean) {
        this.chatService.toggleProfileMenu(bool);
    }

    close() {
        if (this.isProfileInfoOpen) {
            this.chatService.toggleProfileInfo(false);
        } else if (this.isProfileMenuOpen) {
            this.chatService.toggleProfileMenu(false);
        }
    }
}
