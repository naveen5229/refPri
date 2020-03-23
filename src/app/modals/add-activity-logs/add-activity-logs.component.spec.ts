import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActivityLogsComponent } from './add-activity-logs.component';

describe('AddActivityLogsComponent', () => {
  let component: AddActivityLogsComponent;
  let fixture: ComponentFixture<AddActivityLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddActivityLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddActivityLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
