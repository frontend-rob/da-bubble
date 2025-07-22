import {Component, OnDestroy, OnInit} from "@angular/core";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {Observable, of, Subscription} from "rxjs";
import {UserData} from "../../interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {ProfileCardComponent} from "../profile-card/profile-card.component";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {SearchCardComponent} from "./search-card/search-card.component";
import {AvatarsComponent} from "../../onboarding/avatars/avatars.component";
import {ChatService} from "../../services/chat.service";
import {WorkspaceService} from "../../services/workspace.service";
import {ResponsiveService} from "../../services/responsive.service";
import {PresenceService, UserPresence} from "../../services/PresenceManagementService";

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
	) {
	}

	get isChatResponsive() {
		return this.chatService.isChatResponsive;
	}

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

	getCurrentPersonPresence(): Observable<UserPresence | null> {
		if (this.currentPerson?.uid) {
			return this.presenceService.getUserPresence(this.currentPerson.uid);
		}
		return of(null);
	}

	ngOnInit() {
		this.userSubscription = this.userService.currentUser$.subscribe(
			(userData) => {
				if (userData) {
					this.currentPerson = userData;
				}
			}
		);

		this.isMainMenuOpenSubscription =
			this.workspaceService.isMainMenuOpen$.subscribe((val) => {
				this.isMainMenuOpen = val;
			});
		this.screenWidthSubscription =
			this.responsiveService.screenWidth$.subscribe((val) => {
				this.screenWidth = val;
			});
	}

	ngOnDestroy() {
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
		this.isMainMenuOpenSubscription.unsubscribe();
	}

	goBackToMenu() {
		this.workspaceService.setStatus(!this.isMainMenuOpen);
		this.chatService.handleChatResponsive(false);
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
					console.info(r, "navigated to login");
				});
			})
			.catch((error) => {
				console.error("Logout failed:", error);
			});

		this.userService.handleUserMenu(false);
	}
}
