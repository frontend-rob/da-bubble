import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChannelComponent } from './new-channel.component';

describe('NewChannelComponent', () => {
  let component: NewChannelComponent;
  let fixture: ComponentFixture<NewChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
