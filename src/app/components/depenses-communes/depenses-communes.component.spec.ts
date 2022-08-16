import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepensesCommunesComponent } from './depenses-communes.component';

describe('DepensesCommunesComponent', () => {
  let component: DepensesCommunesComponent;
  let fixture: ComponentFixture<DepensesCommunesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepensesCommunesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepensesCommunesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
