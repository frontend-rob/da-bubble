import {Pipe, PipeTransform} from '@angular/core';
import {Observable, of} from 'rxjs';
import {UserData} from '../interfaces/user.interface';
import {UserLookupService} from './user-lookup.service';

@Pipe({
	name: 'channelUser',
	standalone: true
})
export class ChannelUserPipe implements PipeTransform {
	constructor(private userLookupService: UserLookupService) {
	}

	transform(uid: string | null | undefined): Observable<UserData | undefined> {
		if (!uid) return of(undefined);
		return this.userLookupService.getUserById(uid);
	}
}

@Pipe({
	name: 'channelUsers',
	standalone: true
})
export class ChannelUsersPipe implements PipeTransform {
	constructor(private userLookupService: UserLookupService) {
	}

	transform(uids: string[] | null | undefined): Observable<UserData[]> {
		if (!uids || uids.length === 0) return of([]);
		return this.userLookupService.getUsersByIds(uids);
	}
}
