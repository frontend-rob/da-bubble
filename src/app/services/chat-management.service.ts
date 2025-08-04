import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { Timestamp } from "@angular/fire/firestore";
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { HelperService } from './helper.service';
import { UserLookupService } from './user-lookup.service';
import { PresenceService } from './presence.service';
import { ResponsiveService } from './responsive.service';
import { ChannelData } from '../interfaces/channel.interface';
import { UserData } from '../interfaces/user.interface';
import { Message } from '../interfaces/message.interface';
import { ChatComponent } from '../workspace/chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class ChatManagementService {
  private chatService = inject(ChatService);
  private userService = inject(UserService);
  private helperService = inject(HelperService);
  private userLookupService = inject(UserLookupService);
  private presenceService = inject(PresenceService);
  private responsiveService = inject(ResponsiveService);

  initializeChat(component: ChatComponent): void {
    this.setupUserSubscription(component);
    this.setupScreenWidthSubscription(component);
    this.initializeDirectMessageObservables(component);
  }

  private setupUserSubscription(component: ChatComponent): void {
    const subscription = this.userService.currentUser$.subscribe(userData => {
      if (userData) {
        component.currentUser = userData;
        this.initializeDirectMessageObservables(component);
      }
    });
    component['subscriptions'].push(subscription);
  }

  private setupScreenWidthSubscription(component: ChatComponent): void {
    const subscription = this.responsiveService.screenWidth$.subscribe(width => {
      component.screenWidth = width;
    });
    component['subscriptions'].push(subscription);
  }

  private initializeDirectMessageObservables(component: ChatComponent): void {
    component.otherUser$ = this.getOtherUserInDirectMessage(component.currentUser);
    component.otherUserPresence$ = component.otherUser$.pipe(
      switchMap(user => {
        if (user?.uid) {
          return this.presenceService.getUserPresence(user.uid);
        }
        return of(null);
      })
    );
  }

  private getOtherUserInDirectMessage(currentUser: UserData): Observable<UserData | null> {
    const selectedChannel = this.chatService.selectedChannel;

    if (!selectedChannel?.channelType?.directMessage) {
      return of(null);
    }

    const otherUserId = selectedChannel.channelMembers.find(
      member => member !== currentUser.uid
    );

    if (otherUserId) {
      return this.userLookupService.getUserById(otherUserId)
        .pipe(map(user => user || null));
    }

    return of(null);
  }

  toggleNameEdit(component: ChatComponent): void {
    if (component.isNameEdit && this.chatService.selectedChannel) {
      const updatedChannel = {
        ...this.chatService.selectedChannel,
        channelName: component.newChannelName,
        updatedAt: Timestamp.now(),
      };
      this.updateChannel(updatedChannel);
    }
    component.isNameEdit = !component.isNameEdit;
  }

  toggleDescriptionEdit(component: ChatComponent): void {
    if (component.isDescriptionEdit && this.chatService.selectedChannel) {
      const updatedChannel = {
        ...this.chatService.selectedChannel,
        channelDescription: component.newChannelDescription,
        updatedAt: Timestamp.now(),
      };
      this.updateChannel(updatedChannel);
    }
    component.isDescriptionEdit = !component.isDescriptionEdit;
  }

  async sendChatMessage(content: string, currentUser: UserData): Promise<void> {
    if (!this.chatService.selectedChannel || !content.trim()) {
      return;
    }

    const message: Message = {
      text: content,
      uid: currentUser.uid,
      edited: false,
      timestamp: Timestamp.fromDate(new Date()),
      time: this.helperService.getBerlinTime24h(),
      date: this.helperService.getBerlinDateFormatted(),
      reactions: [],
    };

    try {
      await this.chatService.sendMessage(
        this.chatService.selectedChannel.channelId.toString(),
        message
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  leaveChannel(): void {
    // Implementation for leaving channel
    console.info('Leaving channel...');
  }

  private async updateChannel(channel: ChannelData): Promise<void> {
    try {
      // Implementation for updating channel
      console.info('Updating channel:', channel);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  }
}
