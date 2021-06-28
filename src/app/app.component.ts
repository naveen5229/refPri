import { expenses } from './pages/expense-type/data';
import { from } from 'rxjs';
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
import { MessagingService } from './Service/messaging.service';

@Component({
  selector: 'ngx-app',
  templateUrl: '../app/app.component.html',
})
export class AppComponent implements OnInit {
  // @HostListener('contextmenu', ['$event'])
  // onRightClick(event) {
  //   console.log("contextmenu:",event,event.button);
  //   // event.preventDefault();
  // }
  // @HostListener('document:keydown', ['$event'])
  // handleKeyboardEvent(event) {
  //   this.keyHandler(event);
  // }
  title = 'push-notification';
  message;
  datatabledata:any[] = [];

  constructor(private analytics: AnalyticsService,
    public common: CommonService,
    public user: UserService,
    public api: ApiService,
    private messagingService: MessagingService
    ) {
    // if (this.user._details) {
    //   this.getUserPagesList();
    // }

  let date = Date.now();
  console.log('start time', date);
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.messagingService.requestPermission()
  this.messagingService.receiveMessage()
  this.message = this.messagingService.currentMessage
  }


getdatatabledata(){
let data = from(expenses);
data.subscribe((item:any)=>{
this.datatabledata = item;
})

}

  // getUserPagesList() {
  //   let userTypeId = this.user._loggedInBy == 'admin' ? 1 : 3;
  //   const params = {
  //     userId: this.user._details.id,
  //     userType: userTypeId
  //   };
  //   console.log(params);
  //   this.api.get('UserRole/getUserPages.json?adminId=' + this.user.loggedInUser.id)
  //     .subscribe(res => {
  //       if(res['code']===0) { this.common.showError(res['msg']); return false;};
  //       this.user._pages = res['data'].filter(page => { return page._userid; });
  //       localStorage.setItem('ITRM_USER_PAGES', JSON.stringify(this.user._pages));
  //       this.user.filterMenu("pages", "pages");
  //     }, err => {
  //       this.common.showError();
  //       console.log('Error: ', err);
  //     })
  // }

  // keyHandler(event) {
  //   if (event.keyCode == 123) {
  //     alert("This function has been disabled to prevent you from stealing my code 123!");
  //     // event.preventDefault();
  //     return false;
  //   } else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) {
  //     alert("This function has been disabled to prevent you from stealing my code 73!");
  //     // event.preventDefault();
  //     return false;
  //   } else if (event.ctrlKey && event.keyCode == 85) {
  //     alert("This function has been disabled to prevent you from stealing my code 85!");
  //     // event.preventDefault();
  //     return false;
  //   }
  // }
}
