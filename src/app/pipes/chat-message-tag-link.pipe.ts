import { Pipe, PipeTransform } from '@angular/core';
import { UserData } from '../interfaces/user.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe to convert @user tags in chat messages to clickable links.
 * User links include user UID and email as attributes and tooltip.
 * Uses DomSanitizer to safely render HTML.
 *
 * @example
 *   <span [innerHTML]="message.text | chatMessageTagLink:users"></span>
 */
@Pipe({
    name: 'chatMessageTagLink',
    standalone: true
})
export class chatMessageTagLink implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    /**
     * Escapes special regex characters in a string.
     * @param str The string to escape.
     * @returns The escaped string.
     */
    private escapeRegExp(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Transforms plain text with @user tags into HTML links.
     * Only exact matches from the user list are replaced.
     * @param text The message text to transform.
     * @param users The list of users to match @user tags against.
     * @returns SafeHtml with clickable links for user tags.
     */
    transform(text: string, users: UserData[] = []): SafeHtml {
        if (!text) return '';
        let result = text;
        // Sort usernames by length (desc) to match the longest possible name first
        const sortedUsers = [...users].sort((a, b) => b.userName.length - a.userName.length);
        for (const user of sortedUsers) {
            const search = `@${user.userName}`;
            const link = `<a class="user-tag-link" href="#" data-uid="${user.uid}" title="${user.userName} (${user.email || ''})">@${user.userName}</a>`;
            const regex = new RegExp(this.escapeRegExp(search) + '(?=\\b|\\s|[.,!?;:()\\[\\]{}]|$)', 'gi');
            result = result.replace(regex, link);
        }
        return this.sanitizer.bypassSecurityTrustHtml(result);
    }
}
