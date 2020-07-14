import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTargetComponent } from './campaign-target.component';

describe('CampaignTargetComponent', () => {
  let component: CampaignTargetComponent;
  let fixture: ComponentFixture<CampaignTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
