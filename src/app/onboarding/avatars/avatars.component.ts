import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../../services/user-data.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
    selector: 'app-avatars',
    imports: [
        CommonModule,
        NotificationsComponent
    ],
    templateUrl: './avatars.component.html',
    styleUrls: ['./avatars.component.scss']
})

export class AvatarsComponent {
    
    @ViewChild('notification') notificationComponent!: NotificationsComponent;

    /**
     * The currently selected avatar image path.
     */
    selectedUserAvatar: string = 'assets/img/avatars/av-00.svg';

    /**
     * The name of the user, retrieved from the UserDataService.
     */
    userName: string = '';

    /**
     * List of available avatar image paths.
     */
    avatarList: string[] = [
        'assets/img/avatars/av-01.svg',
        'assets/img/avatars/av-02.svg',
        'assets/img/avatars/av-03.svg',
        'assets/img/avatars/av-04.svg',
        'assets/img/avatars/av-05.svg',
        'assets/img/avatars/av-06.svg',
    ];

    /**
     * Status flag to enable or disable avatar selection.
     */
    status: boolean = true;

    /**
     * Constructor to inject the UserDataService.
     * @param userDataService - Service to manage user data.
     */
    constructor(private userDataService: UserDataService, private router: Router) { }

    /**
     * Lifecycle hook to initialize component data.
     * Retrieves user data from the UserDataService.
     */
    ngOnInit() {
        const userData = this.userDataService.getUserData();
        this.userName = userData.name;
        this.selectedUserAvatar = userData.avatar || 'assets/img/avatars/av-00.svg';
    }

    /**
     * Handles avatar selection by updating the selected avatar and storing it in the UserDataService.
     * @param path - The path of the selected avatar image.
     */
    selectedAvatar(path: string): void {
        if (this.status) {
            this.selectedUserAvatar = path;
            this.userDataService.setAvatar(path);
        }
    }

    /**
     * Returns the CSS classes for the selected avatar image.
     * @returns An object containing the CSS class mappings.
     */
    getAvatarClass(): { [key: string]: boolean } {
        return {
            'avatar-img': this.selectedUserAvatar !== 'assets/img/avatars/av-00.svg',
            'person-circle-img': this.selectedUserAvatar === 'assets/img/avatars/av-00.svg'
        };
    }

    /**
     * Handles the account creation process by logging the user data.
    */
    createAccount() {
        const userData = this.userDataService.getUserData();
        this.notificationComponent.showNotification('Account successfully created!');
        console.log('Account created with data:', userData);

        // Navigate and reset forms after notification is shown
        setTimeout(() => {
            this.userDataService.resetUserData();
            this.selectedUserAvatar = 'assets/img/avatars/av-00.svg';
            this.router.navigate(['']);
        }, 3000);
    }
    
    /**
     * Navigates back to the previous page in the browser history.
     */
    navigateBack() {
        window.history.back();
    }
}
