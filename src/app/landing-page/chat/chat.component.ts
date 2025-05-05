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
    this.overlayIsOpen = !this.overlayIsOpen;
  }
}
