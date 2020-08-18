/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { CommonService } from './Service/common/common.service';
import { UserService } from './Service/user/user.service';
import { ApiService } from './Service/Api/api.service';

@Component({
  selector: 'ngx-app',
  templateUrl: '../app/app.component.html',
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService,
    public common: CommonService,
    public user: UserService,
    public api: ApiService) {
    if (this.user._details) {
      this.getUserPagesList();
    }
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
  }

  getUserPagesList() {
    let userTypeId = this.user._loggedInBy == 'admin' ? 1 : 3;
    const params = {
      userId: this.user._details.id,
      userType: userTypeId
    };
    console.log(params);
    this.api.get('UserRole/getUserPages.json?adminId=' + this.user._details.id)
      .subscribe(res => {
        console.log('res:', res);
        this.user._pages = res['data'].filter(page => { return page._userid; });
        localStorage.setItem('ITRM_USER_PAGES', JSON.stringify(this.user._pages));
        this.user.filterMenu("pages", "pages");
      }, err => {
        console.log('Error: ', err);
      })
  }
}
