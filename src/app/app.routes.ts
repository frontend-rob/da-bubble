import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { LogInComponent } from './onboarding/log-in/log-in.component';
import { SignUpComponent } from './onboarding/sign-up/sign-up.component';
import { AvatarsComponent } from './onboarding/avatars/avatars.component';
import { PasswordResetComponent } from './onboarding/password-reset/password-reset.component';
import { PasswordNewComponent } from './onboarding/password-new/password-new.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

const redirectUnauthorizedToOnBording = () => redirectUnauthorizedTo(['onboarding']);
const redirectLoggedInToLandingPage = () => redirectLoggedInTo(['workspace']);

export const routes: Routes = [
    {
        path: 'workspace',
        component: LandingPageComponent,
        //canActivate: [AuthGuard],
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
                path: 'avatars',
                component: AvatarsComponent
            },
            {
                path: 'reset-password',
                component: PasswordResetComponent
            },
            {
                path: 'change-password',
                component: PasswordNewComponent
            },
        ],
    },
    {
        path: 'legal-notice',
        component: LegalNoticeComponent,
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
    },

];
