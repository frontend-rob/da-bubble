import {UserData} from './user.interface';
import {Timestamp} from 'firebase/firestore';

export interface Message {
    text: string;
    sender: UserData;
    timestamp: Timestamp;
    reactions?: any[];
}
