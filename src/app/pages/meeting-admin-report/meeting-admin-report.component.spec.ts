import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingAdminReportComponent } from './meeting-admin-report.component';

describe('MeetingAdminReportComponent', () => {
  let component: MeetingAdminReportComponent;
  let fixture: ComponentFixture<MeetingAdminReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingAdminReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingAdminReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
