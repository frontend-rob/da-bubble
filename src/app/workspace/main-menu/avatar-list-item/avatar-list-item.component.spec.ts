import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarListItemComponent } from './avatar-list-item.component';

describe('AvatarListItemComponent', () => {
  let component: AvatarListItemComponent;
  let fixture: ComponentFixture<AvatarListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
