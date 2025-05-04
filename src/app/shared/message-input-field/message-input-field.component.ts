import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message-input-field',
  imports: [],
  templateUrl: './message-input-field.component.html',
  styleUrl: './message-input-field.component.scss',
})
export class MessageInputFieldComponent {
  @Input() placeholderText!: string;
}
