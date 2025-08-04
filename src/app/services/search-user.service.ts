import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { UserData } from '../interfaces/user.interface';
import { SearchResult } from '../interfaces/search-result.interface';
import { UserService } from './user.service';

/**
 * Service for searching users by term and mapping user data to search results.
 */
@Injectable({
    providedIn: 'root'
})
export class SearchUserService {
    constructor() { }

    /**
     * Searches for users matching the given term.
     * @param term The search term for users.
     * @param userService The user service providing all users.
     * @param getUserPresenceStatus Function to get the presence status of a user.
     * @returns A promise resolving to an array of user search results.
     */
    async searchUsers(
        term: string,
        userService: UserService,
        getUserPresenceStatus: (uid: string) => Promise<string | false>
    ): Promise<SearchResult[]> {
        try {
            const allUsers = await firstValueFrom(userService.allUsers$.pipe(take(1)));
            if (!allUsers) return [];
            return Promise.all(
                this.filterUsers(allUsers, term).map(async user => {
                    const status = await getUserPresenceStatus(user.uid);
                    return this.toUserSearchResult(user, status);
                })
            );
        } catch (error) {
            console.error('Error in searchUsers:', error);
            return [];
        }
    }

    /**
     * Filters users by the given term.
     * @param users Array of user data.
     * @param term The search term.
     * @returns Filtered array of users.
     */
    private filterUsers(users: UserData[], term: string): UserData[] {
        const lowerTerm = term.toLowerCase();
        return users.filter(u => !u.role?.guest && u.userName !== 'Guest' && (
            u.userName.toLowerCase().includes(lowerTerm) || (u.email?.toLowerCase().includes(lowerTerm) ?? false)
        ));
    }

    /**
     * Maps user data and presence status to a search result object.
     * @param user The user data.
     * @param status The user's presence status.
     * @returns The user search result object.
     */
    private toUserSearchResult(user: UserData, status: string | false): SearchResult {
        return {
            type: 'user',
            uid: user.uid,
            userName: user.userName,
            email: user.email || '',
            photoURL: user.photoURL || '',
            status: status || false,
            channelName: '',
            channelDescription: '',
        };
    }
}
