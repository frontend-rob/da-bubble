import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from "./services/auth.service";

/**
 * Hauptkomponente der Anwendung, die als Einstiegspunkt dient.
 * Initialisiert grundlegende Dienste wie Authentifizierung und das Präsenzsystem.
 */

@Component({
	selector: 'app-root',
	imports: [
		RouterOutlet
	],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
	title = 'da-bubble';

	private authService = inject(AuthService);

	/**
	 * Initialisiert die Anwendung beim Start.
	 * Aktiviert den Authentifizierungsstatus-Listener und das Präsenzsystem für die Benutzer-Online-Status-Verfolgung.
	 */
	ngOnInit(): void {
		this.authService.initializeAuthStateListener();
		this.authService.initializePresenceSystem();
	}
}
