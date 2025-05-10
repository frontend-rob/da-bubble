import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-avatar-list-item',
    imports: [CommonModule],
    templateUrl: './avatar-list-item.component.html',
    styleUrl: './avatar-list-item.component.scss',
})
export class AvatarListItemComponent {
    @Input() avatar: any;
    activeAvatar: number | null = null;

    openUser(id: number) {
        this.activeAvatar = id;
    }
}
