import {Component, EnvironmentInjector, inject, OnInit, runInInjectionContext} from '@angular/core';
import {CommonModule} from '@angular/common';
import {doc, docData, Firestore} from '@angular/fire/firestore';
import {Observable, of, switchMap} from 'rxjs';
import {Auth, user} from '@angular/fire/auth';
import {UserData} from '../../interfaces/user.interface';

@Component({
    selector: 'app-workspace-header',
    imports: [
        CommonModule
    ],
    templateUrl: './workspace-header.component.html',
    styleUrl: './workspace-header.component.scss'
})
export class WorkspaceHeaderComponent implements OnInit {
    currentUser$: Observable<UserData | null>;
    private firestore: Firestore = inject(Firestore);
    private auth: Auth = inject(Auth);

    constructor(private environmentInjector: EnvironmentInjector) {
        this.currentUser$ = user(this.auth).pipe(
            switchMap(user => {
                if (!user) {
                    return of(null);
                }

                return runInInjectionContext(this.environmentInjector, () => {
                    const userDocRef = doc(this.firestore, `users/${user.uid}`);
                    return docData(userDocRef) as Observable<UserData>;
                });
            })
        );
    }

    ngOnInit() {
        this.currentUser$.subscribe(userData => {
            console.log('Current user data:', userData);
        });
    }
}
