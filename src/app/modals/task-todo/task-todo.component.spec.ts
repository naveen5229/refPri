import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTodoComponent } from './task-todo.component';

describe('TaskTodoComponent', () => {
  let component: TaskTodoComponent;
  let fixture: ComponentFixture<TaskTodoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTodoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
