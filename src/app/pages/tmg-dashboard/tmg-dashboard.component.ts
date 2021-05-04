import { Component, OnInit, Output } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-tmg-dashboard',
  templateUrl: './tmg-dashboard.component.html',
  styleUrls: ['./tmg-dashboard.component.scss']
})
export class TmgDashboardComponent  implements OnInit {
  seletionsArray = ['Tmg-Task','Tmg-worklog'];
  selectedDashboard = 'Tmg-Task';
  selectedDept = {id:null,name:null};
  departments = [];
  constructor(public api: ApiService,
    public common: CommonService) {
    this.getDepartments();
  }

  ngOnDestroy(){}

  ngOnInit() { }
  
  getIndex() {
    for (let i = 0; i <= this.seletionsArray.length; i++) {
      if (this.seletionsArray[i] == this.selectedDashboard) {
        return i;
      }
    }
  }
  
  forwardMove() {
    let index = this.getIndex();
    console.log("index", index);
    if (index == this.seletionsArray.length-1) {
      // this.selectedDashboard = this.seletionsArray[0];
      return;
    } else {
      this.selectedDashboard = this.seletionsArray[index + 1];
    }
  }
  
  backwardMove() {
    let index = this.getIndex();
    console.log("index", index);
    if (index == 0) {
      // this.selectedDashboard = this.seletionsArray[this.seletionsArray.length-1];
      return;
    } else {
      this.selectedDashboard = this.seletionsArray[index - 1];
    }
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList").subscribe(res => {
      this.common.loading--;
      if (res['code'] >= 0) {
      this.departments = res['data'] || [];
      // this.selectedDept = this.departments[0];
      } else{
        this.common.showError(res['msg']);
      };
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

}
