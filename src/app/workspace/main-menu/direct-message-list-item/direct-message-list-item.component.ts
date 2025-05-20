import {CommonModule} from "@angular/common";
import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
    selector: "app-direct-message-list-item",
    imports: [CommonModule],
    templateUrl: "./direct-message-list-item.component.html",
    styleUrl: "./direct-message-list-item.component.scss",
})
export class DirectMessageListItemComponent {
    @Input() chat: any;
    @Input() active: boolean = false;
    @Output() activeMenuItem = new EventEmitter<number>();

    setActiveChat(id: number) {
        this.activeMenuItem.emit(id);
    }
}
