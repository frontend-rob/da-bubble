import {CommonModule} from "@angular/common";
import {Component, OnDestroy, OnInit} from "@angular/core";
import {ChannelListItemComponent} from "./channel-list-item/channel-list-item.component";
import {DirectMessageListItemComponent} from "./direct-message-list-item/direct-message-list-item.component";
import {Subscription} from 'rxjs';
import {ChatService} from '../../services/chat.service';
import {ChannelData} from '../../interfaces/channel.interface';

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
export class MainMenuComponent implements OnInit, OnDestroy {
    showChannelList = false;
    showUserList = false;
    isOpen = false;
    activeMenuItem: number | null = null;
    activeUser: number | null = null;

    isOpenText = "Close workspace menu";
    isOpenImg = "./assets/img/workspaces_close_default.svg";
    isClosedText = "Open workspace menu";
    isClosedImg = "./assets/img/workspaces_open_default.svg";

    channels: ChannelData[] = [];
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
    private channelsSubscription!: Subscription;

    constructor(private chatService: ChatService) {
    }

    ngOnInit(): void {
        this.loadChannels();
    }

    ngOnDestroy(): void {
        if (this.channelsSubscription) {
            this.channelsSubscription.unsubscribe();
        }
    }

    loadChannels(): void {
        this.channelsSubscription = this.chatService.getChannels().subscribe(
            (channelsData: ChannelData[]) => {
                // Transform the ChannelData to match the expected format in the template
                this.channels = channelsData.map(channel => ({
                    type: {
                        channel: channel.type.channel,
                        directMessage: channel.type.directMessage,
                        thread: channel.type.thread
                    },
                    channelId: channel.channelId,
                    channelName: channel.channelName,
                    channelDescription: channel.channelDescription,
                    createdBy: channel.createdBy,
                    channelMembers: channel.channelMembers,
                    createdAt: channel.createdAt,
                    updatedAt: channel.updatedAt
                }));
            },
            error => {
                console.error('Error loading channels:', error);
            }
        );
    }

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
        console.log("ADD NEW CHANNEL BTN CLICKED!");
    }
}
