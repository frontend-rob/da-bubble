import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageInputFieldComponent } from '../../shared/message-input-field/message-input-field.component';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, MessageInputFieldComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  hoverEmoji = false;
  hoverTag = false;
  overlayIsOpen = false;

  openOverlay() {
    const overlayBackground = document.getElementById('overlay-bg');
    this.overlayIsOpen = !this.overlayIsOpen;

    if (this.overlayIsOpen) {
      overlayBackground?.classList.add('overlay-bg');
    } else {
      overlayBackground?.classList.remove('overlay-bg');
    }
  }
}
