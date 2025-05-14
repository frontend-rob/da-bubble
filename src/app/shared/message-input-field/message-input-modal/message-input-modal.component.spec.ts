import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MessageInputModalComponent} from './message-input-modal.component';

describe('MessageInputModalComponent', () => {
    let component: MessageInputModalComponent;
    let fixture: ComponentFixture<MessageInputModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MessageInputModalComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(MessageInputModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
