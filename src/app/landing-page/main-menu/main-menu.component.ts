import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChannelListItemComponent } from './channel-list-item/channel-list-item.component';
import { AvatarListItemComponent } from "./avatar-list-item/avatar-list-item.component";

@Component({
  selector: 'app-main-menu',
  imports: [CommonModule, ChannelListItemComponent, AvatarListItemComponent],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  showChannelList = false;
  showUserList = false;
  isOpen = false;
  avatars = [
    { name: 'John Doe', id: 1, img: 'assets/img/avatar1.svg', status: 'online' },
    { name: 'Jane Smith', id: 2, img: 'assets/img/avatar1.svg', status: 'online' },
    { name: 'Alice Johnson', id: 3, img: 'assets/img/avatar1.svg', status: 'offline' },
    { name: 'Bob Brown', id: 4, img: 'assets/img/avatar1.svg', status: 'online' },
    { name: 'Charlie Davis', id: 5, img: 'assets/img/avatar1.svg', status: 'offline' },
  ]
  isOpenText = "Close workspace menu";
  isOpenImg = "./assets/img/workspaces_close_default.svg";
  isClosedText = "Open workspace menu";
  isClosedImg = "./assets/img/workspaces_open_default.svg";
  activeChannel: number | null = null;
  activeUser: number | null = null;
  users = [
    { name: 'John Doe', id: 1, img: 'https://example.com/bob.jpg' },
    { name: 'Jane Smith', id: 2, img: 'https://example.com/bob.jpg' },
    { name: 'Alice Johnson', id: 3, img: 'https://example.com/bob.jpg' },
    { name: 'Bob Brown', id: 4, img: 'https://example.com/bob.jpg' },
  ];
  channels = [
    { name: 'General', id: 1 },
    { name: 'Random', id: 2 },
    { name: 'Development', id: 3 },
    { name: 'Design', id: 4 }
  ];

  newChannel() {

  }

  openChannelList() {
    this.showChannelList = !this.showChannelList;
  }

  toggleNav() {
    this.isOpen = !this.isOpen;
  }

  openUserList() {
    this.showUserList = !this.showUserList;
  }

 

  
}
