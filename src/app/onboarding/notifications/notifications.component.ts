import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-notifications',
    imports: [CommonModule],
    templateUrl: './notifications.component.html',
    styleUrl: './notifications.component.scss'
})

export class NotificationsComponent {
    /**
     * The message to display in the notification.
     */
    @Input() message: string = '';

    /**
     * Controls the visibility of the notification.
     */
    isVisible: boolean = false;

    /**
     * Displays the notification with the given message.
     * @param message - The message to display.
     */
    showNotification(message: string) {
        this.message = message;
        this.isVisible = true;
        setTimeout(() => this.isVisible = false, 3000);
    }
}
