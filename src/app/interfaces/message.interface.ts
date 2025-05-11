export interface Message {
    text: string;
    sender?: string;
    timestamp: number | Date;
    reactions?: any[];
}
