import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from "./services/auth.service";

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

	ngOnInit(): void {
		this.authService.initializeAuthStateListener();
		this.authService.initializePresenceSystem();
	}
}
