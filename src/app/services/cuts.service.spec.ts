import { TestBed } from '@angular/core/testing';

import { CutsService } from './cuts.service';

describe('CutsService', () => {
  let service: CutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CutsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
