import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrEditComponent } from './view-or-edit.component';

describe('ViewOrEditComponent', () => {
  let component: ViewOrEditComponent;
  let fixture: ComponentFixture<ViewOrEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewOrEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
