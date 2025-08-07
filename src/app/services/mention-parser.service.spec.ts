import {TestBed} from '@angular/core/testing';

import {MentionParserService} from './mention-parser.service';

describe('MentionParserService', () => {
  let service: MentionParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentionParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
