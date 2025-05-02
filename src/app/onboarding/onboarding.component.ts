import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
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

export class OnboardingComponent implements OnInit, AfterViewInit {
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
    constructor(private route: ActivatedRoute, private router: Router) { }

    /**
     * Updates the visibility of UI elements based on the current route.
     * This method checks the current URL against a list of hidden routes and updates
     * the `showHeaderCta` and `showCardFooter` properties accordingly.
     */
    private updateVisibility(): void {
        const currentUrl = this.router.url;
        const hiddenRoutes = ['/signup', '/avatars', '/reset-password', '/change-password'];
        this.showHeaderCta = !hiddenRoutes.some(route => currentUrl.includes(route));
        this.showCardFooter = !hiddenRoutes.some(route => currentUrl.includes(route));
    }

    /**
     * Lifecycle hook that is called after Angular has initialized all data-bound properties.
     * This method initializes the visibility of UI elements based on the current route.
     */
    ngOnInit(): void {
        this.updateVisibility();
    }

    /**
     * Lifecycle hook that is called after Angular has fully initialized the component's view.
     * This method subscribes to router events to dynamically update the visibility of UI elements
     * when the route changes.
     */
    ngAfterViewInit(): void {
        this.router.events.subscribe(() => {
            this.updateVisibility();
        });
    }
}
