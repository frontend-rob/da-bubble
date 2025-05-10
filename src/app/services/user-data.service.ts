/**
 * Service to manage user data across components.
 */
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UserDataService {
    /**
     * Stores user data including name, email, password, avatar, and policy agreement.
     */
    private userData: { name: string; email: string; password: string; avatar: string; policy: boolean } = {
        name: '',
        email: '',
        password: '',
        avatar: '',
        policy: false
    };

    /**
     * Updates the user data with the provided name, email, password, and policy agreement.
     * @param data - Object containing name, email, password, and policy.
     */
    setUserData(data: { name: string; email: string; password: string; policy: boolean }) {
        this.userData = {...this.userData, ...data};
    }

    /**
     * Updates the avatar in the user data.
     * @param avatar - The selected avatar name.
     */
    setAvatar(avatar: string) {
        this.userData.avatar = avatar;
    }

    /**
     * Retrieves the current user data.
     * @returns The user data object.
     */
    getUserData() {
        return this.userData;
    }

    /**
     * Resets the user data to its initial state.
     */
    resetUserData() {
        this.userData = {
            name: '',
            email: '',
            password: '',
            avatar: '',
            policy: false
        };
    }
}
