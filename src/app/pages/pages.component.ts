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
    public user: UserService) {
    console.log(user._menu);
  }

  ngAfterViewInit() {
    document.getElementsByTagName('nb-sidebar')[0]['onclick'] = event => {
      let srcElement = event.srcElement;
      if (srcElement.className === 'menu-title' && srcElement.tagName === 'SPAN') {
        this.jrxLogin(srcElement.parentElement.text);
      }
    }
  }

  jrxLogin(title: string) {
    if (title === 'Walle8') {
      let url = 'http://dev.elogist.in/walle8/#/auth/checkloginandredirect/?token=' + this.user._details.authkey_gisdb + '&frompage=' + window.location.href;
      // let url = 'http://localhost:4205//#/auth/checkloginandredirect/?token=' + this.user._details.authkey_gisdb + '&frompage=' + window.location.href;
      window.open(url, '_blank');
    }
  }
}
