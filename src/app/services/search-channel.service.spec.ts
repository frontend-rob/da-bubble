import { TestBed } from '@angular/core/testing';

import { SearchChannelService } from './search-channel.service';

describe('SearchChannelService', () => {
  let service: SearchChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
