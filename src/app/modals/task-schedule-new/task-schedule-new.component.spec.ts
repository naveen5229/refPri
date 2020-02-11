import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskScheduleNewComponent } from './task-schedule-new.component';

describe('TaskScheduleNewComponent', () => {
  let component: TaskScheduleNewComponent;
  let fixture: ComponentFixture<TaskScheduleNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskScheduleNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskScheduleNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
