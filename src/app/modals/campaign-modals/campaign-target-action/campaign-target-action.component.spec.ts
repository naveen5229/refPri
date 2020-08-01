import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTargetActionComponent } from './campaign-target-action.component';

describe('CampaignTargetActionComponent', () => {
  let component: CampaignTargetActionComponent;
  let fixture: ComponentFixture<CampaignTargetActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignTargetActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTargetActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
