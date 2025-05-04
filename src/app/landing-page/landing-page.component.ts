import { Component } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { NewChannelComponent } from "./new-channel/new-channel.component";

@Component({
  selector: 'app-landing-page',
  imports: [MainMenuComponent, NewChannelComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
