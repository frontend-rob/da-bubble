import {UserData} from './user.interface';
import {Timestamp} from 'firebase/firestore';

export interface Message {
    text: string;
    sender: UserData;
    timestamp: Timestamp;
    time: string;
    date: string;
    reactions?: any[];
}

export interface ThreadMessages extends Message {
    threadMessages: Message[];
}

export interface IdtMessages extends Message {
    messageId?: string;
}
