import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
	selector: 'app-new-message-header',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './new-message-header.component.html',
	styleUrls: ['./new-message-header.component.scss']
})
export class NewMessageHeaderComponent {
	@Input() newMessageInputData = '';

	@Output() inputDataChange = new EventEmitter<void>();
	@Output() keyDown = new EventEmitter<KeyboardEvent>();

	onInputDataChange(): void {
		this.inputDataChange.emit();
	}

	onKeyDown(event: KeyboardEvent): void {
		this.keyDown.emit(event);
	}
}
