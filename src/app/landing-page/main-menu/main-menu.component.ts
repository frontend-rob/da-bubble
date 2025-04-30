import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  imports: [CommonModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  showChannelList = true;
  showUserList = true;
  users:any;
  channels:any;

  newChannel() {
    // Logic to create a new channel
  }

  openChannelList() {
    // Logic to open the channel list
  }

  newMessages() {
    // Logic to open new messages
  }

  toggleNav() {

  }
}
