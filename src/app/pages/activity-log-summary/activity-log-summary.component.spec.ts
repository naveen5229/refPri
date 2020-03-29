import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLogSummaryComponent } from './activity-log-summary.component';

describe('ActivityLogSummaryComponent', () => {
  let component: ActivityLogSummaryComponent;
  let fixture: ComponentFixture<ActivityLogSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityLogSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityLogSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
