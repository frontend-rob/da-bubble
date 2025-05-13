import { Component } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadComponent } from './thread/thread.component';
import { NewChannelComponent } from './new-channel/new-channel.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-workspace',
    imports: [
        MainMenuComponent,
        ChatComponent,
        // ThreadComponent,
        NewChannelComponent,
    ],
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent {

    constructor(private authService: AuthService, private router: Router) { }

    logOut(): void {
        this.authService.logOut()
            .then(() => {
                this.router.navigate(['/']);
            })
            .catch((error) => {
                console.error('Logout failed:', error);
            });
    }
}
