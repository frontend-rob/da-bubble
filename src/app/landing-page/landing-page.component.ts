import { Component } from '@angular/core';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ThreadComponent } from "./thread/thread.component";

@Component({
  selector: 'app-landing-page',
  imports: [MainMenuComponent, ThreadComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
