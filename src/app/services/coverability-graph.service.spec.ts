import { TestBed } from '@angular/core/testing';

import { CoverabilityGraphService } from './coverability-graph.service';

describe('CoverabilityGraphServiceService', () => {
    let service: CoverabilityGraphService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CoverabilityGraphService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
