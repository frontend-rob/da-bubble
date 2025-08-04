import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChannelData } from '../interfaces/channel.interface';

/**
 * Service for triggering channel events between different components of the application.
 * Uses an RxJS Subject implementation to provide an observable stream.
 */
@Injectable({
    providedIn: 'root'
})
export class FunctionTriggerService {
    private trigger = new Subject<ChannelData>();

    /**
     * Observable stream that can be subscribed to by components to be notified about channel selection events.
     */
    trigger$ = this.trigger.asObservable();

    /**
     * Triggers an event when a channel is selected and sends the channel data to all subscribers.
     * @param channel - The data of the selected channel.
     */
    callSelectChannel(channel: ChannelData): void {
        this.trigger.next(channel);
    }
}