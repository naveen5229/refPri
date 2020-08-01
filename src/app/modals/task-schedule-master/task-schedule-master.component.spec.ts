import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskScheduleMasterComponent } from './task-schedule-master.component';

describe('TaskScheduleMasterComponent', () => {
  let component: TaskScheduleMasterComponent;
  let fixture: ComponentFixture<TaskScheduleMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskScheduleMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskScheduleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
