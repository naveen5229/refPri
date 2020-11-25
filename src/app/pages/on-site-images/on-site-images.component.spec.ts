import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSiteImagesComponent } from './on-site-images.component';

describe('OnSiteImagesComponent', () => {
  let component: OnSiteImagesComponent;
  let fixture: ComponentFixture<OnSiteImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnSiteImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnSiteImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
