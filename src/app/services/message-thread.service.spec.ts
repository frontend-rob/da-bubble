import {TestBed} from '@angular/core/testing';

import {MessageThreadsService} from './message-thread.service';

describe('MessageThreadService', () => {
	let service: MessageThreadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
	  service = TestBed.inject(MessageThreadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
