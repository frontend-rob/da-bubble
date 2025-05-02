import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { LogInComponent } from './onboarding/log-in/log-in.component';
import { SignUpComponent } from './onboarding/sign-up/sign-up.component';
import { PasswordResetComponent } from './onboarding/password-reset/password-reset.component';
import { AvatarsComponent } from './onboarding/avatars/avatars.component';

const redirectUnauthorizedToOnBording = () => redirectUnauthorizedTo(['onboarding']);
const redirectLoggedInToLandingPage = () => redirectLoggedInTo(['workspace']);

export const routes: Routes = [
    {
        path: 'workspace',
        component: LandingPageComponent,
        canActivate: [AuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToOnBording},
    },
    {
        path: '',
        component: OnboardingComponent,
        data: {authGuardPipe: redirectLoggedInToLandingPage},
        children: [
            {
                path: '',
                component: LogInComponent
            },
            {
                path: 'signup',
                component: SignUpComponent
            },
            {
                path: 'passwordreset',
                component: PasswordResetComponent
            },
            {
                path: 'avatars',
                component: AvatarsComponent
            },
        ],
    },

];
