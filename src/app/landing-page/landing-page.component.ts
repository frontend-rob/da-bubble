import { Component } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadComponent } from './thread/thread.component';
import { NewChannelComponent } from './new-channel/new-channel.component';

@Component({
  selector: 'app-landing-page',
  imports: [
    MainMenuComponent,
    ChatComponent,
    ThreadComponent,
    NewChannelComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {}
