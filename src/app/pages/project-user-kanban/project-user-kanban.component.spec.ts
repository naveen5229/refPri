import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUserKanbanComponent } from './project-user-kanban.component';

describe('ProjectUserKanbanComponent', () => {
  let component: ProjectUserKanbanComponent;
  let fixture: ComponentFixture<ProjectUserKanbanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectUserKanbanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUserKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
