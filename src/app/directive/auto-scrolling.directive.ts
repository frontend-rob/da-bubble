import {AfterViewInit, Directive, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';

@Directive({
	selector: '[appAutoScroll]',
	standalone: true
})
export class AutoScrollingDirective implements AfterViewInit, OnChanges {
	@Input() trigger: any;

	constructor(private el: ElementRef) {
	}

	ngAfterViewInit(): void {
		this.scrollToBottom();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['trigger']) {
			setTimeout(() => this.scrollToBottom(), 0);
		}
	}

	private scrollToBottom(): void {
		try {
			const container = this.el.nativeElement;
			container.scrollTop = container.scrollHeight;
		} catch (err) {
			console.error('Scroll error:', err);
		}
	}
}
