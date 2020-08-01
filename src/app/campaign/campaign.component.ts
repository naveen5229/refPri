import { Component } from '@angular/core';

import { MENU_ITEMS } from './campaign-menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['campaign.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class CampaignComponent {

  menu = MENU_ITEMS;
}
