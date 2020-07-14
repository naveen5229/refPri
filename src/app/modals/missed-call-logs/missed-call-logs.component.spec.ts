import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedCallLogsComponent } from './missed-call-logs.component';

describe('MissedCallLogsComponent', () => {
  let component: MissedCallLogsComponent;
  let fixture: ComponentFixture<MissedCallLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissedCallLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedCallLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
