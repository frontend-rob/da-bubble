import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  imports: [CommonModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  showChannelList = false;
  showUserList = false;
  isOpen = false;
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

  openChannel(id: number) {
    this.activeChannel = id;
  }

  openUser(id: number) {
    this.activeUser = id;
  }
}
