import { TableService } from './../../Service/Table/table.service';
import { Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApplyLeaveComponent } from '../../modals/apply-leave/apply-leave.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { ApplyWFHComponent } from '../../modals/apply-wfh/apply-wfh.component';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss']
})
export class LeaveManagementComponent implements OnInit {
  selectedPage = 'my-leaves';
  adminList = [];
  groupList = [];



  constructor(
    public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public table:TableService,
    private router: Router
  ) {
    this.getAllAdmin();
    this.getUserGroupList()
  }

  ngOnInit() {
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(
      (res) => {
        if (res["code"] > 0) {
          let adminList = res["data"] || [];
          console.log(adminList)
          this.adminList = adminList.map((x) => {
            return { id: x.id, name: x.name + " - " + x.department_name };
          });
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups')
      .subscribe(
        (res) => {
          console.log(" Group data", res["data"]);
          if (res["code"] > 0) {
            let groupList = res['data'] || [];
            this.groupList = groupList.map((x) => {
              return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
            });
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.showError();
          console.log("Error: ", err);
        });
  }

  applyLeave(formType) {
    let title = "Apply Leave";
    let btn = "Apply";

    this.common.params = {
      meetingData: null,
      userList: this.adminList,
      groupList: this.groupList,
      formType: formType,
      title: title,
      btn: btn
    };
    const activeModal = this.modalService.open(ApplyLeaveComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      console.log("data.response = ", data.response);
      if (data.response) {
        this.selectedPage = 'my-leaves';
      }
 // alert('active modal closed');
 this.selectedPage='my-leaves';

    });
  }

  applyWFH(formType) {
    let title = "Apply WFH";
    let btn = "Apply";

    this.common.params = {
      userList: this.adminList,
      groupList: this.groupList,
      formType: formType,
      title: title,
      btn: btn
    };
    const activeModal = this.modalService.open(ApplyWFHComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      console.log("data.response = ", data.response);
      if (data.response) {
        this.selectedPage = 'my-leaves';
      }
 this.selectedPage='my-leaves';

    });
  }

  leaveType(formType) {
    this.router.navigate(['/pages/leave-type-management']);
  }

  leaveSetting(formType) {
    this.router.navigate(['/pages/leave-setting']);
  }
}
