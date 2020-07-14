import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveFieldSupportRequestComponent } from './approve-field-support-request.component';

describe('ApproveFieldSupportRequestComponent', () => {
  let component: ApproveFieldSupportRequestComponent;
  let fixture: ComponentFixture<ApproveFieldSupportRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveFieldSupportRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveFieldSupportRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
