import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessageInputFieldComponent } from '../../shared/message-input-field/message-input-field.component';

@Component({
  selector: 'app-thread',
  imports: [CommonModule, MessageInputFieldComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  hoverEmoji = false;
  hoverTag = false;
}
