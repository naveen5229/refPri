/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { CommonService } from './Service/common/common.service';

@Component({
  selector: 'ngx-app',
  templateUrl: '../app/app.component.html',
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService,
    public common:CommonService) {
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
  }
}
