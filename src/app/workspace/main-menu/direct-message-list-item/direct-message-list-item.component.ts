import {CommonModule} from "@angular/common";
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {UserData} from '../../../interfaces/user.interface';

@Component({
    selector: "app-direct-message-list-item",
    imports: [CommonModule],
    templateUrl: "./direct-message-list-item.component.html",
    styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent {
    @Input() chat!: UserData;
    @Input() active: boolean = false;
    @Output() activeMenuItem:EventEmitter<string> = new EventEmitter<string>();

    setActiveChat(id: string) {
        this.activeMenuItem.emit(id);
    }
}
