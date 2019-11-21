import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { CampaignRoutingModule } from './campaign-routing.module';
import { CampaignComponent } from './campaign.component';
import { ThemeModule } from '../@theme/theme.module';
import { NbMenuModule, NbCardModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { DirectiveModule } from '../directives/directives.module';

@NgModule({
  declarations: [AddCampaignComponent,
    CampaignComponent
  ],
  imports: [
    CommonModule,
    CampaignRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbCardModule,
    FormsModule,
    DirectiveModule,

  ]
})
export class CampaignModule { }
