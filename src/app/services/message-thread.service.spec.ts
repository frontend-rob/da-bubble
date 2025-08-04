import { TestBed } from '@angular/core/testing';

import { MessageThreadService } from './message-thread.service';

describe('MessageThreadService', () => {
  let service: MessageThreadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageThreadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
