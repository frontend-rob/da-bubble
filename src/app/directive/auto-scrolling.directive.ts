import { AfterViewInit, Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Directive for automatically scrolling an element to the bottom.
 * @example <div appAutoScroll [trigger]="someValue"></div>
 */
@Directive({
    selector: '[appAutoScroll]',
    standalone: true
})
export class AutoScrollingDirective implements AfterViewInit, OnChanges {
    /** Triggers auto-scroll when changed */
    @Input() trigger: any;

    constructor(private el: ElementRef) { }

    /** Scrolls to bottom after view init */
    ngAfterViewInit(): void { this.scrollToBottom(); }

    /** Scrolls to bottom when trigger changes */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['trigger']) setTimeout(() => this.scrollToBottom(), 0);
    }

    /** Scrolls the container to the bottom */
    private scrollToBottom(): void {
        try { this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight; }
        catch (err) { console.error('Scroll error:', err); }
    }
}
