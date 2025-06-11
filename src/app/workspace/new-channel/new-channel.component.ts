import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-new-channel',
    templateUrl: './new-channel.component.html',
    styleUrls: ['./new-channel.component.scss'],
    imports: [FormsModule, CommonModule],
})
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

    isValidForCreation(): boolean {
        if (this.accessType === 'all') {
            return true;
        }
        return this.accessType === 'selected' && this.selectedUsers.length > 0;
    }

    createChannel() {
        if (!this.isValidForCreation()) {
            return;
        }

        this.closePopup();
    }

    nextStep() {
        this.currentStep++;
    }

    previousStep() {
        this.currentStep--;
    }

    closePopup() {
        this.showPopup = false;
        this.resetForm();
    }

    autoGrow(event: any): void {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    private resetForm() {
        this.currentStep = 1;
        this.channelName = '';
        this.description = '';
    }
}
