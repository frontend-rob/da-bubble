import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {ChannelData} from '../../../interfaces/channel.interface';
import {UserData} from '../../../interfaces/user.interface';
import {UserPresence} from '../../../services/presence.service';
import {ChannelUserPipe} from '../../../pipes/channel-user.pipe';

@Component({
	selector: 'app-chat-members',
	standalone: true,
	imports: [CommonModule, FormsModule, ChannelUserPipe, NgOptimizedImage],
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
	@Output() profileCardToggle = new EventEmitter<{ show: boolean, user: UserData }>();
	@Output() userSelectionAdd = new EventEmitter<UserData>();
	@Output() userSelectionRemove = new EventEmitter<UserData>();
	@Output() searchInputChange = new EventEmitter<void>();
	@Output() addNewMember = new EventEmitter<void>();
	@Output() memberPresenceRequest = new EventEmitter<string>();

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

	// Diese Methode sollte eine Observable zurückgeben, nicht einen EventEmitter verwenden
	getMemberPresenceStatus(uid: string): Observable<UserPresence | null> {
		// Hier sollte die tatsächliche Presence-Logic implementiert werden
		// Für jetzt geben wir ein leeres Observable zurück
		return of(null);
	}
}
