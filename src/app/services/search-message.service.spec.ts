import { TestBed } from '@angular/core/testing';

import { SearchMessageService } from './search-message.service';

describe('SearchMessageService', () => {
  let service: SearchMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
