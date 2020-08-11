import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStatusChangeComponent } from './task-status-change.component';

describe('TaskStatusChangeComponent', () => {
  let component: TaskStatusChangeComponent;
  let fixture: ComponentFixture<TaskStatusChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskStatusChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
