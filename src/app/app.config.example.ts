// noinspection JSUnusedGlobalSymbols

import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { getDatabase, provideDatabase } from "@angular/fire/database";

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideDatabase(() => getDatabase()),
		provideFirebaseApp(() =>
			initializeApp({
				apiKey: "AIzaSyDkc6ItRprGU8mg4l5GZ9N2ndupfgs9Yno",
				authDomain: "dabubble-406.firebaseapp.com",
				databaseURL:
					"https://dabubble-406-default-rtdb.europe-west1.firebasedatabase.app",
				projectId: "dabubble-406",
				storageBucket: "dabubble-406.firebasestorage.app",
				messagingSenderId: "453375760349",
				appId: "1:453375760349:web:5ed984adc99d16e1c20834",
			})
		),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideDatabase(() => getDatabase()),
	],
};
