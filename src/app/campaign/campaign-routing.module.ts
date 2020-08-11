import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { CampaignComponent } from './campaign.component';

const routes: Routes = [{
    path: '',
    component: CampaignComponent,
    children: [
        {
            path: 'add-campaign',
            component: AddCampaignComponent,
        },

    ],
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CampaignRoutingModule {
}
