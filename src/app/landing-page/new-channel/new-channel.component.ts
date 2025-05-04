import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
    { id: 1, name: 'Max Mustermann', selected: false },
    { id: 2, name: 'Anna Schmidt', selected: false },
    // Weitere Benutzer hier hinzufügen
  ];

  openPopup() {
    this.showPopup = true;
  }

  setAccessType(type: 'all' | 'selected') {
    this.accessType = type;
  }

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
    const selectedUsers = this.accessType === 'selected' ? this.users.filter(user => user.selected) : this.users;

    const channelData = {
      name: this.channelName, description: this.description, accessType: this.accessType, users: selectedUsers
    };

    console.log('Channel erstellt:', channelData);
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

  private resetForm() {
    this.currentStep = 1;
    this.channelName = '';
    this.description = '';
  }

  autoGrow(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}