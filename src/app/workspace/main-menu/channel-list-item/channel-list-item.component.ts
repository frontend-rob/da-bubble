import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-channel-list-item",
    imports: [CommonModule],
    templateUrl: "./channel-list-item.component.html",
    styleUrl: "./channel-list-item.component.scss",
})
export class ChannelListItemComponent {
    @Input() channel: any;
    @Input() active: boolean = false;
    @Output() activeMenuItem = new EventEmitter<number>();

    setActiveChat(id: number) {
        this.activeMenuItem.emit(id);
    }
}
