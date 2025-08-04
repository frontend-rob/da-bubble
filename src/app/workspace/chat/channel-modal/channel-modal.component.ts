import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChannelData} from '../../../interfaces/channel.interface';
import {UserData} from '../../../interfaces/user.interface';
import {Observable} from 'rxjs';
import {UserPresence} from '../../../services/presence.service';
import {ChannelUserPipe} from '../../../pipes/channel-user.pipe';

@Component({
	selector: 'app-channel-modal',
	standalone: true,
	imports: [CommonModule, FormsModule, ChannelUserPipe, NgOptimizedImage],
	templateUrl: './channel-modal.component.html',
	styleUrls: ['./channel-modal.component.scss']
})
export class ChannelModalComponent {
	@Input() selectedChannel!: ChannelData;
	@Input() currentUser!: UserData;
	@Input() isAddNewChannel = false;
	@Input() isNameEdit = false;
	@Input() isDescriptionEdit = false;
	@Input() newChannelName = '';
	@Input() newChannelDescription = '';
	@Input() screenWidth!: number;
	@Input() otherUserPresence$!: Observable<UserPresence | null>;

	@Output() closeModals = new EventEmitter<void>();
	@Output() toggleNameEdit = new EventEmitter<void>();
	@Output() toggleDescriptionEdit = new EventEmitter<void>();
	@Output() leaveChannel = new EventEmitter<void>();
	@Output() openAddMemberModal = new EventEmitter<void>();
	@Output() profileCardToggle = new EventEmitter<{ show: boolean, user: UserData }>();

	onCloseModals(): void {
		this.closeModals.emit();
		console.log(this.selectedChannel)

	}

	onToggleNameEdit(): void {
		this.toggleNameEdit.emit();
		console.log(this.selectedChannel)

	}

	onToggleDescriptionEdit(): void {
		this.toggleDescriptionEdit.emit();
		console.log(this.selectedChannel)

	}

	onLeaveChannel(): void {
		this.leaveChannel.emit();
		console.log(this.selectedChannel)

	}

	onOpenAddMemberModal(): void {
		this.openAddMemberModal.emit();
		console.log(this.selectedChannel)
	}

	onProfileCardToggle(show: boolean, user: UserData): void {
		this.profileCardToggle.emit({show, user});
		console.log(this.selectedChannel)

	}
}
