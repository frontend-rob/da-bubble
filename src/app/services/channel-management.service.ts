import { Injectable } from '@angular/core';
import { ChannelData } from '../interfaces/channel.interface';
import { UserData } from '../interfaces/user.interface';

/**
 * Dienst zur Verwaltung von Kanalfunktionen wie Filterung, Kategorisierung und Validierung von Kanälen.
 * Bietet spezialisierte Funktionen für die Kanalverwaltung.
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelManagementService {
  constructor() {}

  /**
   * Filtert gültige Kanäle basierend auf definierten Validitätskriterien.
   *
   * @param {ChannelData[]} channels - Liste aller zu filternden Kanäle
   * @param {UserData} currentUser - Der aktuelle Benutzer
   * @return {ChannelData[]} Liste der gültigen Kanäle
   */
  filterValidChannels(channels: ChannelData[], currentUser: UserData): ChannelData[] {
    return channels.filter(channel => this.isValidChannel(channel, currentUser));
  }

  /**
   * Überprüft, ob ein Kanal gültig ist basierend auf verschiedenen Kriterien.
   *
   * @private
   * @param {ChannelData} channel - Der zu prüfende Kanal
   * @param {UserData} currentUser - Der aktuelle Benutzer
   * @return {boolean} True, wenn der Kanal gültig ist, sonst false
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
   * Prüft, ob ein Kanal die richtige Anzahl von Mitgliedern hat.
   *
   * @private
   * @param {ChannelData} channel - Der zu prüfende Kanal
   * @return {boolean} True, wenn der Kanal die richtige Anzahl von Mitgliedern hat
   */
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

  /**
   * Prüft, ob ein Kanal gültige Mitglieder-IDs hat.
   *
   * @private
   * @param {ChannelData} channel - Der zu prüfende Kanal
   * @return {boolean} True, wenn der Kanal gültige Mitglieder-IDs hat
   */
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

  /**
   * Prüft, ob der aktuelle Benutzer Mitglied des Kanals ist.
   *
   * @private
   * @param {ChannelData} channel - Der zu prüfende Kanal
   * @param {UserData} currentUser - Der aktuelle Benutzer
   * @return {boolean} True, wenn der aktuelle Benutzer Mitglied des Kanals ist
   */
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

  /**
   * Entfernt doppelte Kanäle basierend auf den Mitgliedern des Kanals.
   *
   * @param {ChannelData[]} channels - Liste aller zu filternden Kanäle
   * @return {ChannelData[]} Liste der eindeutigen Kanäle
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
   * Verarbeitet einen Kanal und fügt ihn zur Liste der eindeutigen Kanäle hinzu, wenn er noch nicht existiert.
   *
   * @private
   * @param {ChannelData} channel - Der zu verarbeitende Kanal
   * @param {ChannelData[]} uniqueChannels - Liste der eindeutigen Kanäle
   * @param {Set<string>} seenPairs - Set der bereits gesehenen Mitgliederpaare
   * @return {void} Kein Rückgabewert
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
   * Erstellt einen eindeutigen Schlüssel für einen Kanal basierend auf den Mitglieder-IDs.
   *
   * @private
   * @param {ChannelData} channel - Der Kanal, für den ein Schlüssel erstellt werden soll
   * @return {string} Ein eindeutiger Schlüssel für den Kanal
   */
  private createPairKey(channel: ChannelData): string {
    const member1Id = channel.channelMembers[0];
    const member2Id = channel.channelMembers[1];

    return [member1Id, member2Id].sort().join("|");
  }

  /**
   * Findet einen Kanal anhand seiner ID in verschiedenen Kanalsammlungen.
   *
   * @param {string} id - Die ID des gesuchten Kanals
   * @param {ChannelData[]} channels - Liste der regulären Kanäle
   * @param {ChannelData[]} directMessageChannels - Liste der Direktnachrichtenkanäle
   * @param {ChannelData | null} selfChannel - Der Selbstgesprächskanal, falls vorhanden
   * @return {ChannelData | null} Der gefundene Kanal oder null, wenn kein Kanal gefunden wurde
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
   * Überprüft, ob ein Kanal ein Selbstgesprächskanal ist (ein Benutzer chattet mit sich selbst).
   *
   * @param {ChannelData} channel - Der zu prüfende Kanal
   * @param {UserData} currentUser - Der aktuelle Benutzer
   * @return {boolean} True, wenn es sich um einen Selbstgesprächskanal handelt
   */
  isSelfChannel(channel: ChannelData, currentUser: UserData): boolean {
    return channel.channelMembers.length === 1 ||
      (channel.channelMembers.length === 2 &&
        channel.channelMembers.every(
          (uid) => uid === currentUser.uid
        ));
  }

  /**
   * Kategorisiert Kanäle in reguläre Kanäle, Direktnachrichten und Selbstgesprächskanäle.
   *
   * @param {ChannelData[]} channels - Liste aller zu kategorisierenden Kanäle
   * @param {UserData} currentUser - Der aktuelle Benutzer
   * @return {{ regularChannels: ChannelData[], directMessageChannels: ChannelData[], selfChannel: ChannelData | null }} 
   *         Die kategorisierten Kanäle
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
   * Findet Benutzer, mit denen noch kein Direktnachrichtenkanal existiert.
   *
   * @param {UserData[]} allUsers - Liste aller Benutzer
   * @param {ChannelData[]} directMessageChannels - Liste der existierenden Direktnachrichtenkanäle
   * @return {UserData[]} Liste der Benutzer, mit denen noch kein Direktnachrichtenkanal existiert
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
