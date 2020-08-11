import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignUserMappingComponent } from './campaign-user-mapping.component';

describe('CampaignUserMappingComponent', () => {
  let component: CampaignUserMappingComponent;
  let fixture: ComponentFixture<CampaignUserMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignUserMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignUserMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
