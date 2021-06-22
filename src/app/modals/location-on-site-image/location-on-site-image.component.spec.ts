import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationOnSiteImageComponent } from './location-on-site-image.component';

describe('LocationOnSiteImageComponent', () => {
  let component: LocationOnSiteImageComponent;
  let fixture: ComponentFixture<LocationOnSiteImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationOnSiteImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationOnSiteImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
