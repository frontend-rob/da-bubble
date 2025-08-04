import { TestBed } from '@angular/core/testing';

import { SearchUserService } from './search-user.service';

describe('SearchUserService', () => {
  let service: SearchUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
