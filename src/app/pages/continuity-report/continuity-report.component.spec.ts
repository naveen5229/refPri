import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuityReportComponent } from './continuity-report.component';

describe('ContinuityReportComponent', () => {
  let component: ContinuityReportComponent;
  let fixture: ComponentFixture<ContinuityReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinuityReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinuityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
