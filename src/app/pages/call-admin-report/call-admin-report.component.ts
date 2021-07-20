import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-call-admin-report',
  templateUrl: './call-admin-report.component.html',
  styleUrls: ['./call-admin-report.component.scss']
})
export class CallAdminReportComponent implements OnInit {

  endTime = new Date();
  startTime = new Date();
  activeTab = 'current'
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  departments = [];
  allUsers = [];
  admin = { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name };
  selectedDept = {
    id: null,
    name: ""
  };

  callAdminList = [];
  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public userService: UserService) {
    this.startTime.setDate(this.startTime.getDate() - 16)
    this.startTime.setHours(0);
    this.startTime.setMinutes(0);
    this.startTime.setSeconds(0);
    this.endTime.setDate(this.endTime.getDate() - 1)
    this.endTime.setHours(23);
    this.endTime.setMinutes(59);
    this.endTime.setSeconds(59);
  
    this.common.refresh = this.refresh.bind(this);
    this.getDepartments();
    this.getAllAdmin();
    this.getData();
    }

   

  ngOnInit() {
  }

  refresh() {
    this.getDepartments();
    this.getAllAdmin();
    this.getData();
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList")
      .subscribe(res => {
        this.common.loading--;
        this.departments = [];
        this.departments.push({ "id": null, "name": "All Departments" });
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        if (res['data'] && res['data'].length > 0) {
          for (let i = 0; i < res['data'].length; i++) {
            this.departments.push({ "id": res['data'][i]["id"], "name": res['data'][i]["name"] });
          }
        }
        // this.departments = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getAllAdmin() {
    let apiName = "Admin/getAllAdmin.json";
    console.log("this.userService._details['isSuperUser']====",this.userService._details['isSuperUser']);
    if(this.userService._details['isSuperUser']){
      this.allUsers = [{
        "id": null,
        "name": "All",
        "mobileno": null,
        "department_name": null
      }];
    }else{
      this.allUsers = [{
        "id": this.userService.loggedInUser.id,
        "name": this.userService.loggedInUser.name,
        "mobileno": null,
        "department_name": null
      }];
      this.allUsers.push({
        "id": null,
        "name": "All",
        "mobileno": null,
        "department_name": null
        });
      apiName = "Admin/getAllReporter?userId="+this.userService.loggedInUser.id;
    }
    this.common.loading++;
    this.api.get(apiName)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        let allUsers = res['data'] || [];
        allUsers.map(x=>{
          this.allUsers.push({
            "id": x.id,
            "name": x.name,
            "mobileno": x.mobileno,
            "department_name": x.department_name
          });
        })
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  };

  selectedUser(event:any){
    this.admin = { id: event.id, name: event.name };
  }

  getData(){
    let type = 0;
    this.callAdminList = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);


    let url = "UserCallLogs/getAdminCallReport.json?"
    if(this.activeTab == 'current'){
      type = 0;
    }else if(this.activeTab == 'period-to-period'){
      type = 1
    }else if(this.activeTab == 'entity'){
      type = 2;
    }

    const params =
      "startDate=" + startdate +
      "&endDate=" + enddate +
      "&departmentId=" + this.selectedDept.id +
      "&adminId=" + this.admin.id +
      "&type=" +type;
    
     

      this.common.loading++;
    this.api.get(url + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.callAdminList = res['data'] || [];
        this.callAdminList.length ? this.setTable() : this.resetTable();
        return this.callAdminList[0];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }
  

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadings() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.callAdminList[0]) {
      // console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.callAdminList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
       if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else {
          column[key] = { value: (ticket[key] && typeof (ticket[key]) == 'object') ? ticket[key]['value'] + ticket[key]['suffix'] : ticket[key], class: (ticket[key]) ? ticket[key]['class'] : '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }



 

}
