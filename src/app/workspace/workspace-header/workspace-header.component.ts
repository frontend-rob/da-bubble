import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { UserData } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { ProfileCardComponent } from "../profile-card/profile-card.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { SearchCardComponent } from "./search-card/search-card.component";

@Component({
    selector: "app-workspace-header",
    imports: [CommonModule, ProfileCardComponent, SearchCardComponent],
    templateUrl: "./workspace-header.component.html",
    styleUrl: "./workspace-header.component.scss",
})
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {
    currentUser!: UserData;
    userSubscription!: Subscription;

    constructor(
        private router: Router,
        private authService: AuthService,
        private userService: UserService
    ) {}

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

    get isUserMenuOpen() {
        return this.userService.isUserMenuOpen;
    }

    get isUserProfileCardOpen() {
        return this.userService.isUserProfileCardOpen;
    }

    handleUserMenu(bool: boolean) {
        this.userService.handleUserMenu(bool);
    }

    handleUserProfileCard(bool: boolean) {
        this.userService.handleUserProfileCard(bool);
    }

    logOut(): void {
        // this.toggleMenu.emit(false);

        this.authService
            .logOut()
            .then(() => {
                this.router.navigate(["/"]);
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    }
}
