import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Component for displaying the application's legal notice.
 */
@Component({
    selector: 'app-legal-notice',
    imports: [RouterModule],
    templateUrl: './legal-notice.component.html',
    styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
    /** Navigates back to the previous page */
    navigateBack() { 
        window.history.back(); 
    }
}
