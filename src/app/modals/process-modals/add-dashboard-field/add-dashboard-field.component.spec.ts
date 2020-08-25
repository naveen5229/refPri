import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDashboardFieldComponent } from './add-dashboard-field.component';

describe('AddDashboardFieldComponent', () => {
  let component: AddDashboardFieldComponent;
  let fixture: ComponentFixture<AddDashboardFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDashboardFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDashboardFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
