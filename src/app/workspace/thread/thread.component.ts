import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { MessageInputFieldComponent } from "../../shared/message-input-field/message-input-field.component";
import { ThreadService } from "../../services/thread.service";

@Component({
    selector: "app-thread",
    imports: [CommonModule, MessageInputFieldComponent],
    templateUrl: "./thread.component.html",
    styleUrl: "./thread.component.scss",
})
export class ThreadComponent {
    hoverEmoji = false;
    hoverTag = false;

    constructor(private threadService: ThreadService) {}

    toggleThread() {
        this.threadService.toggleThread(false);
    }
}
