import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitManagementComponent } from './visit-management.component';

describe('VisitManagementComponent', () => {
  let component: VisitManagementComponent;
  let fixture: ComponentFixture<VisitManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
