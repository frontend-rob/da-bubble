import {UserData} from './user.interface';
import {Timestamp} from 'firebase/firestore';

export interface ThreadInterface {
    text: string;
    sender: UserData;
    timestamp: Timestamp;
    time: string;
    date: string;
    reactions?: any[];
}
