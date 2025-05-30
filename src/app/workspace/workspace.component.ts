import { Component } from "@angular/core";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { ChatComponent } from "./chat/chat.component";
import { WorkspaceHeaderComponent } from "./workspace-header/workspace-header.component";
import { ThreadComponent } from "./thread/thread.component";
import { CommonModule } from "@angular/common";
import { ChatService } from "../services/chat.service";
import { ProfileCardComponent } from "./profile-card/profile-card.component";
import { SearchCardComponent } from "./workspace-header/search-card/search-card.component";

@Component({
    selector: "app-workspace",
    imports: [
    CommonModule,
    MainMenuComponent,
    ChatComponent,
    ThreadComponent,
    WorkspaceHeaderComponent,
    ThreadComponent,
    ProfileCardComponent
],
    templateUrl: "./workspace.component.html",
    styleUrls: ["./workspace.component.scss"],
    providers: [ChatService],
})
export class WorkspaceComponent {
    isProfileMenuOpen = false;

    constructor(public chatService: ChatService) {}

    get isThreadOpen() {
        return this.chatService.isThreadOpen;
    }

    get isProfileInfoOpen() {
        return this.chatService.isProfileInfoOpen;
    }

    toggleProfileInfo(bool: boolean) {
        this.chatService.toggleProfileInfo(bool);
    }

    handleProfileMenu(bool: boolean) {
        this.isProfileMenuOpen = bool;
    }

    close() {
        if (this.isProfileInfoOpen) {
            this.chatService.toggleProfileInfo(false);
        } else if (this.isProfileMenuOpen) {
            this.isProfileMenuOpen = false;
        }
    }
}
