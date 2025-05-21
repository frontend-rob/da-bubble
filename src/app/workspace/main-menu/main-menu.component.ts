import {CommonModule} from "@angular/common";
import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {ChannelListItemComponent} from "./channel-list-item/channel-list-item.component";
import {DirectMessageListItemComponent} from "./direct-message-list-item/direct-message-list-item.component";
import {ChannelData} from '../../interfaces/channel.interface';
import {ChatService} from '../../services/chat.service';
import {Subscription} from 'rxjs';
import {HelperService} from '../../services/helper.service';
import {Timestamp} from 'firebase/firestore';
import {FormsModule} from '@angular/forms';
import {UserData} from '../../interfaces/user.interface';
import {UserService} from '../../services/user.service';
import {FunctionTriggerService} from '../../services/function-trigger.service';

@Component({
    selector: "app-main-menu",
    imports: [
        CommonModule,
        ChannelListItemComponent,
        DirectMessageListItemComponent,
        FormsModule,
    ],
    templateUrl: "./main-menu.component.html",
    styleUrl: "./main-menu.component.scss",
})
export class MainMenuComponent implements OnInit, OnDestroy {
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
    currentUser$!: UserData;
    userSubscription!: Subscription;
    channelFormData = {
        name: '',
        description: ''
    }
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
    private helperService: HelperService = inject(HelperService);
    private userService: UserService = inject(UserService)
    private channelsSubscription!: Subscription;
    private functionTriggerService: FunctionTriggerService = inject(FunctionTriggerService);

    constructor(private chatService: ChatService) {
    }

    ngOnInit(): void {
        this.loadChannels();

        this.userSubscription = this.userService.currentUser$.subscribe(userData => {
            if (userData) {
                this.currentUser$ = userData;
            }
        });
    }

    ngOnDestroy(): void {
        if (this.channelsSubscription) {
            this.channelsSubscription.unsubscribe();
        }

        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
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
                this.setActiveChat(this.channels[0].channelId)
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
        this.channels.forEach(channel => {
            if (channel.channelId === id) {
                this.functionTriggerService.callSelectChannel(channel)
            }
        })
    }

    addNewChannel(name: string, description: string) {
        this.toggleModal();
        const defaultChannel: ChannelData = {
            channelId: this.helperService.getRandomNumber(),
            type: {
                channel: true,
                directMessage: false,
                thread: false
            },
            channelName: name,
            channelDescription: description,
            createdBy: this.currentUser$,
            channelMembers: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        this.chatService.createChannel(defaultChannel)
        console.log("ADD NEW CHANNEL BTN CLICKED!");
    }

    toggleModal() {
        this.isModalOpen = !this.isModalOpen;
    }

    toogleNewMessageHeader() {
        this.chatService.toggleNewMessageHeader(true);
    }
}
