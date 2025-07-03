import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Subscription } from "rxjs";
import { UserData } from "../../interfaces/user.interface";
import { UserService } from "../../services/user.service";
import { ProfileCardComponent } from "../profile-card/profile-card.component";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { SearchCardComponent } from "./search-card/search-card.component";
import { AvatarsComponent } from "../../onboarding/avatars/avatars.component";

@Component({
	selector: "app-workspace-header",
	imports: [
		CommonModule,
		ProfileCardComponent,
		SearchCardComponent,
		NgOptimizedImage,
		AvatarsComponent,
	],
	templateUrl: "./workspace-header.component.html",
	styleUrl: "./workspace-header.component.scss",
})
export class WorkspaceHeaderComponent implements OnInit, OnDestroy {
	currentPerson!: UserData;
	userSubscription!: Subscription;

	constructor(
		private router: Router,
		private authService: AuthService,
		private userService: UserService
	) {}

	get isUserMenuOpen() {
		return this.userService.isUserMenuOpen;
	}

	get isUserProfileCardOpen() {
		return this.userService.isUserProfileCardOpen;
	}

	get isUserAvatarEdit() {
		return this.userService.isUserAvatarEdit;
	}

	get isUserProfileEdit() {
		return this.userService.isUserProfileEdit;
	}

	ngOnInit() {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentPerson = userData;
				}
			}
		);
	}

	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
	}

	handleUserMenu(bool: boolean) {
		this.userService.handleUserMenu(bool);
	}

	handleUserProfileCard(bool: boolean) {
		this.userService.handleUserProfileCard(bool);
	}

	handleUserAvatarEdit(bool: boolean) {
		this.userService.handleUserAvatarEdit(bool);
	}

	handleUserProfileEdit(bool: boolean) {
		this.userService.handleUserProfileEdit(bool);
	}

	logOut(): void {
		this.authService
			.logOut()
			.then(() => {
				this.router.navigate(["/"]).then((r) => {
					console.log(r, "navigated to login");
				});
			})
			.catch((error) => {
				console.error("Logout failed:", error);
			});

		this.userService.handleUserMenu(false);
	}
}
