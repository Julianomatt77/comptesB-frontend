import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcommuneuserFormComponent } from './opcommuneuser-form.component';

describe('OpcommuneuserFormComponent', () => {
  let component: OpcommuneuserFormComponent;
  let fixture: ComponentFixture<OpcommuneuserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpcommuneuserFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpcommuneuserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
