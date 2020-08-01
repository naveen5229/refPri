import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { CampaignRoutingModule } from './campaign-routing.module';
import { CampaignComponent } from './campaign.component';
import { ThemeModule } from '../@theme/theme.module';
import { NbMenuModule, NbCardModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { DirectiveModule } from '../directives/directives.module';
import { CampaignMasterPageComponent } from './campaign-master-page/campaign-master-page.component';
import { CampaignTargetComponent } from './campaign-target/campaign-target.component';
import { MycampaignComponent } from './mycampaign/mycampaign.component';
import { CampaignSummaryComponent } from './campaign-summary/campaign-summary.component';


const PAGES_COMPONENTS = [
  AddCampaignComponent,
  CampaignComponent,
  CampaignMasterPageComponent,
  CampaignTargetComponent,
  MycampaignComponent
];
@NgModule({
  declarations: [...PAGES_COMPONENTS, CampaignSummaryComponent],
  imports: [
    CommonModule,
    CampaignRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    FormsModule,
    DirectiveModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [...PAGES_COMPONENTS],
  providers: [],
  exports: [...PAGES_COMPONENTS]
})
export class CampaignModule { }
