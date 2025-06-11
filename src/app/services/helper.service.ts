import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class HelperService {
	getRandomNumber(min: number = 0, max: number = 1000): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getBerlinTime24h(): string {
		const berlinFormatter = new Intl.DateTimeFormat('de-DE', {
			timeZone: 'Europe/Berlin',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});

		return berlinFormatter.format(new Date());
	}

	getBerlinDateFormatted(): string {
		const berlinDate = new Date().toLocaleDateString('de-DE', {
			timeZone: 'Europe/Berlin',
			weekday: 'long',
			day: '2-digit',
			month: 'long'
		});

		return berlinDate.charAt(0).toUpperCase() + berlinDate.slice(1);
	}
}
