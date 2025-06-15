import { AutoScrollingDirective } from './auto-scrolling.directive';
import { ElementRef } from '@angular/core';

describe('AutoScrollingDirective', () => {
	it('should create an instance', () => {
		const mockElement = document.createElement('div');
		const elRef = new ElementRef(mockElement);
		const directive = new AutoScrollingDirective(elRef);
		expect(directive).toBeTruthy();
	});
});
