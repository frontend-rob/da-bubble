import { Injectable } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { Message } from '../interfaces/message.interface';
import { ChannelData } from '../interfaces/channel.interface';
import { UserData } from '../interfaces/user.interface';

export interface MessageThread {
  id: string;
  channelId: string;
  channelName: string;
  channelType: 'channel' | 'directMessage';
  lastMessage: Message;
  unreadCount: number;
  participants: UserData[];
  lastActivity: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessageThreadsService {

  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  /**
   * Holt alle Message Threads für den aktuellen User
   */
  getAllMessageThreads(): Observable<MessageThread[]> {
    return combineLatest([
      this.chatService.getChannels(),
      this.userService.currentUser$
    ]).pipe(
      switchMap(([channels, currentUser]) => {
        if (!currentUser || !channels || channels.length === 0) {
          return of([]);
        }

        const filteredChannels = channels.filter(channel => 
          channel.channelMembers.includes(currentUser.uid)
        );

        if (filteredChannels.length === 0) {
          return of([]);
        }

        const threadObservables = filteredChannels.map(channel => 
          this.createMessageThread(channel, currentUser)
        );

        return threadObservables.length > 0 ? combineLatest(threadObservables) : of([]);
      }),
      map(threads => threads.filter(thread => thread !== null) as MessageThread[]),
      map(threads => this.sortThreadsByActivity(threads))
    );
  }

  /**
   * Erstellt einen Message Thread für einen Channel
   */
  private createMessageThread(
    channel: ChannelData,
    currentUser: UserData
  ): Observable<MessageThread | null> {
    return this.chatService.getMessages(channel.channelId.toString()).pipe(
      switchMap(async messages => {
        if (messages.length === 0) return null;

        const lastMessage = messages[messages.length - 1];
        return await this.buildMessageThread(channel, lastMessage, currentUser);
      })
    );
  }

  /**
   * Baut ein MessageThread Objekt
   */
  private async buildMessageThread(
    channel: ChannelData,
    lastMessage: Message,
    currentUser: UserData
  ): Promise<MessageThread> {
    const participants = await this.getChannelParticipants(channel);

    return {
      id: channel.channelId.toString(),
      channelId: channel.channelId.toString(),
      channelName: this.getThreadDisplayName(channel, participants, currentUser),
      channelType: channel.channelType?.channel ? 'channel' : 'directMessage',
      lastMessage,
      unreadCount: this.calculateUnreadCount(lastMessage, currentUser),
      participants,
      lastActivity: lastMessage.timestamp.toDate()
    };
  }

  /**
   * Holt die Teilnehmer eines Channels
   */
  private async getChannelParticipants(channel: ChannelData): Promise<UserData[]> {
    try {
      // Vereinfachte Version ohne getUserById
      const allUsers = await this.userService.allUsers$.pipe(take(1)).toPromise();
      
      if (!allUsers) return [];

      const participants = channel.channelMembers
        .map(memberId => allUsers.find(user => user.uid === memberId))
        .filter((p: UserData | undefined): p is UserData => p !== undefined);

      return participants;
    } catch (error) {
      console.error('Fehler beim Laden der Channel-Teilnehmer:', error);
      return [];
    }
  }

  /**
   * Bestimmt den Anzeigenamen für einen Thread
   */
  private getThreadDisplayName(
    channel: ChannelData,
    participants: UserData[],
    currentUser: UserData
  ): string {
    if (channel.channelType?.channel) {
      return channel.channelName;
    }

    // Direct Message
    const otherParticipants = participants.filter(p => p.uid !== currentUser.uid);

    if (otherParticipants.length === 0) {
      return `${currentUser.userName} (You)`;
    }

    if (otherParticipants.length === 1) {
      return otherParticipants[0].userName;
    }

    return otherParticipants.map(p => p.userName).join(', ');
  }

  /**
   * Berechnet ungelesene Nachrichten (vereinfacht)
   */
  private calculateUnreadCount(
    lastMessage: Message,
    currentUser: UserData
  ): number {
    return lastMessage.uid === currentUser.uid ? 0 : 1;
  }

  /**
   * Sortiert Threads nach letzter Aktivität
   */
  private sortThreadsByActivity(threads: MessageThread[]): MessageThread[] {
    return threads.sort((a, b) =>
      b.lastActivity.getTime() - a.lastActivity.getTime()
    );
  }

  /**
   * Erstellt einen neuen Thread basierend auf der Eingabe
   */
  async createNewThread(input: string, currentUser: UserData): Promise<void> {
    const parsedInput = this.parseNewMessageInput(input);

    try {
      if (parsedInput.type === 'channel') {
        await this.createOrFindChannelThread(parsedInput.value);
      } else if (parsedInput.type === 'email' || parsedInput.type === 'user') {
        await this.createDirectMessageThread(parsedInput.value, currentUser);
      } else if (parsedInput.type === 'everyone') {
        await this.createEveryoneThread();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Threads:', error);
    }
  }

  /**
   * Parst die New Message Eingabe
   */
  private parseNewMessageInput(input: string): {
    type: 'channel' | 'email' | 'user' | 'everyone';
    value: string;
  } {
    const trimmedInput = input.trim();

    if (trimmedInput.startsWith('#')) {
      return { type: 'channel', value: trimmedInput.substring(1) };
    }

    if (trimmedInput.startsWith('@')) {
      const mention = trimmedInput.substring(1);
      if (mention === 'everyone' || mention === 'anybody') {
        return { type: 'everyone', value: mention };
      }
      return { type: 'user', value: mention };
    }

    if (this.isValidEmail(trimmedInput)) {
      return { type: 'email', value: trimmedInput };
    }

    return { type: 'user', value: trimmedInput };
  }

  /**
   * Email-Validierung
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  /**
   * Erstellt oder findet einen Channel Thread
   */
  private async createOrFindChannelThread(channelName: string): Promise<void> {
    try {
      const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
      const existingChannel = channels?.find(channel => 
        channel.channelName.toLowerCase() === channelName.toLowerCase()
      );

      if (existingChannel) {
        this.chatService.setActiveChat(existingChannel.channelId.toString());
      } else {
        console.info(`Channel #${channelName} nicht gefunden`);
      }
    } catch (error) {
      console.error('Fehler beim Suchen des Channels:', error);
    }
  }

  /**
   * Erstellt einen Direct Message Thread
   */
  private async createDirectMessageThread(
    identifier: string,
    currentUser: UserData
  ): Promise<void> {
    try {
      const targetUser = await this.findUserByIdentifier(identifier);

      if (targetUser) {
        const existingDM = await this.findDirectMessageChannel(currentUser.uid, targetUser.uid);

        if (existingDM) {
          this.chatService.setActiveChat(existingDM.channelId.toString());
        } else {
          console.info(`Direct Message mit ${identifier} noch nicht implementiert`);
        }
      } else {
        console.info(`User ${identifier} nicht gefunden`);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Direct Message Threads:', error);
    }
  }

  /**
   * Findet einen Direct Message Channel zwischen zwei Usern
   */
  private async findDirectMessageChannel(uid1: string, uid2: string): Promise<ChannelData | null> {
    try {
      const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
      return channels?.find(channel => 
        channel.channelType?.directMessage &&
        channel.channelMembers.includes(uid1) &&
        channel.channelMembers.includes(uid2) &&
        channel.channelMembers.length === 2
      ) || null;
    } catch (error) {
      console.error('Fehler beim Suchen des DM Channels:', error);
      return null;
    }
  }

  /**
   * Findet User per E-Mail oder Username
   */
  private async findUserByIdentifier(identifier: string): Promise<UserData | null> {
    try {
      const allUsers = await this.userService.allUsers$.pipe(take(1)).toPromise();

      if (!allUsers) return null;

      return allUsers.find(user =>
        user.email.toLowerCase() === identifier.toLowerCase() ||
        user.userName.toLowerCase() === identifier.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Fehler beim Suchen des Users:', error);
      return null;
    }
  }

  /**
   * Erstellt einen Everyone/Anybody Thread (General Channel)
   */
  private async createEveryoneThread(): Promise<void> {
    try {
      const channels = await this.chatService.getChannels().pipe(take(1)).toPromise();
      const generalChannel = channels?.find(channel => 
        channel.channelName.toLowerCase() === 'general'
      );

      if (generalChannel) {
        this.chatService.setActiveChat(generalChannel.channelId.toString());
      } else {
        console.info('General Channel nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Suchen des General Channels:', error);
    }
  }
}
