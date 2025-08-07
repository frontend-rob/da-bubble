import {Injectable} from '@angular/core';
import {UserData} from '../interfaces/user.interface';

export interface MentionMatch {
  type: 'user' | 'channel' | 'everyone';
  text: string;
  startIndex: number;
  endIndex: number;
  data?: UserData | any;
}

@Injectable({
  providedIn: 'root'
})
export class MentionParserService {

  /**
   * Parses text for mentions (@user, #channel, @everyone)
   */
  parseMentions(text: string): MentionMatch[] {
    const mentions: MentionMatch[] = [];
    
    // Parse @mentions (users and @everyone)
    const userRegex = /@(\w+|everyone|anybody)/g;
    let userMatch;
    while ((userMatch = userRegex.exec(text)) !== null) {
      const mentionText = userMatch[1];
      mentions.push({
        type: mentionText === 'everyone' || mentionText === 'anybody' ? 'everyone' : 'user',
        text: mentionText,
        startIndex: userMatch.index,
        endIndex: userMatch.index + userMatch[0].length
      });
    }

    // Parse #channel mentions
    const channelRegex = /#(\w+)/g;
    let channelMatch;
    while ((channelMatch = channelRegex.exec(text)) !== null) {
      mentions.push({
        type: 'channel',
        text: channelMatch[1],
        startIndex: channelMatch.index,
        endIndex: channelMatch.index + channelMatch[0].length
      });
    }

    return mentions.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Highlights mentions in text with HTML
   */
  highlightMentions(text: string, mentions: MentionMatch[]): string {
    let highlightedText = text;
    let offset = 0;

    mentions.forEach(mention => {
      const startPos = mention.startIndex + offset;
      const endPos = mention.endIndex + offset;
      const originalText = highlightedText.substring(startPos, endPos);
      
      let highlightedMention = '';
      switch (mention.type) {
        case 'user':
          highlightedMention = `<span class="mention mention-user">${originalText}</span>`;
          break;
        case 'channel':
          highlightedMention = `<span class="mention mention-channel">${originalText}</span>`;
          break;
        case 'everyone':
          highlightedMention = `<span class="mention mention-everyone">${originalText}</span>`;
          break;
      }

      highlightedText = 
        highlightedText.substring(0, startPos) + 
        highlightedMention + 
        highlightedText.substring(endPos);
      
      offset += highlightedMention.length - originalText.length;
    });

    return highlightedText;
  }
}
