import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitManagementDetailComponent } from './visit-management-detail.component';

describe('VisitManagementDetailComponent', () => {
  let component: VisitManagementDetailComponent;
  let fixture: ComponentFixture<VisitManagementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitManagementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitManagementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
