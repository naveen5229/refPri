import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskChainComponent } from './task-chain.component';

describe('TaskChainComponent', () => {
  let component: TaskChainComponent;
  let fixture: ComponentFixture<TaskChainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskChainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
