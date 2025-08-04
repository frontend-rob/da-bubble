import { Injectable } from "@angular/core";

/**
 * Helper service providing general utility methods for the entire application.
 * Offers functions for random number generation and time/date formatting.
 */
@Injectable({
    providedIn: "root",
})
export class HelperService {
    /**
     * Generates a random integer between the specified minimum and maximum values (inclusive).
     * @param min - The minimum value (default: 0).
     * @param max - The maximum value (default: 1000).
     * @returns A random integer between min and max (inclusive).
     */
    getRandomNumber(min: number = 0, max: number = 1000): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Returns the current time in 24-hour format (HH:MM).
     * @returns The current time as a string in HH:MM format.
     */
    getBerlinTime24h(): string {
        const berlinFormatter = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        return berlinFormatter.format(new Date());
    }

    /**
     * Returns the current date formatted with weekday and month (e.g., "Monday, 01 August").
     * @returns The formatted date as a string.
     */
    getBerlinDateFormatted(): string {
        const berlinDate = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "long",
        });

        return berlinDate.charAt(0).toUpperCase() + berlinDate.slice(1);
    }
}
