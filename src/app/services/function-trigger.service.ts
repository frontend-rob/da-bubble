import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {ChannelData} from '../interfaces/channel.interface';

/**
 * Dienst zum Auslösen von Kanalereignissen zwischen verschiedenen Komponenten der Anwendung.
 * Verwendet eine RxJS Subject-Implementation, um einen Observable-Stream bereitzustellen.
 */

@Injectable({
	providedIn: 'root'
})
export class FunctionTriggerService {
	private trigger = new Subject<ChannelData>();

	/**
	 * Observable-Stream, der von Komponenten abonniert werden kann, um über Kanalauswahlereignisse informiert zu werden.
	 */
	trigger$ = this.trigger.asObservable();

	/**
	 * Löst ein Ereignis aus, wenn ein Kanal ausgewählt wird, und sendet die Kanaldaten an alle Abonnenten.
	 *
	 * @param {ChannelData} channel - Die Daten des ausgewählten Kanals
	 * @return {void} Kein Rückgabewert
	 */
	callSelectChannel(channel: ChannelData): void {
		this.trigger.next(channel);
	}
}
