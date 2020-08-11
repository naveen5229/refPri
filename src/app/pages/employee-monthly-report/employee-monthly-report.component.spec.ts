import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMonthlyReportComponent } from './employee-monthly-report.component';

describe('EmployeeMonthlyReportComponent', () => {
  let component: EmployeeMonthlyReportComponent;
  let fixture: ComponentFixture<EmployeeMonthlyReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeMonthlyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMonthlyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
