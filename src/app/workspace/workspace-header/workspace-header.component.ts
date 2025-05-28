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

@Component({
    selector: "app-workspace-header",
    imports: [CommonModule, ProfileCardComponent],
    templateUrl: "./workspace-header.component.html",
    styleUrl: "./workspace-header.component.scss",
})
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {
    @Input() openMenu!: boolean;
    @Output() toggleMenu = new EventEmitter<boolean>();

    isUserMenuOpen = false;
    isProfileCardOpen = false;
    currentUser!: UserData;
    userSubscription!: Subscription;
    private userService: UserService = inject(UserService);

    constructor(private router: Router, private authService: AuthService) {}

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

    openUserMenu() {
        this.isUserMenuOpen = true;
        this.toggleMenu.emit(true);

        if (!this.openMenu) {
            this.isProfileCardOpen = false;
        }
    }

    openProfileCard() {
        this.isProfileCardOpen = true;
    }

    logOut(): void {
        this.toggleMenu.emit(false);

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
