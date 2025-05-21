import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {ChannelData} from '../interfaces/channel.interface';

@Injectable({
    providedIn: 'root'
})
export class FunctionTriggerService {
    private trigger = new Subject<ChannelData>();
    trigger$ = this.trigger.asObservable();

    callSelectChannel(channel: ChannelData): void {
        this.trigger.next(channel);
    }
}
