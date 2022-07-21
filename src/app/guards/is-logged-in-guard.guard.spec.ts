import { TestBed } from '@angular/core/testing';

import { IsLoggedInGuardGuard } from './is-logged-in-guard.guard';

describe('IsLoggedInGuardGuard', () => {
  let guard: IsLoggedInGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsLoggedInGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
