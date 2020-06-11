import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { NbMenuService } from '@nebular/theme';
import { UserService } from '../Service/user/user.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
    <nb-menu *ngIf="user._menu.pages.length"  [items]="user._menu.pages" autoCollapse="true"></nb-menu>
    <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  constructor(public menuService: NbMenuService,
    public user : UserService) {
console.log(user._menu);
}
  // menu = MENU_ITEMS;
}
