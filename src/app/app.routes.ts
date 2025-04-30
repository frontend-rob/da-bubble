import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['logon']);
const redirectLoggedInToWorkspace = () => redirectLoggedInTo(['workspace']);

export const routes: Routes = [
    {
        path: '',
        //component: MainComponent,
        //canActivate: [AuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin},
        children: [
            {
                //path: '',
                //component: 
            }
        ],
    },
    {
        path: 'logon',
        //component: LoginComponent,
        data: {authGuardPipe: redirectLoggedInToWorkspace},
        children: [
            {
                //path: '',
                //component: SignInComponent
            },
        ],
    },

];
