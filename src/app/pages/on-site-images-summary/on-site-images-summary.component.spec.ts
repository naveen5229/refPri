import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSiteImagesSummaryComponent } from './on-site-images-summary.component';

describe('OnSiteImagesSummaryComponent', () => {
  let component: OnSiteImagesSummaryComponent;
  let fixture: ComponentFixture<OnSiteImagesSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnSiteImagesSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnSiteImagesSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
