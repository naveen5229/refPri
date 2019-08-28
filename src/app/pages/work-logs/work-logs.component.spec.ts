import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkLogsComponent } from './work-logs.component';

describe('WorkLogsComponent', () => {
  let component: WorkLogsComponent;
  let fixture: ComponentFixture<WorkLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
