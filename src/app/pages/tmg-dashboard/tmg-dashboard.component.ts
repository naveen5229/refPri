import { LayoutService } from './../../@core/utils/layout.service';
import { NbSidebarService } from '@nebular/theme';
import { Component, OnInit, Output } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-tmg-dashboard',
  templateUrl: './tmg-dashboard.component.html',
  styleUrls: ['./tmg-dashboard.component.scss']
})
export class TmgDashboardComponent  implements OnInit {
  seletionsArray = ['Tmg-Task','Tmg-worklog','tmgProcess','tmgCallDashboard','tmgTicketDashboard','tmgMeetingDashboard','tmgVisitDashboard'];
  selectedDashboard = 'Tmg-Task';
  selectedDept = {id:null,name:'All'};
  selectedTicketProcess =  {id:null,name:'All'};
  departments = [];
  ticketProcesses = [];
  constructor(public api: ApiService,
    public common: CommonService,
    public sidebarService:NbSidebarService,
    public layoutService:LayoutService) {
    this.getDepartments();
    this.getTicketProcessList();
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
      this.getDepartments();
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
      this.getDepartments();
    }
  }

  getDepartments() {
    // this.sidebarService.collapse('menu-sidebar');
    // this.layoutService.changeLayoutSize();

    this.common.loading++;
    let url = "Admin/getDepartmentList";
    if(this.selectedDashboard == 'tmgProcess'){
      url = "Processes/getProcessList";
    }
    this.api.get(url).subscribe(res => {
      this.common.loading--;
      if (res['code'] >= 0) {
      this.departments = res['data'] || [];
      this.departments.splice(0,0,{_id:null,name:'All'});
      } else{
        this.common.showError(res['msg']);
      };
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  selectDepartment(department){
    console.log("department",department);
    this.selectedDept.id = department._id;
    this.selectedDept.name = department.name;
  }

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      if (res['code'] >= 0) {
        this.ticketProcesses = res['data'] || [];
        this.ticketProcesses.splice(0,0,{_id:null,name:'All'});
        } else{
          this.common.showError(res['msg']);
        };
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  selectTProcess(TProcess){
    console.log("TProcess",TProcess);
    this.selectedTicketProcess.id = TProcess._id;
    this.selectedTicketProcess.name = TProcess.name;
  }
}
