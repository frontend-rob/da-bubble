import { Component } from "@angular/core";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { ChatComponent } from "./chat/chat.component";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { WorkspaceHeaderComponent } from "./workspace-header/workspace-header.component";
import { ThreadComponent } from "./thread/thread.component";
import { CommonModule } from "@angular/common";
import { ThreadService } from "../services/thread.service";

@Component({
    selector: "app-workspace",
    imports: [
        CommonModule,
        MainMenuComponent,
        ChatComponent,
        ThreadComponent,
        WorkspaceHeaderComponent,
        ThreadComponent,
    ],
    templateUrl: "./workspace.component.html",
    styleUrls: ["./workspace.component.scss"],
    providers: [ThreadService],
})
export class WorkspaceComponent {
    constructor(
        private authService: AuthService,
        private router: Router,
        public threadService: ThreadService
    ) {}

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

    get isThreadOpen() {
        return this.threadService.isThreadOpen;
    }
}
