import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldIssueRequestComponent } from './field-issue-request.component';

describe('FieldIssueRequestComponent', () => {
  let component: FieldIssueRequestComponent;
  let fixture: ComponentFixture<FieldIssueRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldIssueRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldIssueRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
