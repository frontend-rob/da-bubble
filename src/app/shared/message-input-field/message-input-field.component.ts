import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-message-input-field',
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input-field.component.html',
  styleUrl: './message-input-field.component.scss',
})
export class MessageInputFieldComponent {
  @Input() placeholderText!: string;

  userTagModalIsOpen = false;
  emojiModalIsOpen = false;
  messageInputData = '';

  toggleEmojiModal() {
    if (!this.emojiModalIsOpen) {
      this.emojiModalIsOpen = true;
    } else {
      this.emojiModalIsOpen = false;
    }
  }

  toggleUserTagModal() {
    if (!this.userTagModalIsOpen) {
      this.userTagModalIsOpen = true;
      this.messageInputData = '@';
    } else {
      this.userTagModalIsOpen = false;
      this.messageInputData = '';
    }
  }
}
