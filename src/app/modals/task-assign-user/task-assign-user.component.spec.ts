import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAssignUserComponent } from './task-assign-user.component';

describe('TaskAssignUserComponent', () => {
  let component: TaskAssignUserComponent;
  let fixture: ComponentFixture<TaskAssignUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskAssignUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssignUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
