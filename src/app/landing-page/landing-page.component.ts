import { Component } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ChatComponent } from './chat/chat.component';

@Component({
  selector: 'app-landing-page',
  imports: [MainMenuComponent, ChatComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {}
