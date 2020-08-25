import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDataTableComponent } from './form-data-table.component';

describe('FormDataTableComponent', () => {
  let component: FormDataTableComponent;
  let fixture: ComponentFixture<FormDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
