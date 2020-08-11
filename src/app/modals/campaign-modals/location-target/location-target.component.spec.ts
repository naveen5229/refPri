import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationTargetComponent } from './location-target.component';

describe('LocationTargetComponent', () => {
  let component: LocationTargetComponent;
  let fixture: ComponentFixture<LocationTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
