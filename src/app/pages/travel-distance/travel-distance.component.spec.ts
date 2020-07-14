import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelDistanceComponent } from './travel-distance.component';

describe('TravelDistanceComponent', () => {
  let component: TravelDistanceComponent;
  let fixture: ComponentFixture<TravelDistanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelDistanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelDistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
