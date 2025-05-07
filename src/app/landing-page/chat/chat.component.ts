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
  nameIsEdit = false;
  descriptionIsEdit = false;

  toggleOverlay() {
    this.overlayIsOpen = !this.overlayIsOpen;
    this.nameIsEdit = false;
    this.descriptionIsEdit = false;
  }

  toggleNameEdit() {
    this.nameIsEdit = !this.nameIsEdit;
  }

  toggleDescriptionEdit() {
    this.descriptionIsEdit = !this.descriptionIsEdit;
  }
}
