import { Component } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadComponent } from './thread/thread.component';
import { NewChannelComponent } from './new-channel/new-channel.component';
import { WorkspaceHeaderComponent } from "./workspace-header/workspace-header.component";

@Component({
    selector: 'app-workspace',
    imports: [
        MainMenuComponent,
        ChatComponent,
        ThreadComponent,
        NewChannelComponent,
        WorkspaceHeaderComponent
    ],
    templateUrl: './workspace.component.html',
    styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
}
