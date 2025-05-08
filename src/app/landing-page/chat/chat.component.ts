import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageInputFieldComponent } from '../../shared/message-input-field/message-input-field.component';
import { ChatMessageComponent } from "./chat-message-other/chat-message.component";
import { ChatMessageOwnComponent } from "./chat-message-own/chat-message-own.component";

@Component({
  selector: 'app-chat',
  imports: [CommonModule, MessageInputFieldComponent, ChatMessageComponent, ChatMessageOwnComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  hoverEmoji = false;
  hoverTag = false;
  modalIsOpen = false;
  nameIsEdit = false;
  descriptionIsEdit = false;

  toggleModal() {
    this.modalIsOpen = !this.modalIsOpen;
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
