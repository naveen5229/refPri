import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetCampaignComponent } from './target-campaign.component';

describe('TargetCampaignComponent', () => {
  let component: TargetCampaignComponent;
  let fixture: ComponentFixture<TargetCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetCampaignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
