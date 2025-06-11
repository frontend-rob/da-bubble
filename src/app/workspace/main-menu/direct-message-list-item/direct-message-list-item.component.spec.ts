import {ComponentFixture, TestBed} from "@angular/core/testing";

import {DirectMessageListItemComponent} from "./direct-message-list-item.component";

describe("DirectMessageListItemComponent", () => {
	let component: DirectMessageListItemComponent;
	let fixture: ComponentFixture<DirectMessageListItemComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DirectMessageListItemComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DirectMessageListItemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
