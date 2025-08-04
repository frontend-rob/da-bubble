import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MentionInputComponent} from './mention-input.component';

describe('MentionInputComponent', () => {
	let component: MentionInputComponent;
	let fixture: ComponentFixture<MentionInputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MentionInputComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MentionInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
