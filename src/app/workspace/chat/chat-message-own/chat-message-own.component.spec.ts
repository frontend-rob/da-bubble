import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ChatMessageOwnComponent} from './chat-message-own.component';

describe('ChatMessageOwnComponent', () => {
    let component: ChatMessageOwnComponent;
    let fixture: ComponentFixture<ChatMessageOwnComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatMessageOwnComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChatMessageOwnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
