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
  isNetConnected = true;
  isShowFoAdmin = true;

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
      console.log("----------------", this.userLogin,this.userService.loggedInUser);
      this.getUserPresence();
      if (this.userService.loggedInUser) {
        this.getUserPagesList();
      }
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

    this.checkNetConnection();
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
      let loggedInBy = localStorage.getItem('ITRM_LOGGED_IN_BY');
      let apiCall = (loggedInBy == 'customer') ? 'FoAdmin/logout' : 'Login/logout';
      let params = {
        entrymode: "1",
        version: "1.1",
        authkey: this.userService._token
      }
      this.common.loading++;
      this.api.post(apiCall, params)
        .subscribe(res => {
          this.common.loading--;
          if (res['code']>0) {
            // this.userService._token = '';
            // this.userService._details = null;
            // localStorage.removeItem('ITRM_USER_TOKEN');
            // localStorage.removeItem('ITRM_USER_DETAILS');
            // localStorage.removeItem('ITRM_LOGGED_IN_BY');
            // localStorage.removeItem('ITRM_USER_PAGES');
            this.userService.reset();
            this.userService.clearStorage();
            this.common.showToast(res['msg']);
            if (loggedInBy == 'customer') {
              this.router.navigate(['/auth/login']);
            } else {
              this.router.navigate(['/auth/login/admin']);
            }
          }else{
            this.common.showError(res['msg']);
          }
        },err => {
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

  getUserPresence() {
    let empId = this.userService._details.id;
    this.common.loading++;
    this.api.get("Admin/getUserPresence.json?empId=" + empId).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let userPresence = (res['data'] && res['data'].length) ? res['data'] : null;
        this.userService._details['present'] = (userPresence) ? 1 : 0;
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }
  
  checkNetConnection(){
    let thisVar = this;
    setInterval(function () {
      // console.log("navigator online:", navigator.onLine);
      if (navigator.onLine) {
        if (!thisVar.isNetConnected) {
          thisVar.refresh();
        }
        thisVar.isNetConnected = true;
        // document.getElementById("noNetwork").style.display = "none";
      } else {
        thisVar.isNetConnected = false;
        // document.getElementById("noNetwork").style.display = "block";
      }
    }, 10000);
  }

  openFoAdminSearchModal(){
    document.getElementById("foadminSearchModal").style.display = "block";
  }

  closeFoadminSearchModal(){
    document.getElementById("foadminSearchModal").style.display = "none";
  }

  selectFoUser(fouser){
    if(fouser && fouser.foid>0){
      localStorage.setItem('FO_USER_DETAILS', JSON.stringify(fouser));
      this.userService._fouser = fouser;
      this.userService.loggedInUser = {id: fouser.id, name: fouser.name};
      this.closeFoadminSearchModal();
      if (this.userService._details) {
        this.getUserPagesList(1);
        this.getUserPresence();
      }
      this.common.refresh();
    }
  }

  gotoAdmin(){
    this.userService._fouser = null;
    this.userService.loggedInUser = {id: this.userService._details.id, name: this.userService._details.name};
    localStorage.removeItem('FO_USER_DETAILS');
    if (this.userService._details) {
      this.getUserPagesList(1);
      this.getUserPresence();
    }
    this.common.refresh();
  }

  getUserPagesList(type=0) {
    this.api.get('UserRole/getUserPages.json?adminId=' + this.userService.loggedInUser.id)
      .subscribe(res => {
        if(res['code']===1) {
          this.userService._pages = res['data'].filter(page => { return page._userid; });
          localStorage.setItem('ITRM_USER_PAGES', JSON.stringify(this.userService._pages));
          this.userService.filterMenu("pages", "pages");
          if(type==1){
            this.router.navigate(['/pages/task']);
          }
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.showError();
        console.log('Error: ', err);
      })
  }

}
