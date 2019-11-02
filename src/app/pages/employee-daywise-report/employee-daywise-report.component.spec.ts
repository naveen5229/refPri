import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDaywiseReportComponent } from './employee-daywise-report.component';

describe('EmployeeDaywiseReportComponent', () => {
  let component: EmployeeDaywiseReportComponent;
  let fixture: ComponentFixture<EmployeeDaywiseReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeDaywiseReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDaywiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
