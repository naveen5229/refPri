import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldIssueComponent } from './field-issue.component';

describe('FieldIssueComponent', () => {
  let component: FieldIssueComponent;
  let fixture: ComponentFixture<FieldIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
