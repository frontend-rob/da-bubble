import {CommonModule} from "@angular/common";
import {Component} from "@angular/core";
import {ChatService} from "../../services/chat.service";

@Component({
    selector: "app-profile-card",
    imports: [CommonModule],
    templateUrl: "./profile-card.component.html",
    styleUrl: "./profile-card.component.scss",
})
export class ProfileCardComponent {
    constructor(public chatService: ChatService) {
    }

    get isProfileInfoOpen() {
        return this.chatService.isProfileInfoOpen;
    }

    toggleProfileInfo(bool: boolean) {
        this.chatService.toggleProfileInfo(bool);
    }
}
