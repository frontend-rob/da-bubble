import { TestBed } from '@angular/core/testing';

import { ChatManagementService } from './chat-management.service';

describe('ChatManagementService', () => {
  let service: ChatManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
