import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceMonthlySummaryComponent } from './attendance-monthly-summary.component';

describe('AttendanceMonthlySummaryComponent', () => {
  let component: AttendanceMonthlySummaryComponent;
  let fixture: ComponentFixture<AttendanceMonthlySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceMonthlySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceMonthlySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
