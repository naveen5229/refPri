import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignMasterPageComponent } from './campaign-master-page.component';

describe('CampaignMasterPageComponent', () => {
  let component: CampaignMasterPageComponent;
  let fixture: ComponentFixture<CampaignMasterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignMasterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignMasterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
