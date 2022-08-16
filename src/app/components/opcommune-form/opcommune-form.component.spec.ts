import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpcommuneFormComponent } from './opcommune-form.component';

describe('OpcommuneFormComponent', () => {
  let component: OpcommuneFormComponent;
  let fixture: ComponentFixture<OpcommuneFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpcommuneFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpcommuneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
