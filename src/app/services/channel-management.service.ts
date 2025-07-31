import { Injectable } from '@angular/core';
import { ChannelData } from '../interfaces/channel.interface';
import { UserData } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ChannelManagementService {
  constructor() {}

  filterValidChannels(channels: ChannelData[], currentUser: UserData): ChannelData[] {
    return channels.filter(channel => this.isValidChannel(channel, currentUser));
  }

  private isValidChannel(channel: ChannelData, currentUser: UserData): boolean {
    if (!this.hasValidMemberCount(channel)) {
      return false;
    }

    if (!this.hasValidMemberIds(channel)) {
      return false;
    }

    if (!this.currentUserIsMember(channel, currentUser)) {
      return false;
    }

    return true;
  }

  private hasValidMemberCount(channel: ChannelData): boolean {
    if (!channel.channelMembers || channel.channelMembers.length !== 2) {
      console.warn(
        "Defekter Channel gefiltert (falsche Anzahl Members):",
        channel.channelId
      );
      return false;
    }
    return true;
  }

  private hasValidMemberIds(channel: ChannelData): boolean {
    const member1Id = channel.channelMembers[0];
    const member2Id = channel.channelMembers[1];

    if (!member1Id || !member2Id) {
      console.warn(
        "Defekter Channel gefiltert (undefined Member IDs):",
        channel.channelId
      );
      return false;
    }
    return true;
  }

  private currentUserIsMember(channel: ChannelData, currentUser: UserData): boolean {
    const currentUserInChannel = channel.channelMembers.includes(
      currentUser?.uid
    );

    if (!currentUserInChannel) {
      console.warn(
        "Channel gefiltert (Current User nicht Member):",
        channel.channelId
      );
      return false;
    }
    return true;
  }

  removeDuplicateChannels(channels: ChannelData[]): ChannelData[] {
    const uniqueChannels: ChannelData[] = [];
    const seenPairs = new Set<string>();

    for (const channel of channels) {
      this.processChannelForDuplicates(channel, uniqueChannels, seenPairs);
    }

    return uniqueChannels;
  }

  private processChannelForDuplicates(
    channel: ChannelData, 
    uniqueChannels: ChannelData[], 
    seenPairs: Set<string>
  ): void {
    const pairKey = this.createPairKey(channel);

    if (!seenPairs.has(pairKey)) {
      seenPairs.add(pairKey);
      uniqueChannels.push(channel);
    }
  }

  private createPairKey(channel: ChannelData): string {
    const member1Id = channel.channelMembers[0];
    const member2Id = channel.channelMembers[1];

    return [member1Id, member2Id].sort().join("|");
  }

  findChannelById(
    id: string, 
    channels: ChannelData[], 
    directMessageChannels: ChannelData[], 
    selfChannel: ChannelData | null
  ): ChannelData | null {
    return (
      channels.find((channel) => channel.channelId === id) ||
      directMessageChannels.find(
        (channel) => channel.channelId === id
      ) ||
      (selfChannel && selfChannel.channelId === id
        ? selfChannel
        : null) ||
      null
    );
  }

  isSelfChannel(channel: ChannelData, currentUser: UserData): boolean {
    return channel.channelMembers.length === 1 ||
      (channel.channelMembers.length === 2 &&
        channel.channelMembers.every(
          (uid) => uid === currentUser.uid
        ));
  }

  categorizeChannels(
    channels: ChannelData[], 
    currentUser: UserData
  ): { 
    regularChannels: ChannelData[], 
    directMessageChannels: ChannelData[], 
    selfChannel: ChannelData | null 
  } {
    const regularChannels: ChannelData[] = [];
    const directMessageChannels: ChannelData[] = [];
    let selfChannel: ChannelData | null = null;

    for (const channel of channels) {
      const isMember = channel.channelMembers?.includes(currentUser?.uid);

      if (isMember) {
        if (channel.channelType?.directMessage) {
          const isSelfChannel = this.isSelfChannel(channel, currentUser);

          if (isSelfChannel) {
            selfChannel = channel;
          } else {
            directMessageChannels.push(channel);
          }
        } else {
          regularChannels.push(channel);
        }
      }
    }

    return { regularChannels, directMessageChannels, selfChannel };
  }

  getAvailableUsersForNewDM(
    allUsers: UserData[], 
    directMessageChannels: ChannelData[]
  ): UserData[] {
    return allUsers.filter((user) => {
      const existingDM = directMessageChannels.find((dmChannel) => {
        return dmChannel.channelMembers.includes(user.uid);
      });

      return !existingDM;
    });
  }
}
