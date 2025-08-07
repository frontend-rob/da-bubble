import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {ChannelData} from '../../../interfaces/channel.interface';
import {UserData} from '../../../interfaces/user.interface';
import {ChannelUserPipe} from '../../../pipes/channel-user.pipe';
import {PresenceService, UserPresence} from '../../../services/presence.service';

@Component({
	selector: 'app-chat-members',
	standalone: true,
	imports: [CommonModule, FormsModule, NgOptimizedImage, ChannelUserPipe],
	templateUrl: './chat-members.component.html',
	styleUrls: ['./chat-members.component.scss']
})
export class ChatMembersComponent {
	@Input() selectedChannel!: ChannelData;
	@Input() currentUser!: UserData;
	@Input() screenWidth!: number;
	@Input() isMembersMenuOpen = false;
	@Input() isAddMemberModalOpen = false;
	@Input() isProfileCardOpen = false;
	@Input() selectedUsersToAdd: UserData[] = [];
	@Input() filteredUsers: UserData[] = [];
	@Input() searchText = '';
	@Input() disabledButton = true;

	@Output() openAddMemberModal = new EventEmitter<void>();
	@Output() closeModals = new EventEmitter<void>();
	@Output() profileCardToggle = new EventEmitter<{ show: boolean; user: UserData }>();
	@Output() userSelectionAdd = new EventEmitter<UserData>();
	@Output() userSelectionRemove = new EventEmitter<UserData>();
	@Output() searchInputChange = new EventEmitter<void>();
	@Output() addNewMember = new EventEmitter<void>();

	constructor(private presenceService: PresenceService) {
	}

	onOpenAddMemberModal(): void {
		this.openAddMemberModal.emit();
	}

	onCloseModals(): void {
		this.closeModals.emit();
	}

	onProfileCardToggle(show: boolean, user: UserData): void {
		this.profileCardToggle.emit({show, user});
	}

	onAddUserToSelection(user: UserData): void {
		this.userSelectionAdd.emit(user);
	}

	onRemoveUserFromSelection(user: UserData): void {
		this.userSelectionRemove.emit(user);
	}

	onSearchInputChange(): void {
		this.searchInputChange.emit();
	}

	onAddNewMember(): void {
		this.addNewMember.emit();
	}

	// Präsenz wirklich laden
	getMemberPresenceStatus(uid: string): Observable<UserPresence | null> {
		return this.presenceService.getUserPresence(uid);
	}
}
