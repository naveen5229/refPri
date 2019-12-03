import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStatusCheckComponent } from './task-status-check.component';

describe('TaskStatusCheckComponent', () => {
  let component: TaskStatusCheckComponent;
  let fixture: ComponentFixture<TaskStatusCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskStatusCheckComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskStatusCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
