import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallAdminReportComponent } from './call-admin-report.component';

describe('CallAdminReportComponent', () => {
  let component: CallAdminReportComponent;
  let fixture: ComponentFixture<CallAdminReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallAdminReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallAdminReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
