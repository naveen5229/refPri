import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskScheduledComponent } from './task-scheduled.component';

describe('TaskScheduledComponent', () => {
  let component: TaskScheduledComponent;
  let fixture: ComponentFixture<TaskScheduledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskScheduledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskScheduledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
