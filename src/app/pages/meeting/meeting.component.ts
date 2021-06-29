import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApplyLeaveComponent } from '../../modals/apply-leave/apply-leave.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  loggedInUser = null;
  adminList = [];
  groupList = [];
  departmentList = [];
  meetingData = {
    startDate: this.common.getDate(-2),
    endDate: this.common.getDate(),
    pastData: [],
    upcomingData: []
  }
  meetingAttendiesList = [];
  holdForFollowUp = {};

  constructor(public common: CommonService,
    public userService: UserService, public api: ApiService, public modalService: NgbModal,) {
    this.loggedInUser = this.userService._details.id;
    this.getAllAdmin();
    this.getUserGroupList();
    this.getMeetingListByType([0, 1]);
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.getAllAdmin();
    this.getUserGroupList();
    this.getMeetingListByType([0, 1]);
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

  getMeetingListByType(type, startDate = null, endDate = null) {
    if (this.meetingData.startDate && this.meetingData.endDate) {
      startDate = this.common.dateFormatter(this.meetingData.startDate);
      endDate = this.common.dateFormatter(this.meetingData.endDate);
    }
    type.map(type => {
      if (type == 1) startDate = endDate;
      this.getMeetings(type, startDate, endDate)
    });
  }

  getMeetings(type, startDate, endDate) {
    this.common.loading++;
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Admin/getMeetingListByType" + params).subscribe(
      (res) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        if (!type) {
          this.meetingData.pastData = res['data'] || [];
        } else {
          this.meetingData.upcomingData = res['data'] || [];
        }
        this.meetingData.pastData.map(meeting => {
          meeting["task_subject"] = meeting["subject"];
          meeting["_task_desc"] = meeting["_desc"];
        });
        this.meetingData.upcomingData.map(meeting => {
          meeting["task_subject"] = meeting["subject"];
          meeting["_task_desc"] = meeting["_desc"];
        })
        console.log("Past data", this.meetingData.pastData, "Upcoming Data", this.meetingData.upcomingData);
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  addMetting(formType) {
    let title = "Add Meeting";
    let btn = "Save";
    this.common.params = {
      meetingData: null,
      userList: this.adminList,
      groupList: this.groupList,
      formType: `${formType}`,
      title: title,
      btn: btn
    };
    const activeModal = this.modalService.open(ApplyLeaveComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        if (formType == 2) {
          this.getMeetingListByType([0, 1]);
        }
      }
    });
  }


  changeTicketStatusWithConfirm(ticket, type, status) {
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

  editMeeting(ticket, type, isEdit) {
    console.log("🚀 ~ file: task.component.ts ~ line 3333 ~ TaskComponent ~ editMeeting ~ ticket", ticket)
    this.common.params = {
      isEdit: isEdit,
      meetingData: ticket,
      userList: this.adminList,
      groupList: this.groupList,
      formType: '2',
      title: isEdit ? 'Edit Meeting' : 'Add Meeting',
      btn: 'Save'
    };
    const activeModal = this.modalService.open(ApplyLeaveComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        if (!isEdit && type != 0) {
          this.updateTicketStatus(ticket, type, 5);
        } else {
          this.getMeetingListByType([0, 1]);
        }
      }
    });
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
      // if (status != -1) this.collapseUnreadTaskUpdateStatus(type, ticket, status);
      // console.log("params:", params, ticket, this.unreadTaskForMeList); return false;
      // this.common.loading++;
      this.api.post("AdminTask/updateTicketStatus", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            this.getMeetingListByType([type]);
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
      if (ticket._cc_user_id && !ticket._cc_status) {
        this.ackTaskByCcUser(ticket, type);
      }
    });
  }

  ackTaskByCcUser(ticket, type, status = 1) {
    console.log(ticket)
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
        status: status,
        userName: this.userService.loggedInUser.name
      };
      this.api.post("AdminTask/ackTaskByCcUser", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
          } else {
            this.common.showError(res["data"]);
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

  getUserActivityUpdate(ticket, type, status) {
    this.holdForFollowUp = { ticket: ticket, type: type, status: status };
    let params = {
      ticketId: ticket._tktid,
      ticketType: 110
    }
    if (ticket._meeting_type != 2) {
      this.common.loading++;
      this.api.post('AdminTask/getAllUserByTask', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          let userListByTask = res['data'] || [];
          if (userListByTask) this.meetingAttendiesList = userListByTask['ccUsers'].map(user => {
            return {
              meetingId: ticket._refid,
              userId: user._cc_user_id,
              status: (user.status == 1) ? "Ack" : ((user.status == -1) ? "Declined" : "Pending"),
              presense: user.is_present ? '1' : '0',
              name: user.cc_user
            }
          });
          console.log(this.meetingAttendiesList);
          document.getElementById('meetingAttendance').style.display = 'block';
        } else {
          this.common.showError(res['msg'])
        }
      }, err => {
        this.common.showError();
      });
    } else {
      this.updateTicketStatus(ticket, type, status);
    }
  }

  closemeetingAttendanceMoadal(state) {
    document.getElementById('meetingAttendance').style.display = 'none';
    if (state) this.followUpMeeting(this.holdForFollowUp['ticket'], this.holdForFollowUp['type'], this.holdForFollowUp['status'])
  }

  followUpMeeting(ticket, type, status) {
    this.common.params = {
      title: "Follow Up Meeting",
      description:
        `<b>&nbsp;` + `Press Yes to create a follow up meeting and No will close this meeting without any followup.`,
      isRemark: false,
      btn1: 'Yes',
      btn2: 'No'
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
        this.editMeeting(ticket, type, false);
      } else {
        (!data.apiHit) ? this.updateTicketStatus(ticket, type, status) : null;
      }
    });
  }

  saveMeetingAttendiesStatus(user) {
    // console.log("user", user); return;
    let params = {
      meetingId: user.meetingId,
      userId: user.userId,
      status: parseInt(user.presense)
    }
    this.api.post('Admin/updateMeetingParticipantPresence', params).subscribe(res => {
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.common.showError();
    });
  }


  checkAvailability() {

  }

  myCalender() {

  }
}
