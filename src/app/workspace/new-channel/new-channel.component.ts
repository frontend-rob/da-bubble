import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
	selector: 'app-new-channel',
	templateUrl: './new-channel.component.html',
	styleUrls: ['./new-channel.component.scss'],
	imports: [FormsModule, CommonModule],
})
/**
 * Component for creating new channels with a multi-step wizard interface.
 * Allows users to set channel name, description, and access permissions.
 */
export class NewChannelComponent {
	@Input() showPopup = false;
	searchText = '';
	currentStep = 1;
	channelName = '';
	description = '';
	accessType = 'all';
	selectedUsers: any[] = [];
	users = [
		{id: 1, name: 'Max Mustermann', selected: false},
		{id: 2, name: 'Anna Schmidt', selected: false},
	];

	/**
	 * Determines if the channel is valid for creation based on access type and selected users.
	 * 
	 * @return {boolean} True if the channel can be created, false otherwise.
	 */
	isValidForCreation(): boolean {
		if (this.accessType === 'all') {
			return true;
		}
		return this.accessType === 'selected' && this.selectedUsers.length > 0;
	}

	/**
	 * Creates a new channel if it's valid for creation.
	 * Closes the popup after successful creation.
	 * 
	 * @return {void} This method does not return a value.
	 */
	createChannel() {
		if (!this.isValidForCreation()) {
			return;
		}

		this.closePopup();
	}

	/**
	 * Advances to the next step in the channel creation wizard.
	 * 
	 * @return {void} This method does not return a value.
	 */
	nextStep() {
		this.currentStep++;
	}

	/**
	 * Returns to the previous step in the channel creation wizard.
	 * 
	 * @return {void} This method does not return a value.
	 */
	previousStep() {
		this.currentStep--;
	}

	/**
	 * Closes the channel creation popup and resets the form.
	 * 
	 * @return {void} This method does not return a value.
	 */
	closePopup() {
		this.showPopup = false;
		this.resetForm();
	}

	/**
	 * Automatically adjusts the height of a textarea based on its content.
	 * 
	 * @param {any} event - The input event from the textarea.
	 * @return {void} This method does not return a value.
	 */
	autoGrow(event: any): void {
		const textarea = event.target;
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}

	/**
	 * Resets the form fields to their initial values.
	 * 
	 * @return {void} This method does not return a value.
	 */
	private resetForm() {
		this.currentStep = 1;
		this.channelName = '';
		this.description = '';
	}
}
