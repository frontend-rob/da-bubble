import {UserData} from "./user.interface";
import {Timestamp} from "firebase/firestore";

export interface Reaction {
	emoji: string;
	userId: string;
	userName: string;
	timestamp?: Timestamp;
}

export interface Message {
	text: string;
	sender: UserData;
	timestamp: Timestamp;
	time: string;
	date: string;
	reactions: Reaction[];
	edited: boolean;
	hasThread?: boolean;
	threadLastTime?: string;
	threadAnswerCount?: number;
}

export interface IdtMessages extends Message {
	messageId?: string;
}
