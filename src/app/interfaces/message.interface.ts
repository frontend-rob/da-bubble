import {Timestamp} from "firebase/firestore";

export interface Reaction {
	emoji: string;
	userId: string;
	userName: string;
	timestamp?: Timestamp;
}

export interface Message {
	text: string;
	uid: string;
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
