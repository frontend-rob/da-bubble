import {CommonModule} from "@angular/common";
import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {Subscription} from 'rxjs';
import {UserData} from '../../../interfaces/user.interface';
import {UserService} from '../../../services/user.service';
import {ChannelData} from '../../../interfaces/channel.interface';


@Component({
    selector: "app-channel-list-item",
    imports: [CommonModule],
    templateUrl: "./channel-list-item.component.html",
    styleUrl: "./channel-list-item.component.scss",
})
export class ChannelListItemComponent implements OnInit, OnDestroy {
    @Input() channel!: ChannelData;
    @Input() active: boolean = false;
    @Output() activeMenuItem = new EventEmitter<number>();

    currentUser$!: UserData;
    private userService: UserService = inject(UserService)
    private userSubscription!: Subscription;

    constructor() {
    }

    setActiveChat(id: number) {
        this.activeMenuItem.emit(id);

    }

    ngOnInit() {
        this.userSubscription = this.userService.currentUser$.subscribe(userData => {
            if (userData) {
                this.currentUser$ = userData;
                console.log(this.currentUser$);
            }
        });
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }
}
