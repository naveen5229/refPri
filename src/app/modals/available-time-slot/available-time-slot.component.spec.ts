import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableTimeSlotComponent } from './available-time-slot.component';

describe('AvailableTimeSlotComponent', () => {
  let component: AvailableTimeSlotComponent;
  let fixture: ComponentFixture<AvailableTimeSlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailableTimeSlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableTimeSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
