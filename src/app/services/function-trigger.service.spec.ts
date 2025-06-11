import {TestBed} from '@angular/core/testing';

import {FunctionTriggerService} from './function-trigger.service';

describe('FunctionTriggerService', () => {
	let service: FunctionTriggerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(FunctionTriggerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
