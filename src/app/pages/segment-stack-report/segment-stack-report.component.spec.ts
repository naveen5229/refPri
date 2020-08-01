import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentStackReportComponent } from './segment-stack-report.component';

describe('SegmentStackReportComponent', () => {
  let component: SegmentStackReportComponent;
  let fixture: ComponentFixture<SegmentStackReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SegmentStackReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentStackReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
