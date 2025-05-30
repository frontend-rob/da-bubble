import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCardComponent } from './search-card.component';

describe('SearchCardComponent', () => {
  let component: SearchCardComponent;
  let fixture: ComponentFixture<SearchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
