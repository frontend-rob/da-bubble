import {Injectable} from "@angular/core";

/**
 * Hilfsdienst, der allgemeine Hilfsmethoden für die gesamte Anwendung bereitstellt.
 * Bietet Funktionen für Zufallszahlen und Zeitformatierung.
 */
@Injectable({
	providedIn: "root",
})
export class HelperService {
	/**
	 * Generiert eine zufällige Ganzzahl zwischen den angegebenen Minimal- und Maximalwerten.
	 *
	 * @param {number} min - Der Minimalwert (Standard: 0)
	 * @param {number} max - Der Maximalwert (Standard: 1000)
	 * @return {number} Eine zufällige Ganzzahl zwischen min und max (inklusive)
	 */
	getRandomNumber(min: number = 0, max: number = 1000): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Gibt die aktuelle Zeit im 24-Stunden-Format zurück.
	 *
	 * @return {string} Die aktuelle Zeit im Format HH:MM
	 */
	getBerlinTime24h(): string {
		const berlinFormatter = new Intl.DateTimeFormat("en-US", {
			// timeZone: "Europe/Berlin",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

		return berlinFormatter.format(new Date());
	}

	/**
	 * Gibt das aktuelle Datum formatiert mit Wochentag und Monat zurück.
	 *
	 * @return {string} Das formatierte Datum (z.B. "Monday, 01 August")
	 */
	getBerlinDateFormatted(): string {
		const berlinDate = new Date().toLocaleDateString("en-US", {
			// timeZone: "Europe/Berlin",
			weekday: "long",
			day: "2-digit",
			month: "long",
		});

		return berlinDate.charAt(0).toUpperCase() + berlinDate.slice(1);
	}
}
