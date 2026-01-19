import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecapComponent } from './recap.component';

describe('RecapComponent', () => {
  let component: RecapComponent;
  let fixture: ComponentFixture<RecapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RecapComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(RecapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
