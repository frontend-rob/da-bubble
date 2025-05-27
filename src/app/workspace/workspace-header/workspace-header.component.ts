import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { UserData } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { ChatService } from "../../services/chat.service";

@Component({
    selector: "app-workspace-header",
    imports: [CommonModule],
    templateUrl: "./workspace-header.component.html",
    styleUrl: "./workspace-header.component.scss",
})
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {
    isMenuOpen = false;
    currentUser!: UserData;
    userSubscription!: Subscription;
    private userService: UserService = inject(UserService);

    constructor(public chatService: ChatService) {}

    ngOnInit() {
        this.userSubscription = this.userService.currentUser$.subscribe(
            (userData) => {
                if (userData) {
                    this.currentUser = userData;
                }
            }
        );
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    toggleMenu(bool: boolean) {
        this.isMenuOpen = bool;
    }

    toggleProfileMenu(bool: boolean) {
        this.chatService.toggleProfileMenu(bool);
    }
}
