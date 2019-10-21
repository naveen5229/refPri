import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklogsWithResUserComponent } from './worklogs-with-res-user.component';

describe('WorklogsWithResUserComponent', () => {
  let component: WorklogsWithResUserComponent;
  let fixture: ComponentFixture<WorklogsWithResUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorklogsWithResUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorklogsWithResUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
