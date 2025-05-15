import { Component, NgModule, Pipe } from '@angular/core'; // OnInit, OnDestroy nicht mehr nötig
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, NgComponentOutlet, NgIf } from '@angular/common';
import { asyncScheduler } from 'rxjs';
// User und Subscription nicht mehr nötig

@Component({
  selector: 'app-workspace-header',
  imports: [
    AsyncPipe,
    NgIf
  ], // Imports müssen evtl. angepasst werden
  templateUrl: './workspace-header.component.html',
  styleUrl: './workspace-header.component.scss'
})
// OnInit, OnDestroy nicht mehr implementieren
export class WorkspaceHeaderComponent {

  // currentUser und userSubscription nicht mehr nötig

  constructor(public authService: AuthService) { } // AuthService muss public sein, damit es im Template zugreifbar ist

  // ngOnInit und ngOnDestroy nicht mehr nötig
}