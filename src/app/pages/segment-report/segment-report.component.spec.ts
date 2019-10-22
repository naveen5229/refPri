import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentReportComponent } from './segment-report.component';

describe('SegmentReportComponent', () => {
  let component: SegmentReportComponent;
  let fixture: ComponentFixture<SegmentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
