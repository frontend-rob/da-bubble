import { TestBed } from '@angular/core/testing';

import { SearchThreadService } from './search-thread.service';

describe('SearchThreadService', () => {
  let service: SearchThreadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchThreadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
