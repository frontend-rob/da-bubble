import { Pipe, PipeTransform, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserData } from '../interfaces/user.interface';
import { UserLookupService } from '../services/user-lookup.service';

@Pipe({
  name: 'userDataFromUid',
  standalone: true,
  pure: false // Impure pipe to handle async data
})
export class UserDataFromUidPipe implements PipeTransform {
  private userLookupService = inject(UserLookupService);

  /**
   * Transforms a user ID (uid) into a UserData object by fetching it from Firestore
   * @param uid The user ID to transform
   * @returns An Observable of UserData or undefined if not found
   */
  transform(uid: string): Observable<UserData | undefined> {
    if (!uid) {
      return new Observable<undefined>(subscriber => {
        subscriber.next(undefined);
        subscriber.complete();
      });
    }

    return this.userLookupService.getUserById(uid);
  }
}
