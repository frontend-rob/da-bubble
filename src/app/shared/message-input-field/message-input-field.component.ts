import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

      if (this.messageInputData.endsWith('@')) {
        this.messageInputData = this.messageInputData.slice(0, -1);
      }

      console.log(this.messageInputData);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === '@') {
      this.toggleUserTagModal();
    } else if (event.key === '#') {
      this.toggleUserTagModal();
    } else if (event.key === 'Escape' && this.userTagModalIsOpen) {
      this.toggleUserTagModal();
    }
  }
}
