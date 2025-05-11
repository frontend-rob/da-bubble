import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatOptionBarComponent } from './chat-option-bar.component';

describe('ChatOptionBarComponent', () => {
  let component: ChatOptionBarComponent;
  let fixture: ComponentFixture<ChatOptionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatOptionBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatOptionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
