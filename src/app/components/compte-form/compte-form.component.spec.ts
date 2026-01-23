import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteFormComponent } from './compte-form.component';

describe('CompteFormComponent', () => {
  let component: CompteFormComponent;
  let fixture: ComponentFixture<CompteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CompteFormComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(CompteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
