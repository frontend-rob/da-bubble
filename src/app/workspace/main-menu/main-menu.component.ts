import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ChannelListItemComponent } from "./channel-list-item/channel-list-item.component";
import { DirectMessageListItemComponent } from "./direct-message-list-item/direct-message-list-item.component";

@Component({
    selector: "app-main-menu",
    imports: [
        CommonModule,
        ChannelListItemComponent,
        DirectMessageListItemComponent,
    ],
    templateUrl: "./main-menu.component.html",
    styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent {
    showChannelList = false;
    showUserList = false;
    isOpen = false;
    isModalOpen = false;
    activeMenuItem: number | null = null;
    activeUser: number | null = null;

    isOpenText = "Close workspace menu";
    isOpenImg = "./assets/img/workspaces_close_default.svg";
    isClosedText = "Open workspace menu";
    isClosedImg = "./assets/img/workspaces_open_default.svg";
    channels = [
        { name: "General", id: 100 },
        { name: "Random", id: 200 },
        { name: "Development", id: 300 },
        { name: "Design", id: 400 },
    ];
    chats = [
        {
            name: "John Doe",
            id: 1,
            img: "assets/img/avatar1.svg",
            status: "online",
        },
        {
            name: "Jane Smith",
            id: 2,
            img: "assets/img/avatar1.svg",
            status: "online",
        },
        {
            name: "Alice Johnson",
            id: 3,
            img: "assets/img/avatar1.svg",
            status: "offline",
        },
        {
            name: "Bob Brown",
            id: 4,
            img: "assets/img/avatar1.svg",
            status: "online",
        },
        {
            name: "Charlie Davis",
            id: 5,
            img: "assets/img/avatar1.svg",
            status: "offline",
        },
    ];

    toggleNav() {
        this.isOpen = !this.isOpen;
    }

    toggleChannelList() {
        this.showChannelList = !this.showChannelList;
    }

    toggleDirectMessageList() {
        this.showUserList = !this.showUserList;
    }

    setActiveChat(id: number) {
        this.activeMenuItem = id;
    }

    addNewChannel() {
        this.toggleModal();
        console.log("ADD NEW CHANNEL BTN CLICKED!");
    }

    toggleModal() {
        this.isModalOpen = !this.isModalOpen;
        console.log(this.isModalOpen);
    }
}
