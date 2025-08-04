import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {UserSearchService} from '../../../services/user-search.service';
import {MentionParserService} from '../../../services/mention-parser.service';
import {UserData} from '../../../interfaces/user.interface';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
	selector: 'app-mention-input',
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: './mention-input.component.html',
	styleUrls: ['./mention-input.component.scss']
})
export class MentionInputComponent {
	@ViewChild('textArea', {static: true}) textArea!: ElementRef<HTMLTextAreaElement>;
	@Output() messageSubmit = new EventEmitter<string>();
	@Input() placeholder: string = 'Schreibe eine Nachricht... (@user, #channel, @everyone)';

	inputText = '';
	showSuggestions = false;
	suggestions: UserData[] = [];
	selectedSuggestionIndex = 0;
	currentMentionStart = -1;
	currentMentionQuery = '';

	private searchSubject = new Subject<string>();

	constructor(
		private userSearchService: UserSearchService,
		private mentionParser: MentionParserService
	) {
		this.searchSubject.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			switchMap(query => this.userSearchService.searchUsers(query))
		).subscribe(users => {
			this.suggestions = users;
			this.showSuggestions = users.length > 0;
		});
	}

	onTextChange(event: Event): void {
		const target = event.target as HTMLTextAreaElement;
		const cursorPosition = target.selectionStart;

		const mentionMatch = this.findActiveMention(this.inputText, cursorPosition);

		if (mentionMatch) {
			this.currentMentionStart = mentionMatch.start;
			this.currentMentionQuery = mentionMatch.query;
			this.searchSubject.next(mentionMatch.query);
		} else {
			this.hideSuggestions();
		}
	}

	onKeyDown(event: KeyboardEvent): void {
		if (this.showSuggestions) {
			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault();
					this.selectedSuggestionIndex =
						Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1);
					break;
				case 'ArrowUp':
					event.preventDefault();
					this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, 0);
					break;
				case 'Enter':
					event.preventDefault();
					if (this.suggestions[this.selectedSuggestionIndex]) {
						this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
					}
					break;
				case 'Escape':
					this.hideSuggestions();
					break;
			}
		} else if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			this.submitMessage();
		}
	}

	selectSuggestion(user: UserData): void {
		const beforeMention = this.inputText.substring(0, this.currentMentionStart);
		const afterMention = this.inputText.substring(this.textArea.nativeElement.selectionStart);

		this.inputText = beforeMention + `@${user.userName} ` + afterMention;
		this.hideSuggestions();

		// Set cursor position after the mention
		setTimeout(() => {
			const newPosition = beforeMention.length + user.userName.length + 2;
			this.textArea.nativeElement.setSelectionRange(newPosition, newPosition);
			this.textArea.nativeElement.focus();
		});
	}

	private findActiveMention(text: string, cursorPosition: number): { start: number, query: string } | null {
		// Find @ or # before cursor
		let start = cursorPosition - 1;
		while (start >= 0 && text[start] !== '@' && text[start] !== '#' && text[start] !== ' ') {
			start--;
		}

		if (start >= 0 && (text[start] === '@' || text[start] === '#')) {
			const query = text.substring(start + 1, cursorPosition);
			if (!query.includes(' ')) {
				return {start, query};
			}
		}

		return null;
	}

	private hideSuggestions(): void {
		this.showSuggestions = false;
		this.suggestions = [];
		this.selectedSuggestionIndex = 0;
	}

	private submitMessage(): void {
		if (this.inputText.trim()) {
			this.messageSubmit.emit(this.inputText);
			this.inputText = '';
		}
	}
}
