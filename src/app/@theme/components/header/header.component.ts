import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { CommonService } from '../../../Service/common/common.service';


@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';
  userLogin = '';
  userMenu = [{ title: 'Profile' }, { title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    public router: Router,
    private api: ApiService,
    public userService: UserService,
    public common: CommonService,
    private breakpointService: NbMediaBreakpointsService) {
    if (this.userService._details == null) {
      this.router.navigate(['/auth/login']);
    }
    else {

      this.userLogin = this.userService._details.name || [];
      console.log("----------------", this.userLogin);
    }
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  logout() {
    if (confirm('Are you sure to logout?')) {
      let params = {
        entrymode: "1",
        version: "1.1",
        authkey: this.userService._token
      }
      this.common.loading++;
      this.api.post('Login/logout', params)
        .subscribe(res => {
          this.common.loading--;
          if (res['success']) {
            this.userService._token = '';
            this.userService._details = null;

            localStorage.removeItem('ITRM_USER_TOKEN');
            localStorage.removeItem('ITRM_USER_DETAILS');

            this.common.showToast(res['msg']);
            this.router.navigate(['/auth/login']);
          }
        },
          err => {
            this.common.loading--;
            this.common.showError();
          });
    }
  }
  refresh() {
    if (!this.common.refresh) {
      // this.router.navigateByUrl('/pages/dashboard');
      this.router.navigateByUrl('/pages/task');
      return;
    }
    this.common.refresh();
  }
}
