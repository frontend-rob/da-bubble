import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

const redirectUnauthorizedToOnBording = () => redirectUnauthorizedTo(['signin']);
const redirectLoggedInToLandingPage = () => redirectLoggedInTo(['workspace']);

export const routes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
        canActivate: [AuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToOnBording},
        children: [
            {
                path: '',
                //component: 
            }
        ],
    },
    {
        path: 'signin',
        component: OnboardingComponent,
        data: {authGuardPipe: redirectLoggedInToLandingPage},
        children: [
            {
                //path: '',
                //component: SignInComponent
            },
        ],
    },

];
