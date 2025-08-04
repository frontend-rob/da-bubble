import { Injectable } from '@angular/core';
import { ChannelData } from '../interfaces/channel.interface';
import { UserData } from '../interfaces/user.interface';

/**
 * Service for managing channel operations such as filtering, categorizing, and validating channels.
 * Provides specialized functions for channel management.
 */
@Injectable({
    providedIn: 'root'
})
export class ChannelManagementService {
    
    constructor() { }

    /**
     * Filters valid channels based on defined validity criteria.
     *
     * @param channels - List of channels to filter.
     * @param currentUser - The current user.
     * @returns List of valid channels.
     */
    filterValidChannels(channels: ChannelData[], currentUser: UserData): ChannelData[] {
        return channels.filter(channel => this.isValidChannel(channel, currentUser));
    }

    /**
     * Checks if a channel is valid based on various criteria.
     *
     * @param channel - The channel to check.
     * @param currentUser - The current user.
     * @returns True if the channel is valid, otherwise false.
     */
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

    /**
     * Checks if a channel has the correct number of members.
     *
     * @param channel - The channel to check.
     * @returns True if the channel has the correct number of members.
     */
    private hasValidMemberCount(channel: ChannelData): boolean {
        if (!channel.channelMembers || channel.channelMembers.length !== 2) {
            console.warn(
                "Invalid channel filtered (incorrect number of members):",
                channel.channelId
            );
            return false;
        }
        return true;
    }

    /**
     * Checks if a channel has valid member IDs.
     *
     * @param channel - The channel to check.
     * @returns True if the channel has valid member IDs.
     */
    private hasValidMemberIds(channel: ChannelData): boolean {
        const member1Id = channel.channelMembers[0];
        const member2Id = channel.channelMembers[1];

        if (!member1Id || !member2Id) {
            console.warn(
                "Invalid channel filtered (undefined member IDs):",
                channel.channelId
            );
            return false;
        }
        return true;
    }

    /**
     * Checks if the current user is a member of the channel.
     *
     * @param channel - The channel to check.
     * @param currentUser - The current user.
     * @returns True if the current user is a member of the channel.
     */
    private currentUserIsMember(channel: ChannelData, currentUser: UserData): boolean {
        const currentUserInChannel = channel.channelMembers.includes(
            currentUser?.uid
        );

        if (!currentUserInChannel) {
            console.warn(
                "Channel filtered (current user not a member):",
                channel.channelId
            );
            return false;
        }
        return true;
    }

    /**
     * Removes duplicate channels based on channel members.
     *
     * @param channels - List of channels to filter.
     * @returns List of unique channels.
     */
    removeDuplicateChannels(channels: ChannelData[]): ChannelData[] {
        const uniqueChannels: ChannelData[] = [];
        const seenPairs = new Set<string>();

        for (const channel of channels) {
            this.processChannelForDuplicates(channel, uniqueChannels, seenPairs);
        }

        return uniqueChannels;
    }

    /**
     * Processes a channel and adds it to the list of unique channels if not already present.
     *
     * @param channel - The channel to process.
     * @param uniqueChannels - List of unique channels.
     * @param seenPairs - Set of already seen member pairs.
     */
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

    /**
     * Creates a unique key for a channel based on member IDs.
     *
     * @param channel - The channel for which to create a key.
     * @returns A unique key for the channel.
     */
    private createPairKey(channel: ChannelData): string {
        const member1Id = channel.channelMembers[0];
        const member2Id = channel.channelMembers[1];

        return [member1Id, member2Id].sort().join("|");
    }

    /**
     * Finds a channel by its ID in various channel collections.
     *
     * @param id - The ID of the channel to find.
     * @param channels - List of regular channels.
     * @param directMessageChannels - List of direct message channels.
     * @param selfChannel - The self-channel, if present.
     * @returns The found channel or null if not found.
     */
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

    /**
     * Checks if a channel is a self-channel (user chats with themselves).
     *
     * @param channel - The channel to check.
     * @param currentUser - The current user.
     * @returns True if it is a self-channel.
     */
    isSelfChannel(channel: ChannelData, currentUser: UserData): boolean {
        return channel.channelMembers.length === 1 ||
            (channel.channelMembers.length === 2 &&
                channel.channelMembers.every(
                    (uid) => uid === currentUser.uid
                ));
    }

    /**
     * Categorizes channels into regular channels, direct messages, and self-channels.
     *
     * @param channels - List of channels to categorize.
     * @param currentUser - The current user.
     * @returns An object containing categorized channels.
     */
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

    /**
     * Finds users with whom no direct message channel exists yet.
     *
     * @param allUsers - List of all users.
     * @param directMessageChannels - List of existing direct message channels.
     * @returns List of users without a direct message channel.
     */
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
