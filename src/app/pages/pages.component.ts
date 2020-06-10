import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { UserService } from '../@core/mock/users.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" autoCollapse="true"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  // constructor(public user : UserService) {

  // }

  menu = MENU_ITEMS;
}
