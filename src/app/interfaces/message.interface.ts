import {UserData} from './user.interface';
import {Timestamp} from 'firebase/firestore';

export interface Message {
    text: string;
    sender: UserData;
    timestamp: Timestamp;
    time: string;
    date: string;
    reactions?: any[];
    hasThread?: boolean;
    threadLastTime?: string;
    threadAnswerCount?: number;
}


export interface IdtMessages extends Message {
    messageId?: string;
}

