import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-onboarding',
    imports: [
        RouterLink,
        RouterModule,
        CommonModule
    ],
    templateUrl: './onboarding.component.html',
    styleUrls: ['./onboarding.component.scss']
})

export class OnboardingComponent implements OnInit {
    /**
     * Determines whether the header CTA should be displayed.
     */
    showHeaderCta: boolean = true;

    /**
     * Determines whether the card footer should be displayed.
     */
    showCardFooter: boolean = true;

    /**
     * Initializes the OnboardingComponent with the Angular Router.
     * @param router The Angular Router used to detect route changes.
     */
    constructor(private router: Router) { }

    /**
     * Subscribes to router events to update the visibility of UI elements
     * based on the current route.
     */
    ngOnInit(): void {
        this.router.events.subscribe(() => {
            const currentUrl = this.router.url;
            this.showHeaderCta = !currentUrl.includes('/signup') && !currentUrl.includes('/avatars');
            this.showCardFooter = !currentUrl.includes('/signup') && !currentUrl.includes('/avatars');
        });
    }
}
