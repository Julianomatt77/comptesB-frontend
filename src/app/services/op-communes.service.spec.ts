import { TestBed } from '@angular/core/testing';

import { OpCommunesService } from './op-communes.service';

describe('OpCommunesService', () => {
  let service: OpCommunesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpCommunesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
