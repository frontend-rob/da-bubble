import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
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
    styleUrls: [
        './onboarding.component.scss',
        './log-in/log-in.component.scss',
        './sign-up/sign-up.component.scss',
        './avatars/avatars.component.scss',
        './password-reset/password-reset.component.scss',
        './password-new/password-new.component.scss',
    ],
    encapsulation: ViewEncapsulation.None,
})

export class OnboardingComponent implements OnInit, AfterViewInit {
    /**
     * Flag to control the visibility of the header CTA.
     */
    showHeaderCta: boolean = true;

    /**
     * Flag to control the visibility of the card footer.
     */
    showCardFooter: boolean = true;

    /**
     * Indicates whether the start animation has completed.
     */
    isAnimationComplete: boolean = false;

    /**
     * Indicates whether the animation text is hidden.
     */
    isTextHidden: boolean = true;

    /**
     * Initializes the OnboardingComponent with the Angular Router and ActivatedRoute.
     * @param route The ActivatedRoute service for accessing route information.
     * @param router The Router service for navigation and route changes.
     */
    constructor(private route: ActivatedRoute, private router: Router) { }

    /**
     * Updates the visibility of UI elements based on the current route.
     * Checks the current URL against a list of hidden routes and updates
     * the `showHeaderCta` and `showCardFooter` properties accordingly.
     */
    private updateVisibility(): void {
        const currentUrl = this.router.url;
        const hiddenRoutes = ['/signup', '/avatars', '/reset-password', '/change-password', '/legal-notice', '/privacy-policy'];
        this.showHeaderCta = !hiddenRoutes.some(route => currentUrl.includes(route));
        this.showCardFooter = !hiddenRoutes.some(route => currentUrl.includes(route));
    }

    /**
     * Handles the end of the logo animation by revealing the animation text
     * and applying animation effects to each letter.
     */
    onLogoAnimationEnd(): void {
        this.isTextHidden = false;
        const textElement = document.querySelector('.animation-text');
        if (textElement) {
            const letters = textElement.textContent?.split('') || [];
            textElement.textContent = '';
            letters.forEach((letter, index) => {
                const span = document.createElement('span');
                span.textContent = letter;
                span.style.animation = `split-text 500ms ease ${index * 50}ms forwards`;
                textElement.appendChild(span);
            });
        }
    }

    /**
     * Lifecycle hook that initializes the component.
     * Sets a timeout to mark the animation as complete and updates the visibility of UI elements.
     */
    ngOnInit(): void {
        setTimeout(() => {
            this.isAnimationComplete = true;
        }, 5000);
        this.updateVisibility();
    }

    /**
     * Lifecycle hook that runs after the component's view has been fully initialized.
     * Subscribes to router events to dynamically update the visibility of UI elements on route changes.
     */
    ngAfterViewInit(): void {
        this.router.events.subscribe(() => {
            this.updateVisibility();
        });
    }
}
