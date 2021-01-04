import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalulateTravelDistanceComponent } from './calulate-travel-distance.component';

describe('CalulateTravelDistanceComponent', () => {
  let component: CalulateTravelDistanceComponent;
  let fixture: ComponentFixture<CalulateTravelDistanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalulateTravelDistanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalulateTravelDistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
