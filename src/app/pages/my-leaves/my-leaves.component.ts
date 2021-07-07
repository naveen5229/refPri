import { filter } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { TableService } from './../../Service/Table/table.service';
import { from, Subject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TaskNewComponent } from '../../modals/task-new/task-new.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { myLeaves } from './data';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';

@Component({
  selector: 'ngx-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {
  selectedTab = 'recent';
  myLeaves: any;
  adminList = [];
  groupList = [];
  startDate = new Date(new Date().setDate(new Date().getDate() - 15));
  endDate = new Date();
  myAllLeaves: any = [];
  allLeaves: any = [];
  // dtOptions: DataTables.Settings = {};
  dtOptions: any = {};

  @ViewChild(DataTableDirective, { static: false })
  dtElement: any;
  dttrigger: any = new Subject();

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  allmyLeaves = [];
  leaveRecord: any = [];
  leaveTypes = 4;
  departmentList = [];

  constructor(public common: CommonService,
    public user: UserService,
    public api: ApiService,
    public tableservice: TableService,
    public modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    this.getAllAdmin();
    this.getUserGroupList();
    this.getMyLeaves();
    this.getDepartmentList();
  }
  ngOnInit() {
    this.renderCircleProgress();
    this.dtOptions = this.tableservice.options(10, 7, 'USER EXPENSES');
  }

  refresh() {
    this.getMyLeaves();
    this.getDepartmentList();
  }

  renderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.destroy();
      this.dttrigger.next();
    });
  }




  renderCircleProgress() {
    this.myAllLeaves = from(myLeaves);
    this.myAllLeaves.subscribe((item: any) => {
      this.leaveRecord = item;
      this.leaveRecord.map((item: any) => {
        item.percentage = `${(item.detail[0].Available / item.detail[0].total * 100)}`;
        // item.percentage = `${item.percentage.toFixed(0)}%`
      });
    })
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

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        if (res["code"] > 0) {
          this.departmentList = res["data"] || [];
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

  getMyLeaves() {
    this.myLeaves = [];
    let startDate = this.leaveTypes == 4 ? new Date() : this.startDate;
    let params = "leaveType=" + this.leaveTypes +
      "&startDate=" + this.common.dateFormatter1(startDate) +
      "&endDate=" + this.common.dateFormatter1(this.endDate);
    console.log("params====", params);
    this.resetTable();
    this.common.loading++;
    this.api.get('AdminTask/getLeaveRequestData?' + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) {
          this.common.showError(res['msg']); return false;
        }
        if (res['data'] && res['data']) {
          this.allmyLeaves = res['data'] || [];
          console.log(' this.allmyLeaves: ', this.allmyLeaves);
          this.myLeaves = res['data'] || [];
          this.renderTable();
          // console.log('this.myLeaves: ', this.myLeaves);
          // this.myLeaves.length ? this.setTable() : this.resetTable();
        }
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

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.myLeaves[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if (key == 'date') {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.myLeaves.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(shift)
          };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  actionIcons(row) {
    let icons = [];
    if ([101, 102, 104, 111, 112, 113, 114, 115].includes(row._tktype)) {
      icons.push({
        class: "fas fa-trash-alt",
        action: this.deleterow.bind(this, row, -101),
        txt: "",
        title: "Delete Leave",
      });
    }
    if (row._status == 2 && [101, 102].includes(row._tktype)) {
      //for hold
      icons.push({
        class: "fa fa-pause-circle",
        action: this.changerowStatusWithConfirm.bind(this, row, -101, 3),
        txt: "",
        title: "Mark Task as Hold",
      });
    } else if (row._status == 3 && [101, 102].includes(row._tktype)) {
      icons.push({
        class: "fa fa-play-circle",
        action: this.changerowStatusWithConfirm.bind(this, row, -101, 2),
        txt: "",
        title: "Make Task as Unhold",
      });
    }
    if ([101, 102].includes(row._tktype)) {
      icons.push({
        class: "fa fa-link",
        action: this.createChildTicket.bind(this, row, -101),
        txt: "",
        title: "add child task",
      });
    }
    return icons;
  }


  createChildTicket(ticket, type) {
    this.common.params = {
      userList: this.adminList,
      groupList: this.groupList,
      parentTaskId: ticket._refid,
      parentTaskDesc: ticket.task_desc,
    };
    const activeModal = this.modalService.open(TaskNewComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getMyLeaves();
      }
    });
  }

  deleterow(ticket, type) {
    if (ticket._refid) {
      let params = {
        taskId: ticket._refid,
      };
      this.common.params = {
        title: "Delete Leave ",
        description: `<b>&nbsp;` + "Are You Sure To Delete This Record" + `<b>`,
      };

      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        if (data.response) {
          this.common.loading++;
          this.api.post("AdminTask/deleteTicket", params).subscribe(
            (res) => {
              this.common.loading--;
              if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
              this.common.showToast(res["msg"]);
              this.getMyLeaves();
            },
            (err) => {
              this.common.loading--;
              this.common.showError();
              console.log("Error: ", err);
            }
          );
        }
      });
    } else {
      this.common.showError("Leave ID Not Available");
    }
  }


  changerowStatusWithConfirm(ticket, type, status) {
    console.log(status, 'status')
    if (ticket._refid) {
      let preTitle = "Complete";
      if (!status) {
        preTitle = "Re-Active";
      } else if (status === -1) {
        preTitle = "Reject";
      } else if (status == 3) {
        preTitle = "Hold";
      } else if (ticket._status == 3) {
        preTitle = "Unhold";
      }
      this.common.params = {
        title: preTitle + " Task ",
        description:
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Task" + `<b>`,
        isRemark: status == 3 ? true : false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(ticket, type, status, data.remark);
        }
      });
    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  updateTicketStatus(ticket, type, status, remark = null) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: status,
        statusOld: ticket._status,
        remark: remark,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
      };
      // console.log("params:", params); return false;
      this.common.loading++;
      this.api.post("AdminTask/updateTicketStatus", params).subscribe(
        (res) => {
          this.common.loading--;
          if (res["code"] > 0) {
            this.common.showToast(res["msg"]);
            this.getMyLeaves();
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  ngOnDestroy(): void {
    this.dttrigger.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dttrigger.next();
    this.getMyLeaves();
  }

  deleteLeave(leave) {
    if (leave._refid) {
      let params = {
        taskId: leave._refid,
      };
      this.common.params = {
        title: "Delete Leave",
        description: `<b>&nbsp;` + "Are You Sure To Delete This Record" + `<b>`,
      };

      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        if (data.response) {
          // this.common.loading++;
          this.api.post("AdminTask/deleteTicket", params).subscribe(
            (res) => {
              // this.common.loading--;
              if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
              this.myLeaves = this.myLeaves.filter(task => task._tktid !== leave._tktid);
              // this.common.showToast(res["msg"]);
              // this.getTaskByType(type);
            },
            (err) => {
              // this.common.loading--;
              this.common.showError();
              console.log("Error: ", err);
            }
          );
        }
      });
    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  updateStatus(leave, status) {
    console.log(leave)
    // this.myLeaves = this.myLeaves.filter(task => task._tktid !== leave._tktid);
    if (leave._tktid) {
      let params = {
        ticketId: leave._tktid,
        statusId: status,
        statusOld: leave._status,
        remark: null,
        taskId: leave._refid,
        ticketType: leave._tktype,
      };
      this.api.post("AdminTask/updateTicketStatus", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            this.myLeaves = this.myLeaves.filter(task => task._tktid !== leave._tktid);
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          // this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  ticketMessage(ticket, type) {
    console.log('ticket', ticket)
    let ticketEditData = {
      ticketData: ticket,
      ticketId: ticket._tktid,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      taskId:
        ticket._tktype == 101 || ticket._tktype == 102 ? ticket._refid : null,
      taskType: ticket._tktype,
      tabType: type,
      isChecked: ticket._is_star_mark
    };

    let subTitle = ticket.task_subject + ((ticket._task_desc) ? ":<br>" + ticket._task_desc : '');
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.adminList,
      groupList: this.groupList,
      departmentList: this.departmentList
    };
    const activeModal = this.modalService.open(TaskMessageComponent, {
      size: "xl",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      // if (ticket._cc_user_id && !ticket._cc_status) {
      //   this.ackTaskByCcUser(ticket, type);
      // }
      this.getMyLeaves();
    });
  }
}
