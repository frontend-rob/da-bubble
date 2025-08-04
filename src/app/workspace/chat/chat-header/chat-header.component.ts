import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Observable} from 'rxjs';
import {ChannelData} from '../../../interfaces/channel.interface';
import {UserData} from '../../../interfaces/user.interface';
import {UserPresence} from '../../../services/presence.service';
import {ChannelUserPipe} from '../../../pipes/channel-user.pipe';

@Component({
	selector: 'app-chat-header',
	standalone: true,
	imports: [CommonModule, NgOptimizedImage, ChannelUserPipe],
	templateUrl: './chat-header.component.html',
	styleUrls: ['./chat-header.component.scss']
})
export class ChatHeaderComponent {
	@Input() selectedChannel!: ChannelData;
	@Input() otherUser$!: Observable<UserData | null>;
	@Input() otherUserPresence$!: Observable<UserPresence | null>;
	@Input() currentUser!: UserData;
	@Input() screenWidth!: number;

	@Output() openModal = new EventEmitter<void>();
	@Output() openMembersMenu = new EventEmitter<void>();
	@Output() openAddMemberModal = new EventEmitter<void>();
	@Output() profileCardToggle = new EventEmitter<{ show: boolean, user: UserData }>();

	onOpenModal(): void {
		this.openModal.emit();
	}

	onOpenMembersMenu(): void {
		this.openMembersMenu.emit();
	}

	onOpenAddMemberModal(): void {
		this.openAddMemberModal.emit();
	}

	onProfileCardToggle(show: boolean, user: UserData): void {
		this.profileCardToggle.emit({show, user});
	}
}
