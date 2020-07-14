import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPartnerReportComponent } from './daily-partner-report.component';

describe('DailyPartnerReportComponent', () => {
  let component: DailyPartnerReportComponent;
  let fixture: ComponentFixture<DailyPartnerReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyPartnerReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyPartnerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
