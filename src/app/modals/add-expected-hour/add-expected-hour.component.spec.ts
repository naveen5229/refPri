import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpectedHourComponent } from './add-expected-hour.component';

describe('AddExpectedHourComponent', () => {
  let component: AddExpectedHourComponent;
  let fixture: ComponentFixture<AddExpectedHourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExpectedHourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExpectedHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
