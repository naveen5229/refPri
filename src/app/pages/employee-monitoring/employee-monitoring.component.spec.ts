import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMonitoringComponent } from './employee-monitoring.component';

describe('EmployeeMonitoringComponent', () => {
  let component: EmployeeMonitoringComponent;
  let fixture: ComponentFixture<EmployeeMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
