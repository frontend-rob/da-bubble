import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
        projectId: "dabubble-826b4",
        appId: "1:943978163562:web:50493f4ae483fefde6c913",
        databaseURL: "https://dabubble-826b4-default-rtdb.europe-west1.firebasedatabase.app",
        storageBucket: "dabubble-826b4.firebasestorage.app",
        apiKey: "AIzaSyAOcV3fihl-DAYMVXSbkxHq2E5djll5mfs",
        authDomain: "dabubble-826b4.firebaseapp.com",
        messagingSenderId: "943978163562"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()
    )]
};
