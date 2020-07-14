import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtManagementComponent } from './ot-management.component';

describe('OtManagementComponent', () => {
  let component: OtManagementComponent;
  let fixture: ComponentFixture<OtManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
