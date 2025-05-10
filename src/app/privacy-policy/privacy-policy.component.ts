import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
    selector: 'app-privacy-policy',
    imports: [RouterModule],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
    /**
     * Navigates back to the previous page in the browser history.
     */
    navigateBack() {
        window.history.back();
    }
}
