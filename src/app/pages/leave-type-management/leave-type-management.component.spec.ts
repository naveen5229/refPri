import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveTypeManagementComponent } from './leave-type-management.component';

describe('LeaveTypeManagementComponent', () => {
  let component: LeaveTypeManagementComponent;
  let fixture: ComponentFixture<LeaveTypeManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveTypeManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
