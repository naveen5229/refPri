import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePeriodReportComponent } from './employee-period-report.component';

describe('EmployeePeriodReportComponent', () => {
  let component: EmployeePeriodReportComponent;
  let fixture: ComponentFixture<EmployeePeriodReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeePeriodReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePeriodReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
