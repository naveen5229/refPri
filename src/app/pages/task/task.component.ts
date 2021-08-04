import { Component, OnInit, Directive, HostListener, ElementRef } from "@angular/core";
import { CommonService } from "../../Service/common/common.service";
import { ApiService } from "../../Service/Api/api.service";
import { UserService } from "../../Service/user/user.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmComponent } from "../../modals/confirm/confirm.component";
import { TaskMessageComponent } from "../../modals/task-message/task-message.component";
import { TaskNewComponent } from "../../modals/task-new/task-new.component";
import { AddProjectComponent } from "../../modals/add-project/add-project.component";
import { ReminderComponent } from "../../modals/reminder/reminder.component";
import { TaskScheduleNewComponent } from "../../modals/task-schedule-new/task-schedule-new.component";
import { TaskScheduleMasterComponent } from "../../modals/task-schedule-master/task-schedule-master.component";
import { ChatboxComponent } from '../../modals/process-modals/chatbox/chatbox.component';
import { ApplyLeaveComponent } from '../../modals/apply-leave/apply-leave.component';
import { TicketChatboxComponent } from "../../modals/ticket-modals/ticket-chatbox/ticket-chatbox.component";
import { GenericModelComponent } from "../../modals/generic-model/generic-model.component";
import { AddExtraTimeComponent } from "../../modals/ticket-modals/add-extra-time/add-extra-time.component";
import { TicketClosingFormComponent } from "../../modals/ticket-modals/ticket-form-field/ticket-closing-form.component";
import { Router } from "@angular/router";

@Component({
  selector: "ngx-task",
  templateUrl: "./task.component.html",
  styleUrls: ["./task.component.scss"],
})
export class TaskComponent implements OnInit {
  today = new Date();
  activeTab = "unreadTaskByMe";
  // activeTab = "unreadLeads";
  task_type = 1;
  userId = null;
  primaryId = null;
  escalationId = null;
  reportingId = null;
  adminList = [];
  groupList = [];
  normalTaskList = [];
  scheduledTaskList = [];
  normalTaskByMeList = [];
  allCompletedTaskList = [];
  ccTaskListAll = [];
  ccTaskList = [];
  projectTaskList = [];
  holdTaskList = [];
  ccUser = [];
  SearchBy = "By Task";
  fabAction = false;
  processTicketNotiSts = {};
  tableNormal = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  tableNormalTaskByMe = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  tableSchedule = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  tableAllCompleted = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  tableCCTask = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  tableProjectTask = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  tableHoldTask = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };

  searchTask = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate(),
  };
  minDateTodo = this.common.getDate();
  taskTodoForm = {
    taskTodoId: null,
    desc: "",
    date: this.common.getDate(),
    isUrgent: false,
    duration: null,
    requestId: null
  };

  taskTodoList = [];
  tableTaskTodoList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  futureTaskByMeList = [];
  tableFutureTaskByMeList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  unreadTaskForMeList = [];
  tableUnreadTaskForMeList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
      arrow: true,
      tableHeight: 'auto'
    },
  };

  tableUnreadLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true,
      tableHeight: 'auto'
    }
  };

  tableUnreadTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true,
      tableHeight: 'auto'
    }
  };

  departmentList = [];

  scheduleMasterList = [];
  tableScheduleMaster = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };

  normalTaskListAll = [];
  normalTaskByMeListAll = [];

  searchTaskList = [];
  tableSearchTaskList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };
  activeSabTab = 0;
  unreadLeads = [];
  unreadTkt = [];
  selectedRow = -1;
  todoVisi = false;
  todoAddList = false;

  meetingList = [];
  tableMeeting = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true,
    },
  };

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event) {
    this.keyHandler(event);
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    console.log('event triggered:', event);
    if ((event.target.innerText >= 1 && event.target.innerText <= 10000) || event.target.innerText == 'Cancel' || event.target.innerText == 'Set' || ['feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(event.target.innerText.toLowerCase())) return;
    (this.todoVisi) ? this.todoVisi = false : null;
    (this.fabAction) ? this.fabAction = false : null;
  }
  constructor(
    public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
    public userService: UserService,
    public eRef: ElementRef,
    public router: Router
  ) {
    this.getTaskByType(-8);
    this.getProcessLeadByType(5);
    this.getTicketByType(102);
    this.getAllAdmin();
    this.getDepartmentList();
    this.getUserGroupList();
    this.getProcessTicketCount();
    // this.getTodoTaskList(0);
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() { }

  refresh() {
    this.activeTab = "unreadTaskByMe";
    // this.activeTab = "unreadLeads";
    this.getTaskByType(-8);
    this.getProcessLeadByType(5);
    this.getTicketByType(102);
    this.getAllAdmin();
    this.getDepartmentList();
    this.getUserGroupList();
    this.getProcessTicketCount();
    // this.getTodoTaskList(0);
  }

  propogateEvent(event) {
    event.stopPropagation();
  }

  resetSearchTask() {
    this.searchTask = {
      startDate: <any>this.common.getDate(-2),
      endDate: <any>this.common.getDate(),
    };
  }

  keyHandler(event) {
    const key = event.key.toLowerCase();
    let activeId = document.activeElement.id;
    // activeId = (!activeId)?document.getElementById('table').querySelector('tbody').children[0].id:activeId;
    // console.log('res',document.getElementById('table').querySelector('tbody').children[0].id);
    // if (key == 'enter' && (!activeId) && this.unreadTaskForMeList.length && this.selectedRow != -1 && this.activeTab == 'unreadTaskByMe') {
    //   this.ticketMessage(this.unreadTaskForMeList[this.selectedRow], -8);
    // }

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
  actionHandler(event) {
    console.log('row data again:', event);
    this.selectedRow = (event.smartId == 'undefined') ? event.rowcount : event.smartId;//event.rowcount;
    let activeId = document.activeElement.id;
    if ((!activeId) && this.unreadTaskForMeList.length && this.selectedRow != -1 && this.activeTab == 'unreadTaskByMe') {
      this.ticketMessage(this.unreadTaskForMeList[this.selectedRow], -8);
    }
    //  this.transMessage(this, lead, type)
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

  getProcessTicketCount() {
    this.api.get("Ticket/getOpenTicketCount").subscribe(
      (res) => {
        if (res["code"] > 0) {
          console.log("data", res["data"]);
          this.processTicketNotiSts = res['data'];
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

  showProjectPopup() {
    this.tableUnreadTaskForMeList.settings.arrow = false;
    this.common.params = { userList: this.adminList };
    const activeModal = this.modalService.open(AddProjectComponent, {
      size: "xl",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      this.tableUnreadTaskForMeList.settings.arrow = true;
    });
  }

  showTaskPopup() {
    this.tableUnreadTaskForMeList.settings.arrow = false;
    this.common.params = { userList: this.adminList, groupList: this.groupList, parentTaskId: null };
    const activeModal = this.modalService.open(TaskNewComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTaskByType(-101);
        this.activeTab = "TasksByMe";
      }
      this.tableUnreadTaskForMeList.settings.arrow = true;
    });
  }

  applyLeave(formType) {
    let title = "Apply Leave";
    let btn = "Apply";
    if (formType == 1) {
      title = "Add Broadcast";
      btn = "Add";
    } else if (formType == 2) {
      title = "Add Meeting";
      btn = "Save";
    }
    this.tableUnreadTaskForMeList.settings.arrow = false;
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
      if (data.response) {
        if (formType == 1) {
          this.getTaskByType(-101);
          this.activeTab = "TasksByMe";
        } else if (formType == 2) {
          this.getMeetingListByType(1);
          this.activeTab = "meeting";
        }
      }
      this.tableUnreadTaskForMeList.settings.arrow = true;
    });
  }

  getProcessLeadByType(type, startDate = null, endDate = null) {
    // this.common.loading++;
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Processes/getMyProcessByType" + params).subscribe(res => {
      // this.common.loading--;
      if (res['code'] == 1) {
        if (type == 5) {
          this.unreadLeads = res['data'] || [];
          this.setTableUnreadLeads(type);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      // this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getTicketByType(type, startDate = null, endDate = null) {
    // this.common.loading++;
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Ticket/getTicketByType" + params).subscribe(res => {
      // this.common.loading--;
      if (res['code'] == 1) {
        if (type == 102) {
          this.unreadTkt = res['data'] || [];
          this.setTableUnreadTkt(type);
        } else {
          this.common.showError(res['msg']);
        }
      }
    }, err => {
      // this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }
  // start unread lead
  setTableUnreadLeads(type) {
    this.tableUnreadLeads.data = {
      headings: this.generateHeadingsUnreadLeads(),
      columns: this.getTableColumnsUnreadLeads(type)
    };
    return true;
  }


  generateHeadingsUnreadLeads() {
    let headings = {};
    for (var key in this.unreadLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnreadLeads(type) {
    let columns = [];
    this.unreadLeads.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnreadLeads()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsForLeads(lead, type),
            _data: lead
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }


  // start: UnreadTkt
  setTableUnreadTkt(type) {
    this.tableUnreadTkt.data = {
      headings: this.generateHeadingsUnreadTkt(),
      columns: this.getTableColumnsUnreadTkt(type)
    };
    return true;
  }

  generateHeadingsUnreadTkt() {
    let headings = {};
    for (var key in this.unreadTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnreadTkt(type) {
    let columns = [];
    this.unreadTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnreadTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsForTicketUnread(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }

  actionIconsForTicketUnread(ticket, type) {
    console.log("actionIcons:", ticket);
    let icons = [];
    if (type == 102) {
      icons.push({ class: "fas fa-comments", action: this.ticketMessageChat.bind(this, ticket, type), txt: "", title: 'Chat Box', },
        // { class: "fas fa-share", action: this.openForwardTicket.bind(this, ticket, type), txt: '', title: "Forward Ticket" }
      );

      // if ((ticket._status == 5 || ticket._status == -1) && ticket._close_form > 0) {
      //   icons.push({ class: "fas fa-plus-square text-primary", action: this.openInfoModal.bind(this, ticket, type, 1), title: "Form Matrix Detail" })
      // }
      if (ticket._allocated_user == this.userService.loggedInUser.id && ticket._status == 2 && ticket._check_status > 0) {
        icons.push({ class: "fas fa-clipboard-check", action: this.openCheckStatusModal.bind(this, ticket, type), txt: "", title: "Check Status", });
      }

      if (ticket._unreadcount > 0) {
        icons = [{ class: "fas fa-comments new-comment", action: this.ticketMessageChat.bind(this, ticket, type), txt: ticket._unreadcount, title: 'Chat Box', },];
      } else if (ticket._unreadcount == -1) {
        icons = [{ class: "fas fa-comments no-comment", action: this.ticketMessageChat.bind(this, ticket, type), txt: "", title: 'Chat Box', },];
      }

      if (ticket._status == 5 || ticket._status == -1) {
      } else {
        if (ticket._isremind == 1 && type == 102) {
          icons.push({ class: "fa fa-bell isRemind", action: this.checkReminderSeenTicket.bind(this, ticket, type), txt: "", title: 'Reminder', });
        }
      }
      // icons.push({ class: "fas fa-history", action: this.ticketHistory.bind(this, ticket, type), txt: '', title: "History" });

      // if (ticket._status == 2) {
      //   icons.push({ class: "fas fa-user-clock", action: this.addTime.bind(this, ticket, type), txt: '', title: "Add Extra Time" });
      // }

      if (ticket._allocated_user == this.userService.loggedInUser.id) {
        if (!ticket._status) {
          icons.push({ class: "fa fa-times text-danger", action: this.changeTicketStatusWithConfirmUnread.bind(this, ticket, type, -1), txt: "", title: "Mark Rejected", });
          icons.push({ class: "fa fa-check-square text-warning", action: this.changeTicketStatusWithConfirmUnread.bind(this, ticket, type, 2), txt: "", title: "Mark Ack", });
        } else if (ticket._status == 2) {
          icons.push({ class: "fa fa-thumbs-up text-success", action: (ticket._close_form > 0) ? this.openTicketFormData.bind(this, ticket, type, 5) : this.changeTicketStatusWithConfirm.bind(this, ticket, type, 5), txt: "", title: "Mark Completed", });
        }
      }

      // icons.push({ class: "fas fa-plus-square", action: this.updatePrimaryInfo.bind(this, ticket, type), txt: '', title: "Update Primary Info" });

    }
    // icons.push({ class: "fa fa-info-circle", action: this.openInfoModal.bind(this, ticket, type, 0), txt: '', title: "Ticket Info" });

    return icons;
  }

  updatePrimaryInfo(ticket, type) {
    let title = 'Primary Info Fields';
    let actionData = {
      ticketId: ticket._ticket_id,
      refId: ticket._tpid,
      refType: 2,
    };
    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(TicketClosingFormComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data, 'response');
        // if(data.isContinue){
        //   this.updateTicketStatus(ticket, type, status, null);
        // }else{
        //   this.changeTicketStatusWithConfirm(ticket, type, status)
        // }
      }
    });
  }

  openTicketFormData(ticket, type, status) {
    let title = 'Ticket Closing Form';
    let actionData = {
      ticketId: ticket._ticket_id,
      refId: ticket._tpid,
      refType: 1,
    };
    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(TicketClosingFormComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data, 'response');
        if (data.isContinue) {
          this.updateTicketStatusForTicket(ticket, type, status, null);
        } else {
          this.changeTicketStatusWithConfirm(ticket, type, status)
        }
      }
    });
  }

  changeTicketStatusWithConfirmUnread(ticket, type, status) {
    if (ticket._ticket_id) {
      let preTitle = "Complete";
      if (status === -1) {
        preTitle = "Reject";
      } else if (status == 2) {
        preTitle = "Acknowledge";
      } else if (ticket._status == 2) {
        preTitle = "Completed";
      } else if (status == 0) {
        preTitle = "Re-Active";
      }
      this.common.params = {
        title: preTitle + " Ticket ",
        description:
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Ticket" + `<b>`,
        isRemark: status == -1 ? true : false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
      activeModal.result.then((data) => {
        if (data.response) {
          this.updateTicketStatusForTicket(ticket, type, status, data.remark);
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  updateTicketStatusForTicket(ticket, type, status, remark = null) {
    if (ticket._ticket_allocation_id) {
      let params = {
        ticketId: ticket._ticket_allocation_id,
        statusId: status,
        statusOld: ticket._status,
        remark: remark,
      }
      this.common.loading++;
      this.api.post('Ticket/updateTicketStatus', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.common.showToast(res['msg']);
          this.getTicketByType(type);
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  addTime(ticket, type) {
    this.common.params = {
      ticketId: ticket._ticket_allocation_id,
      title: "Add Extra Time",
      btn: "Add Time",
    };
    const activeModal = this.modalService.open(AddExtraTimeComponent, {
      size: "md",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTicketByType(type);
      }
    });
  }

  ticketHistory(ticket, type) {
    let dataparams = {
      view: {
        api: 'Ticket/getTicketHistory',
        param: {
          tktId: ticket._ticket_id
        }
      },
      title: "Ticket History"
    }
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  ticketMessageChat(ticket, type) {
    console.log("type:", type, ticket, this.adminList);
    let ticketEditData = {
      ticketData: ticket,
      ticketId: ticket._ticket_id,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      tabType: type,
    };

    let subTitle = ticket.identity;
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.adminList,
      groupList: this.groupList
    };
    const activeModal = this.modalService.open(TicketChatboxComponent, { size: "lg", container: "nb-layout", backdrop: "static", });
    activeModal.result.then((data) => {
      type ? this.getTicketByType(type) : null;
    });
  }

  openCheckStatusModal(ticket, type) {
    // console.log("openCheckStatusModal:",ticket);
    this.common.loading++;
    this.api.get("Ticket/checkTicketStatus?ticketId=" + ticket._ticket_id).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let checkStatus = "No data found";
        if (res['data'] && res['data'].length) {
          checkStatus = res['data'][0]["status"];
        }
        this.common.params = {
          title: 'Status',
          description: '<b>' + checkStatus + '<b>',
          btn1: 'Ok'
        }
        const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    });
  }

  checkReminderSeenTicket(ticket, type) {
    let params = {
      ticketId: ticket._ticket_id,
    };
    this.common.loading++;
    this.api.post("Ticket/checkTicketReminderSeen", params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      this.common.showToast(res["msg"]);
      this.getTicketByType(type);
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
  }
  // end: unreadTkt

  actionIconsForLeads(lead, type) {
    let icons = [
      { class: "fas fa-comments no-comment", action: this.transMessage.bind(this, lead, type), txt: '', title: "Lead Comment" }
    ];
    if (lead._unreadcount > 0) {
      icons = [
        { class: "fas fa-comments new-comment", action: this.transMessage.bind(this, lead, type), txt: lead._unreadcount, title: "Lead Comment" },
      ];
    } else if (lead._unreadcount == 0) {
      icons = [
        { class: "fas fa-comments", action: this.transMessage.bind(this, lead, type), txt: '', title: "Lead Comment" },
      ];
    } else if (lead._unreadcount == -1) {
      icons = [
        { class: "fas fa-comments no-comment", action: this.transMessage.bind(this, lead, type), txt: '', title: "Lead Comment" },
      ];
    }

    if (type == 5) {//unread
      if (lead._cc_user_id > 0 && !lead._cc_status) {
        icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByCcUser.bind(this, lead, type), txt: '', title: "Mark Ack as CC Lead" });
      } else if (lead._is_action == 1 && !lead._action_status) {
        icons.push({ class: "fa fa-thumbs-up text-warning", action: this.updateLeadActionStatus.bind(this, lead, type, 2), txt: '', title: "Mark Ack As Action" });
      } else if (lead._status == 0) {
        icons.push({ class: "fa fa-thumbs-up text-warning", action: this.updateTransactionStatus.bind(this, lead, type, 2), txt: '', title: "Mark Ack" });
      } else if (lead._status == 2 && lead._state_type == 2) {
        icons.push({ class: "fa fa-thumbs-up text-success", action: this.updateTransactionStatusWithConfirm.bind(this, lead, type, 5), txt: '', title: "Mark Lead As completed" });
      } else if (lead._status == 5 && lead._ack_to_aduser == 1 && !lead._is_send) {
        icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByAssigner.bind(this, lead, type), txt: '', title: "Mark Ack by Adduser" });
      }
    }
    return icons;
  }

  transMessage(lead, type) {
    if (lead._transactionid > 0) {
      let editData = {
        transactionid: lead._transactionid,
        lastSeenId: lead._lastreadid,
        tabType: type,
        priOwnId: (lead._pri_own_id > 0) ? lead._pri_own_id : null,
        rowData: lead
      }
      this.common.params = {
        editData, title: "Transaction Comment", button: "Save", subTitle: lead.identity, fromPage: 'process',
        userList: this.adminList,
        groupList: this.groupList,
        departmentList: this.departmentList
      };
      const activeModal = this.modalService.open(ChatboxComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        this.getProcessLeadByType(type);
      });
    } else {
      this.common.showError("Invalid Lead");
    }
  }

  ackLeadByCcUser(lead, type) {
    if (lead._transactionid > 0) {
      let params = {
        transId: lead._transactionid
      }
      this.common.loading++;
      this.api.post('Processes/ackLeadByCcUser', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
          this.getProcessLeadByType(type);
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Lead ID Not Available");
    }
  }

  ackLeadByAssigner(lead, type) {
    if (lead._transactionid > 0) {
      let params = {
        transId: lead._transactionid
      }
      this.common.loading++;
      this.api.post('Processes/updateTransactionStatusByAdduser', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            this.getProcessLeadByType(type);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Lead ID Not Available");
    }
  }

  updateTransactionStatusWithConfirm(lead, type, status) {
    let preText = "Complete";
    this.common.params = {
      title: preText + ' Lead',
      description: `<b>` + 'Are You Sure to ' + preText + ` this Lead <b>`,
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        this.updateTransactionStatus(lead, type, status);
      }
    });
  }

  updateLeadActionStatus(lead, type, status) {
    if (lead._transactionid) {
      let params = {
        transId: lead._transactionid,
        actionId: lead._transaction_actionid,
        status: status
      }
      this.common.loading++;
      this.api.post('Processes/updateLeadActionStatus', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            this.getProcessLeadByType(type);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Transaction ID Not Available");
    }
  }

  updateTransactionStatus(lead, type, status) {
    // console.log("updateTransactionStatus");
    if (lead._transactionid) {
      let params = {
        transId: lead._transactionid,
        status: status
      }
      this.common.loading++;
      this.api.post('Processes/updateTransactionStatus', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            this.getProcessLeadByType(type);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Transaction ID Not Available");
    }
  }
  // end unread lead

  getTaskByType(type, startDate = null, endDate = null) {
    this.activeSabTab = 0;
    this.todoVisi = false;
    this.common.loading++;
    if (type == -102 && this.searchTask.startDate && this.searchTask.endDate) {
      startDate = this.common.dateFormatter(this.searchTask.startDate);
      endDate = this.common.dateFormatter(this.searchTask.endDate);
    }
    let params = {
      type: type,
      startDate: startDate,
      endDate: endDate,
    };
    this.api.post("AdminTask/getTaskByType", params).subscribe(
      (res) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        console.log("data", res["data"]);
        this.resetSmartTableData();
        if (type == 101) {
          //normal task pending (task for me)
          this.normalTaskList = res["data"] || [];
          this.normalTaskListAll = this.normalTaskList;
          this.setTableNormal(type);
        } else if (type == -101) {
          //task by me
          this.normalTaskByMeList = res["data"] || [];
          this.normalTaskByMeListAll = this.normalTaskByMeList;
          this.setTableNormalTaskByMe(type);
        } else if (type == 103) {
          this.scheduledTaskList = res["data"] || [];
          this.setTableSchedule(type);
        } else if (type == -102) {
          this.allCompletedTaskList = res["data"] || [];
          this.setTableAllCompleted(type);
        } else if (type == -5) {
          this.ccTaskList = res["data"] || [];
          this.ccTaskListAll = this.ccTaskList;
          this.setTableCCTask(type);
        } else if (type == -6) {
          this.projectTaskList = res["data"] || [];
          this.setTableProjectTask(type);
        } else if (type == -7) {
          this.futureTaskByMeList = res["data"] || [];
          this.setTableFutureTaskByMe(type);
        } else if (type == -8) {
          this.unreadTaskForMeList = res["data"] || [];
          this.setTableUnreadTaskForMe(type);
        } else if (type == -9) {
          this.holdTaskList = res["data"] || [];
          this.setTableHoldTask(type);
        }
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  resetSmartTableData() {
    this.tableNormalTaskByMe.data = {
      headings: {},
      columns: [],
    };
    this.tableSchedule.data = {
      headings: {},
      columns: [],
    };
    this.tableNormal.data = {
      headings: {},
      columns: [],
    };
    this.tableAllCompleted.data = {
      headings: {},
      columns: [],
    };
    this.tableCCTask.data = {
      headings: {},
      columns: [],
    };
    this.tableProjectTask.data = {
      headings: {},
      columns: [],
    };
    this.tableFutureTaskByMeList.data = {
      headings: {},
      columns: [],
    };
    this.tableUnreadTaskForMeList.data = {
      headings: {},
      columns: [],
    };
    this.tableHoldTask.data = {
      headings: {},
      columns: [],
    };
    this.tableScheduleMaster.data = {
      headings: {},
      columns: [],
    };
    this.tableMeeting.data = {
      headings: {},
      columns: [],
    };
  }

  generateHeadingsNormal() {
    let headings = {};
    for (var key in this.normalTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  generateHeadingsNormalTaskByMe() {
    let headings = {};
    for (var key in this.normalTaskByMeList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  generateHeadingsSchedule() {
    let headings = {};
    for (var key in this.scheduledTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }

  setTableNormal(type) {
    this.tableNormal.data = {
      headings: this.generateHeadingsNormal(),
      columns: this.getTableColumnsNormal(type),
    };
    return true;
  }
  setTableNormalTaskByMe(type) {
    this.tableNormalTaskByMe.data = {
      headings: this.generateHeadingsNormalTaskByMe(),
      columns: this.getTableColumnsNormalTaskByMe(type),
    };
    return true;
  }
  setTableSchedule(type) {
    this.tableSchedule.data = {
      headings: this.generateHeadingsSchedule(),
      columns: this.getTableColumnsSchedule(type),
    };
    return true;
  }
  setTableAllCompleted(type) {
    this.tableAllCompleted.data = {
      headings: this.generateHeadingsAllCompleted(),
      columns: this.getTableColumnsAllCompleted(type),
    };
    return true;
  }

  generateHeadingsAllCompleted() {
    let headings = {};
    for (var key in this.allCompletedTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  getTableColumnsAllCompleted(type) {
    let columns = [];
    this.allCompletedTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsAllCompleted()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }

  getTableColumnsNormal(type) {
    let columns = [];
    this.normalTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsNormal()) {
        if (key == "admin_name") {
          column[key] = {
            value: ticket[key],
            class: "admin",
            isHTML: true,
            action: "",
          };
        } else if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: (ticket['_reply_demanded'] > 0) ? ticket[key] + " (reply demanded)" : ticket[key],
            class: (ticket['_reply_demanded'] > 0) ? "black font-weight-bold" : "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "expdate") {
          column[key] = {
            value: ticket[key],
            class: ticket["time_left"] <= 0 ? "blue font-weight-bold" : "blue",
            action: ([101, 102].includes(ticket._tktype) && (!ticket['_reply_demanded'] || ticket['_assignee_user_id'] == this.userService.loggedInUser.id))
              ? this.editTask.bind(this, ticket, type)
              : null,
          };
        }
        else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else if (key == "project") {
          column[key] = { value: ticket[key], class: [101, 102].includes(ticket._tktype) ? "blue" : "black", action: [101, 102].includes(ticket._tktype) ? this.editTask.bind(this, ticket, type, true) : null, };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }

  getTableColumnsNormalTaskByMe(type) {
    let columns = [];
    this.normalTaskByMeList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsNormalTaskByMe()) {
        if (key == "admin_name") {
          column[key] = {
            value: ticket[key],
            class: "admin",
            isHTML: true,
            action: "",
          };
        } else if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "expdate") {
          column[key] = {
            value: ticket[key],
            class: ticket["time_left"] <= 0 ? "blue font-weight-bold" : "blue",
            action: [101, 102, 103].includes(ticket._tktype)
              ? this.editTask.bind(this, ticket, type)
              : null,
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else if (key == "project") {
          column[key] = { value: ticket[key], class: [101, 102].includes(ticket._tktype) ? "blue" : "black", action: [101, 102].includes(ticket._tktype) ? this.editTask.bind(this, ticket, type, true) : null, };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }

  getTableColumnsSchedule(type) {
    let columns = [];
    this.scheduledTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsSchedule()) {
        if (key == "admin_name") {
          column[key] = {
            value: ticket[key],
            class: "admin",
            isHTML: true,
            action: "",
          };
        } else if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else {
          column[key] = {
            value: ticket[key],
            class:
              key == "time_left" && ticket["time_left"] <= 0
                ? "blue font-weight-bold"
                : "blue",
            action: "",
          };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }

  // start cc task list
  setTableCCTask(type) {
    this.tableCCTask.data = {
      headings: this.generateHeadingsCCTask(),
      columns: this.getTableColumnsCCTask(type),
    };
    return true;
  }

  generateHeadingsCCTask() {
    let headings = {};
    for (var key in this.ccTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  getTableColumnsCCTask(type) {
    let columns = [];
    this.ccTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsCCTask()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end cc task list

  // start project task list
  setTableProjectTask(type) {
    this.tableProjectTask.data = {
      headings: this.generateHeadingsProjectTask(),
      columns: this.getTableColumnsProjectTask(type),
    };
    return true;
  }

  generateHeadingsProjectTask() {
    let headings = {};
    for (var key in this.projectTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  getTableColumnsProjectTask(type) {
    let columns = [];
    this.projectTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsProjectTask()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end project task list
  // start future task by me list
  setTableFutureTaskByMe(type) {
    this.tableFutureTaskByMeList.data = {
      headings: this.generateHeadingsFutureTaskByMeList(),
      columns: this.getTableColumnsFutureTaskByMeList(type),
    };
    return true;
  }

  generateHeadingsFutureTaskByMeList() {
    let headings = {};
    for (var key in this.futureTaskByMeList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  getTableColumnsFutureTaskByMeList(type) {
    let columns = [];
    this.futureTaskByMeList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsFutureTaskByMeList()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, type)
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
      }
      columns.push(column);
    });
    return columns;
  }
  // end future task by me list
  // start hold task list
  setTableHoldTask(type) {
    this.tableHoldTask.data = {
      headings: this.generateHeadingsHoldTaskList(),
      columns: this.getTableColumnsHoldTaskList(type),
    };
    return true;
  }

  generateHeadingsHoldTaskList() {
    let headings = {};
    for (var key in this.holdTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }

  getTableColumnsHoldTaskList(type) {
    let columns = [];
    this.holdTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsHoldTaskList()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end hold task list

  // start unread task for me list
  setTableUnreadTaskForMe(type) {
    console.log('setting Table Here', this.unreadTaskForMeList);
    this.tableUnreadTaskForMeList.data = {
      headings: this.generateHeadingsUnreadTaskForMeList(),
      columns: this.getTableColumnsUnreadTaskForMeList(type),
    };
    return true;
  }
  generateHeadingsUnreadTaskForMeList() {
    let headings = {};
    for (var key in this.unreadTaskForMeList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  getTableColumnsUnreadTaskForMeList(type) {
    let columns = [];
    this.unreadTaskForMeList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsUnreadTaskForMeList()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: (ticket['_tktype'] == 110) ? `${ticket["_task_desc"] ? ticket["_task_desc"] : ''}\n${ticket['_meeting_time'] ? ticket['_meeting_time'] : ''}\n${ticket['_duration'] ? ticket['_duration'] : ''}\n${ticket['_link'] ? ticket['_link'] : ''}\n${ticket['_room'] ? ticket['_room'] : ''}` : ticket["_task_desc"],
          };
        } else if (key == "time_left") {
          column[key] = {
            value: this.common.findRemainingTime(ticket[key]),
            class: "black",
            action: "",
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }

        if (ticket._tktype == 103 && ticket._status == 0) {
          column["style"] = { background: "pink" };
        } else if (
          ticket._assignee_user_id == this.userService.loggedInUser.id ||
          ticket._assigned_user_id == this.userService.loggedInUser.id
        ) {
          column["style"] = {
            background: this.common.taskStatusBg(ticket._status),
          };
        } else {
          column["style"] = { background: "aliceblue" };
        }
        column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end unread task for me list

  actionIcons(ticket, type) {
    console.log("ticket", ticket);
    let icons = [
      {
        class: "fas fa-comments",
        action: this.ticketMessage.bind(this, ticket, type),
        txt: "",
        title: null,
      },
    ];

    if (ticket._unreadcount > 0) {
      icons = [
        {
          class: "fas fa-comments new-comment",
          action: this.ticketMessage.bind(this, ticket, type),
          txt: ticket._unreadcount,
          title: null,
        },
      ];
    } else if (ticket._unreadcount == -1) {
      icons = [
        {
          class: "fas fa-comments no-comment",
          action: this.ticketMessage.bind(this, ticket, type),
          txt: "",
          title: null,
        },
      ];
    }

    if (type == -101) {
      if ([101, 102, 104, 111, 112, 113, 114, 115].includes(ticket._tktype)) {
        icons.push({
          class: "fas fa-trash-alt",
          action: this.deleteTicket.bind(this, ticket, type),
          txt: "",
          title: "Delete Task",
        });
        if(ticket.assignedto == this.userService.loggedInUser.name && ticket._tktype == 114){
          icons.push({
            class: "fa fa-thumbs-up text-success",
            action: this.changeTicketStatusWithConfirm.bind(
              this,
              ticket,
              type,
              5
            ),
            txt: "",
            title: "Mark Completed",
          });
        }
      }
      if (ticket._status == 2 && [101, 102].includes(ticket._tktype)) {
        //for hold
        icons.push({
          class: "fa fa-pause-circle",
          action: this.changeTicketStatusWithConfirm.bind(
            this,
            ticket,
            type,
            3
          ),
          txt: "",
          title: "Mark Task as Hold",
        });
      } else if (ticket._status == 3 && [101, 102].includes(ticket._tktype)) {
        icons.push({
          class: "fa fa-play-circle",
          action: this.changeTicketStatusWithConfirm.bind(
            this,
            ticket,
            type,
            2
          ),
          txt: "",
          title: "Make Task as Unhold",
        });
      }
    } else if (type == 101 || type == 103 || type == -102) {
      if (ticket._status == 5 || ticket._status == -1) {
        if ([104, 111, 112, 113, 114, 115].includes(ticket._tktype) &&
         (ticket._status == -1 || ticket._assigned_user_id != this.userService.loggedInUser.id)) {

        } else {
          icons.push({
            class: "fa fa-retweet",
            action: this.reactiveTicket.bind(this, ticket, type),
            txt: "",
            title: "Re-Active",
          });
        }
      } else if (ticket._reply_demanded > 0) {
        // no action for reply demanded pending
      } else  if(ticket._status==0 && ticket.ticket_type== "Broadcast"){
        console.log("Task not acknowledged");
      icons.push({
        class: "fa fa-check-square text-warning",
        action: this.ackTaskByCcUser(ticket, type),
        txt: "",
        title: "Mark Ack as CC Task",
      });
    }
      else if (ticket._status == 2) {
        icons.push({
          class: "fa fa-thumbs-up text-success",
          action: this.changeTicketStatusWithConfirm.bind(
            this,
            ticket,
            type,
            5
          ),
          txt: "",
          title: "Mark Completed",
        });
        if (type == 101 && [101, 102].includes(ticket._tktype)) {
          //for hold
          icons.push({
            class: "fa fa-pause-circle",
            action: this.changeTicketStatusWithConfirm.bind(
              this,
              ticket,
              type,
              3
            ),
            txt: "",
            title: "Mark Task as Hold",
          });
        }
        if ([104, 111, 112, 113, 115, 211, 212, 213].includes(ticket._tktype)) {//leave or WFH reject
          icons.push({
            class: "fa fa-times text-danger",
            action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1),
            txt: "",
            title: "Mark Rejected",
          });
        }
      } else if (ticket._status == 0 && ticket.ticket_type!= "Broadcast") {
        icons.push({
          class: "fa fa-times text-danger",
          action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1),
          txt: "",
          title: "Mark Rejected",
        });
      }
      else if(ticket._status==1 && ticket.ticket_type== "Broadcast"){
        icons.push({
          class: "fa fa-thumbs-up text-success",
          action: this.changeTicketStatusWithConfirm.bind(
            this,
            ticket,
            type,
            5
          ),
          txt: "",
          title: "Mark Completed",
        });
      }
    }
    else if (type == -8) {
      if (ticket._status == 0 && ticket._assignee_user_id == this.userService.loggedInUser.id) {
        if ([111, 112, 113, 114].includes(ticket._tktype)) {
          icons.push({
            class: "fa fa-thumbs-up text-warning",
            // action: this.updateTicketStatus.bind(this, ticket, type, 2),
            action: this.openConfirmAlert.bind(this, ticket, type),//this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 2),
            txt: "",
            title: "Approval",
          });
        }
        else {
          icons.push({
            class: "fa fa-check-square text-warning",
            // action: this.updateTicketStatus.bind(this, ticket, type, 2),
            action: this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 2),
            txt: "",
            title: "Mark Ack",
          });
        }
        icons.push({
          class: "fa fa-times text-danger",
          action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1),
          txt: "",
          title: "Mark Rejected",
        });
      }
      else if ([101, 102].includes(ticket._tktype) && !ticket._assigned_user_status && ticket._assigned_user_id == this.userService.loggedInUser.id) {
        icons.push({
          class: "fa fa-check-square text-warning",
          // action: this.ackTaskByAssignerBehalf.bind(this, ticket, type),
          action: this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 1),
          txt: "",
          title: "Mark Ack as Assigner",
        });
      }
      else if (ticket._tktype == 110 && ticket._mp_status == 0) {
        icons.push({
          class: "fa fa-check-square text-warning",
          // action: this.ackTaskByCcUser.bind(this, ticket, type),
          action: this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 1),
          txt: "", title: "Mark ack as meeting user",
        });
        icons.push({
          class: "fa fa-times text-danger",
          action: this.ackTaskByCcUser.bind(this, ticket, type, -1),
          txt: "",
          title: "Mark rejected as meeting user",
        });
      }
      else if (ticket._cc_user_id && !ticket._cc_status) {
        icons.push({
          class: "fa fa-check-square text-warning",
          // action: this.ackTaskByCcUser.bind(this, ticket, type),
          action: this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 1),
          txt: "",
          title: "Mark Ack as CC Task",
        });
      }
      else if ((ticket._tktype == 101 || ticket._tktype == 102) && ticket._project_id > 0 && ticket._pu_user_id && !ticket._pu_status) {
        icons.push({
          class: "fa fa-check-square text-warning",
          // action: this.ackTaskByProjectUser.bind(this, ticket, type),
          action: this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 1),
          txt: "",
          title: "Mark Ack as Project Task",
        });
      }
      else if (ticket._status == 5) {
        if (ticket._assigned_user_id == this.userService.loggedInUser.id) {
          icons.push({
            class: "fa fa-retweet",
            action: this.reactiveTicket.bind(this, ticket, type),
            txt: "",
            title: "Re-Active",
          });
          icons.push({
            class: "fa fa-check-square text-warning",
            // action: this.ackTaskByAssigner.bind(this, ticket, type),
            action: this.collapseUnreadTaskUpdateStatus.bind(this, ticket, type, 1),
            txt: "",
            title: "Mark Ack as Completed Task",
          });
        }
      }
    }
    else if (type == -9) {
      if (ticket._status == 3) {
        icons.push({
          class: "fa fa-play-circle",
          action: this.changeTicketStatusWithConfirm.bind(
            this,
            ticket,
            type,
            2
          ),
          txt: "",
          title: "Make Task as Unhold",
        });
      }
    }

    if ((type == 101 || type == -101) && [101, 102].includes(ticket._tktype)) {
      icons.push({
        class: "fa fa-link",
        action: this.createChildTicket.bind(this, ticket, type),
        txt: "",
        title: "add child task",
      });
    }

    if (ticket._status == 5 || ticket._status == -1) {
    } else {
      if (ticket._isremind == 1) {
        icons.push({
          class: "fa fa-bell isRemind",
          action: this.checkReminderSeen.bind(this, ticket, type),
          txt: "",
          title: null,
        });
      } else if (ticket._isremind == 2 && type != -8) {
        icons.push({
          class: "fa fa-bell reminderAdded",
          action: this.showReminderPopup.bind(this, ticket, type),
          txt: "",
          title: null,
        });
      } else {
        if (type != -8) {
          icons.push({
            class: "fa fa-bell",
            action: this.showReminderPopup.bind(this, ticket, type),
            txt: "",
            title: null,
          });
        }
      }

      if (ticket._is_star_mark) {
        icons.push({ class: "fa fa-star text-warning", action: this.starMarkOnTicket.bind(this, ticket, type), txt: "", title: "Star unmark", });
      } else {
        icons.push({ class: "fa fa-star text-muted", action: this.starMarkOnTicket.bind(this, ticket, type), txt: "", title: "Star mark", });
      }
    }

    // if (ticket._is_star_mark) {
    //   icons.push({ class: "fa fa-star text-warning", action: this.starMarkOnTicket.bind(this, ticket, type), txt: "", title: "Star unmark", });
    // } else {
    //   icons.push({ class: "fa fa-star text-muted", action: this.starMarkOnTicket.bind(this, ticket, type), txt: "", title: "Star mark", });
    // }

    return icons;
  }

  editTask(ticket, type, isProject = false) {
    console.log("type:", type);
    console.log("ticket",ticket);
    this.common.params = {
      userList: this.adminList,
      groupList: this.groupList,
      parentTaskId: ticket._refid,
      parentTaskDesc: ticket.task_desc,
      editType: (isProject) ? 3 : 1,
      editData: ticket,
      ticketId: ticket._tktid,
      ticketType: ticket._tktype,
       lastDate: ticket._lastdate,
       addtime: ticket.addtime,
     // lastDate: ticket.expdate,
      expDate: ticket.expdate,
      project: { id: (ticket.project.toLowerCase() != 'standalone') ? ticket._projectid : null, name: (ticket.project.toLowerCase() != 'standalone') ? ticket.project : null }
    };

    const activeModal = this.modalService.open(TaskNewComponent, {
      size: "md",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTaskByType(type);
        //   this.activeTab = 'TasksByMe';
      }
    });
  }

  deleteTicket(ticket, type) {
    if (ticket._refid) {
      let params = {
        taskId: ticket._refid,
      };
      this.common.params = {
        title: "Delete Ticket ",
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
              this.getTaskByType(type);
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
      this.common.showError("Task ID Not Available");
    }
  }

  reactiveTicket(ticket, type) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: 0,
      };
      this.common.params = {
        title: "Reactive Ticket",
        description:
          `<b>&nbsp;` + "Are You Sure To Reactive This Record" + `<b>`,
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
          this.updateTicketStatus(ticket, type, 0);
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
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
        assignedby: ticket._assignee_user_id,
        tabType: type
      };
      // if (status != -1) this.collapseUnreadTaskUpdateStatus(type, ticket, status);
      // console.log("params:", params, ticket, this.unreadTaskForMeList); return false;
      // this.common.loading++;
      this.api.post("AdminTask/updateTicketStatus", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            // this.common.showToast(res["msg"]);
            let startDate = null;
            let endDate = null;
            if (
              type == -102 &&
              this.searchTask.startDate &&
              this.searchTask.endDate
            ) {
              startDate = this.common.dateFormatter(
                this.searchTask.startDate
              );
              endDate = this.common.dateFormatter(this.searchTask.endDate);
              // this.getTaskByType(type, startDate, endDate);
            }
            // else {
            //   this.getTaskByType(type);
            // }
            if (type != -8) {
              this.getTaskByType(type);
            }
            if (this.activeTab == 'meeting') {
              this.getMeetingListByType(type);
            } else {
              // this.getTaskByType(type, startDate, endDate);
            }
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

  changeTicketStatusWithConfirm(ticket, type, status) {
    let stat : any;
    let up_time: any;
    console.log(status, 'status');
//     if(ticket.expdate != null && ticket.ticket_type == "Broadcast"){
//       let params =  "?taskId=" + ticket._refid;
//     this.api.get("AdminTask/getStatusByTask"+ params).subscribe(res => {
//       console.log("res data", res['data']);
//       if (res['code'] > 0) {
//         this.ccUser = res['data'] || [];
//         stat = this.ccUser[0].status;
//         up_time =this.ccUser[0].update_time;
//     } else {
//         this.common.showError(res['msg']);
//           }
//         },
//           err => {
//             this.common.showError();
//             console.log('Error: ', err);
//           });
// }
//  else{
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
  // }
  }

  ticketMessage(ticket, type) {
    // console.log("ticketMessage:", ticket, type);
    this.tableUnreadTaskForMeList.settings.arrow = false;
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
      if ((ticket._tktype == 101 || ticket._tktype == 102) && ticket._project_id > 0 && ticket._pu_user_id && !ticket._pu_status) {
        this.ackTaskByProjectUser(ticket, type);
      }
      // if (type == -8) {
      if (type !== -8 || (type == -8 && this.unreadTaskForMeList && this.unreadTaskForMeList.length <= 3)) {
        if (this.activeTab == 'meeting') {
          this.getMeetingListByType(type);
        } else {
          type ? this.getTaskByType(type) : null;
        }
      } else {
        let activeRowData = this.unreadTaskForMeList.find(task => task._tktid === ticket._tktid);
        if (ticket._cc_user_id && !ticket._cc_status) {
          activeRowData._cc_status = 1;
        }
        if ((ticket._tktype == 101 || ticket._tktype == 102) && ticket._project_id > 0 && ticket._pu_user_id && !ticket._pu_status) {
          activeRowData._pu_status = 1;
        }
        if (ticket._unreadcount > 0) {
          activeRowData._unreadcount = 0;
        }
        if ((ticket._status == 0 && ticket._assignee_user_id == this.userService.loggedInUser.id) || ([101, 102].includes(ticket._tktype) && !ticket._assigned_user_status && ticket._assigned_user_id == this.userService.loggedInUser.id) || ticket._isremind == 1 || ticket._is_star_mark == 1) {

        } else {
          this.unreadTaskForMeList = this.unreadTaskForMeList.filter(task => task._tktid !== ticket._tktid);
        }
        this.setTableUnreadTaskForMe(type);
      }
      // }else{
      //   type ? this.getTaskByType(type) : null;
      // }
      // type ? this.getTaskByType(type) : null;
      this.tableUnreadTaskForMeList.settings.arrow = true;
    });
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
        this.getTaskByType(-101);
        this.activeTab = "TasksByMe";
      }
    });
  }

  searchAllCompletedTask() {
    console.log("searchTask:", this.searchTask);
    if (this.searchTask.startDate && this.searchTask.endDate) {
      let startDate = this.common.dateFormatter(this.searchTask.startDate);
      let endDate = this.common.dateFormatter(this.searchTask.endDate);
      this.getTaskByType(-102, startDate, endDate);
    } else {
      this.common.showError("Select start date and end date");
    }
  }

  showReminderPopup(ticket, type) {
    this.common.params = {
      ticketId: ticket._tktid,
      remindertime: ticket._remindtime,
      title: "Add Reminder",
      btn: "Set Reminder",
    };
    const activeModal = this.modalService.open(ReminderComponent, {
      size: "sm",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTaskByType(type);
      }
    });
  }

  checkReminderSeen(ticket, type) {
    let params = {
      ticket_id: ticket._tktid,
    };
    this.common.loading++;
    this.api.post("AdminTask/checkReminderSeen", params).subscribe(
      (res) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.common.showToast(res["msg"]);
        this.getTaskByType(type);
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  // start :todo list
  getTodoTaskList(type) {
    this.tableTaskTodoList.data = {
      headings: {},
      columns: [],
    };
    let startDate = null, endDate = null;
    if (type == 1 && this.searchTask.startDate && this.searchTask.endDate) {
      startDate = this.common.dateFormatter(this.searchTask.startDate);
      endDate = this.common.dateFormatter(this.searchTask.endDate);
    }
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("AdminTask/getTodoTaskList.json" + params).subscribe(
      (res) => {
        if (res["code"] > 0) {
          this.taskTodoList = res["data"] || [];
          this.setTableTaskTodoList();
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        console.error(err);
        this.common.showError();
      }
    );
  }

  setTableTaskTodoList() {
    this.tableTaskTodoList.data = {
      headings: this.generateHeadingsTaskTodoList(),
      columns: this.getTableColumnsTaskTodoList(),
    };
    return true;
  }

  generateHeadingsTaskTodoList() {
    let headings = {};
    for (var key in this.taskTodoList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
        if (key === "due_date") {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumnsTaskTodoList() {
    let columns = [];
    this.taskTodoList.map((task) => {
      let column = {};
      for (let key in this.generateHeadingsTaskTodoList()) {
        if (key.toLowerCase() == "action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsToDo(task)
          };
        } else if (key.toLowerCase() == "completed") {
          column[key] = {
            value: task[key],
            action: this.updateTodoTask.bind(this, task),
            isCheckbox: true,
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: task[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: task[key], class: "black", action: "" };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  actionIconsToDo(task) {
    let icons = [
      { class: "fa fa-edit", action: this.editTodoTask.bind(this, task), txt: "", },
    ];
    return icons;
  }

  resetTaskTodoForm() {
    this.taskTodoForm = {
      taskTodoId: null,
      desc: "",
      date: this.common.getDate(),
      isUrgent: false,
      duration: null,
      requestId: null
    };
  }

  editTodoTask(task) {
    this.taskTodoForm = {
      taskTodoId: null,
      desc: task.task_desc,
      date: new Date(task.due_date),
      isUrgent: (task.high_priority) ? true : false,
      duration: (task.duration) ? new Date() : null,
      requestId: task._id
    };
    if (task.duration) {
      let time = task.duration.split(':');
      this.taskTodoForm.duration.setHours((time.length) ? parseInt(time[0]) : 0);
      this.taskTodoForm.duration.setMinutes((time.length) ? parseInt(time[1]) : 0);
      this.taskTodoForm.duration.setSeconds(0);
    }
  }

  updateTodoTask(task, type = 0) {
    if (task._id) {
      let params = {
        todoTaskId: task._id,
        status: task._status == 1 ? 0 : 1,
      };
      this.common.loading++;
      this.api.post("AdminTask/updateTodoTask", params).subscribe(
        (res) => {
          this.common.loading--;
          if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
          this.common.showToast(res["msg"]);
          this.getTodoTaskList(type);
        }, (err) => {
          this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  saveTaskTodo(type = 0) {
    if (this.taskTodoForm.desc == "") {
      return this.common.showError("Description is missing");
    } else {
      const params = {
        date: this.taskTodoForm.date ? this.common.dateFormatter(this.taskTodoForm.date) : null,
        desc: this.taskTodoForm.desc,
        isUrgent: this.taskTodoForm.isUrgent,
        taskTodoId: this.taskTodoForm.taskTodoId,
        duration: (this.taskTodoForm.duration) ? this.common.timeFormatter(this.taskTodoForm.duration) : null,
        requestId: (this.taskTodoForm.requestId > 0) ? this.taskTodoForm.requestId : null
      };
      this.common.loading++;
      this.api.post("AdminTask/addTodoTask", params).subscribe(res => {
        this.common.loading--;
        if (res["code"] > 0) {
          if (res["data"][0]["y_id"] > 0) {
            this.common.showToast(res["msg"]);
            this.todoAddList = false;
            this.getTodoTaskList(type);
            this.resetTaskTodoForm();
          } else {
            this.common.showError(res["msg"]);
          }
        } else {
          this.common.showError(res["msg"]);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
      );
    }
  }
  //  end: todo list

  actionIconsForUnreadTask(ticket, type) {
    let icons = [
      {
        class: "fa fa-check-square text-warning",
        action: this.ackTaskByCcUser.bind(this, ticket, type, 2),
        txt: "",
        title: "Mark Ack",
      },
    ];
    return icons;
  }

  ackTaskByCcUser(ticket, type, status = 1) {
    console.log(ticket)
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
        status: status,
        userName: this.userService.loggedInUser.name,
        expdate: ticket._expdate,
        assignedby: ticket._assignee_user_id,
      };
      // this.unreadTaskForMeList = this.unreadTaskForMeList.filter(ele => { return ele._tktid != params.ticketId });
      // this.setTableUnreadTaskForMe(type);
      // console.log("params:", params, ticket, this.unreadTaskForMeList); return false;
      // if (status != -1) this.collapseUnreadTaskUpdateStatus(type, ticket, status);
      // this.common.loading++;
      this.api.post("AdminTask/ackTaskByCcUser", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            // this.common.showToast(res["msg"]);
            // if (type === -8 && (this.unreadTaskForMeList && this.unreadTaskForMeList.length >= 3)) {
            //   let activeRowData = this.unreadTaskForMeList.find(task => task._tktid === ticket._tktid);
            //   if (ticket._cc_user_id && !ticket._cc_status) {
            //     activeRowData._cc_status = 1;
            //   }
            //   if (ticket._tktype == 110 && !ticket._mp_status) {
            //     activeRowData._mp_status = (status) ? status : 1;
            //   }
            //   if ((ticket._status == 0 && ticket._assignee_user_id == this.userService.loggedInUser.id) || ([101, 102].includes(ticket._tktype) && !ticket._assigned_user_status && ticket._assigned_user_id == this.userService.loggedInUser.id) || ticket._isremind == 1 || ticket._is_star_mark == 1 || ticket._unreadcount > 0 || ([101, 102].includes(ticket._tktype) && ticket._project_id > 0 && ticket._pu_user_id && !ticket._pu_status)) {

            //   } else {
            //     this.unreadTaskForMeList = this.unreadTaskForMeList.filter(task => task._tktid !== ticket._tktid);
            //   }
            //   this.setTableUnreadTaskForMe(type);
            // } else {
            //   this.getTaskByType(type)
            // };
            if(ticket.status == 0){
              ticket.status = 2;
            }
            if (status == -1) this.getTaskByType(type);
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

  collapseUnreadTaskUpdateStatus(ticket, type, status) {
    console.log(ticket)
    let activeRowData = this.unreadTaskForMeList.find(task => task._tktid === ticket._tktid);
     if (activeRowData._isremind == 1 || activeRowData._is_star_mark == 1) {
     } else {
       this.unreadTaskForMeList = this.unreadTaskForMeList.filter(task => task._tktid !== ticket._tktid);
     }

     console.log(this.unreadTaskForMeList)
     console.log(activeRowData)
     if (ticket._cc_user_id && !ticket._cc_status) {
       activeRowData._cc_status = 1;
       console.log('Mark Ack as CC Task : 1');
       this.ackTaskByCcUser(ticket, type);
     }
     if (ticket._tktype == 110 && !ticket._mp_status) {
       activeRowData._mp_status = (status) ? status : 1;
       console.log('Mark ack as meeting user : 2');
       this.ackTaskByCcUser(ticket, type);
     }
     if (ticket._status == 0 && ticket._assignee_user_id == this.userService.loggedInUser.id) {
       activeRowData._status = 2;
       console.log('Mark Ack : 3');
       this.updateTicketStatus(ticket, type, 2);
     }
    if ([101, 102].includes(ticket._tktype) && !ticket._assigned_user_status && ticket._assigned_user_id == this.userService.loggedInUser.id) {
      activeRowData._assigned_user_status = 1;
      console.log('Mark Ack as Assigner : 4');
      this.ackTaskByAssignerBehalf(ticket, type);
    }
    if ([101, 102].includes(ticket._tktype) && ticket._project_id > 0 && ticket._pu_user_id && !ticket._pu_status) {
      activeRowData._pu_status = 1;
      console.log('Mark Ack as Project Task : 5');
      this.ackTaskByProjectUser(ticket, type)
    }
    if (ticket._status == 5 && ticket._assigned_user_id == this.userService.loggedInUser.id) {
      activeRowData._status = 1;
      console.log('Mark Ack as Completed Task : 6');
      this.ackTaskByAssigner(ticket, type);
    }

    console.log('edited:', activeRowData)

    this.setTableUnreadTaskForMe(type);
    if (type === -8 && (this.unreadTaskForMeList && this.unreadTaskForMeList.length >= 3)) {
      // this.setTableUnreadTaskForMe(type);
    } else {
      this.getTaskByType(type)
    };
  }

  ackTaskByProjectUser(ticket, type) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        taskId: ticket._refid,
        projectId: ticket._project_id,
      };
      console.log("ackTaskByProjectUser:", params);
      // this.common.loading++;
      this.api.post("AdminTask/ackTaskByProjectUser", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            // this.common.showToast(res["msg"]);
            // // if (type === -8 && (this.unreadTaskForMeList && this.unreadTaskForMeList.length >= 3)) {
            // //   let activeRowData = this.unreadTaskForMeList.find(task => task._tktid === ticket._tktid);
            // //   if ((ticket._tktype == 101 || ticket._tktype == 102) && ticket._project_id > 0 && ticket._pu_user_id && !ticket._pu_status) {
            // //     activeRowData._pu_status = 1;
            // //   }
            // //   if ((ticket._status == 0 && ticket._assignee_user_id == this.userService.loggedInUser.id) || ([101, 102].includes(ticket._tktype) && !ticket._assigned_user_status && ticket._assigned_user_id == this.userService.loggedInUser.id) || ticket._isremind == 1 || ticket._is_star_mark == 1 || ticket._unreadcount > 0 || (ticket._cc_user_id && !ticket._cc_status)) {

            // //   } else {
            // //     this.unreadTaskForMeList = this.unreadTaskForMeList.filter(task => task._tktid !== ticket._tktid);
            // //   }
            // //   this.setTableUnreadTaskForMe(type);
            // // } else {
            // //   this.getTaskByType(type)
            // // }
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

  ackTaskByAssigner(ticket, type) {
    if (ticket._tktid && ticket._refid) {
      let params = {
        ticketId: ticket._tktid,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
      };
      this.unreadTaskForMeList = this.unreadTaskForMeList.filter(ele => { return ele._tktid != params.ticketId });
      this.setTableUnreadTaskForMe(type);
      // console.log("params:", params, ticket, this.unreadTaskForMeList); return false;
      // this.common.loading++;
      this.api.post("AdminTask/ackTaskByAssigner", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            // this.common.showToast(res["msg"]);
            // this.getTaskByType(type);
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
      this.common.showError("Task ID Not Available");
    }
  }

  ackTaskByAssignerBehalf(ticket, type) {
    if (ticket._tktid && ticket._refid) {
      let params = {
        ticketId: ticket._tktid,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
      };
      // this.collapseUnreadTaskUpdateStatus(type, ticket, status);
      // console.log("params:", params, ticket, this.unreadTaskForMeList); return false;
      // this.common.loading++;
      this.api.post("AdminTask/ackTaskByAssignerBehalf", params).subscribe(res => {
        // this.common.loading--;
        if (res["code"] > 0) {
          // this.common.showToast(res["msg"]);
          // this.getTaskByType(type);
        } else {
          this.common.showError(res["msg"]);
        }
      }, err => {
        // this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
      );
    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  openSchedukedTaskMasterModal() {
    this.tableUnreadTaskForMeList.settings.arrow = false;
    this.common.params = null;
    this.common.params = {
      data: null,
      adminList: this.adminList,
      groupList: this.groupList,
      departmentList: this.departmentList,
      title: "Add Schedule task",
      button: "Save",
    };
    const activeModal = this.modalService.open(TaskScheduleMasterComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getScheduledTask();
        this.activeTab = "scheduleMaster";
      }
      this.tableUnreadTaskForMeList.settings.arrow = true;
    });
  }

  addScheduleTaskparam(task, type) {
    console.log("type:", type);
    this.common.params = {
      taskId: task._id,
      title: "Schedule task action",
      button: "Save",
    };
    const activeModal = this.modalService.open(TaskScheduleNewComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => { });
  }

  getScheduledTask() {
    this.common.loading++;
    this.api.get("AdminTask/getScheduledTask?type=1").subscribe(
      (res) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.resetSmartTableData();
        this.scheduleMasterList = res["data"] || [];
        this.setTableScheduleMaster();
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  setTableScheduleMaster() {
    this.tableScheduleMaster.data = {
      headings: this.generateHeadingsScheduleMaster(),
      columns: this.getTableColumnsScheduleMaster(),
    };
    return true;
  }

  generateHeadingsScheduleMaster() {
    let headings = {};
    for (var key in this.scheduleMasterList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }

  getTableColumnsScheduleMaster() {
    let columns = [];
    this.scheduleMasterList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsScheduleMaster()) {
        if (key == "admin_name") {
          column[key] = {
            value: ticket[key],
            class: "admin",
            isHTML: true,
            action: "",
          };
        } else if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsMaster(ticket),
          };
        } else if (key == "isactive") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "isactive",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = {
            value:
              key == "due_time"
                ? this.common.findRemainingTime(ticket[key])
                : ticket[key],
            class: "black",
            action: "",
          };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }

  actionIconsMaster(task) {
    let icons = [
      { class: "fa fa-edit", action: this.editScheduleTask.bind(this, task) },
      {
        class: "fa fa-calendar-alt",
        action: this.addScheduleTaskparam.bind(this, task),
      },
    ];
    return icons;
  }

  editScheduleTask(task) {
    this.common.params = null;
    this.common.params = {
      data: task,
      adminList: this.adminList,
      groupList: this.groupList,
      departmentList: this.departmentList,
      title: "Add Schedule task",
      button: "Save",
    };
    const activeModal = this.modalService.open(TaskScheduleMasterComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getScheduledTask();
        this.activeTab = "scheduleMaster";
      }
    });
  }

  getSearchTask(searchText, searchUserId) {
    let params = "?search=" + searchText + "&searchUserId=" + searchUserId;
    if ((searchText && searchText.trim != "") || searchUserId > 0) {
      this.common.loading++;
      this.api.get("AdminTask/searchTask" + params).subscribe(
        (res) => {
          this.common.loading--;
          this.searchTaskList = res["data"];
          if (res["code"] == 1) {
            if (this.searchTaskList && this.searchTaskList.length > 0) {
              this.openSearchTaskModal();
              this.setTableSearchTaskList();
            } else {
              this.common.showToast("No data found");
            }
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
      this.common.showError("Search text missing");
    }
  }
  openSearchTaskModal() {
    document.getElementById("searchTaskModal").style.display = "block";
  }

  closeSearchTaskModal() {
    document.getElementById("searchTaskModal").style.display = "none";
  }

  setTableSearchTaskList() {
    this.tableSearchTaskList.data = {
      headings: this.generateHeadingsSearchTaskList(),
      columns: this.getTableColumnsSearchTaskList(),
    };
    return true;
  }

  generateHeadingsSearchTaskList() {
    let headings = {};
    for (var key in this.searchTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }

  getTableColumnsSearchTaskList() {
    let columns = [];
    this.searchTaskList.map((ticket) => {
      let column = {};
      for (let key in this.generateHeadingsSearchTaskList()) {
        if (key == "Action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsSearchTask(ticket),
          };
        } else if (key == "subject" || key == "task_subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: ticket["_task_desc"],
          };
        } else if (key == "high_priority") {
          column[key] = {
            value: "",
            isHTML: true,
            icons: ticket[key]
              ? [
                {
                  class: "fa fa-check text-success",
                  action: null,
                  title: "high-priority",
                },
              ]
              : "",
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = {
            value:
              key == "time_left"
                ? this.common.findRemainingTime(ticket[key])
                : ticket[key],
            class: "black",
            action: "",
          };
        }
        column["style"] = {
          background: this.common.taskStatusBg(ticket._status),
        };
      }
      columns.push(column);
    });
    return columns;
  }

  actionIconsSearchTask(ticket) {
    let type = null;
    let icons = [
      {
        class: "fas fa-comments",
        action: this.ticketMessage.bind(this, ticket, type),
        txt: "",
        title: null,
      },
    ];
    if (ticket._unreadcount > 0) {
      icons = [
        {
          class: "fas fa-comments new-comment",
          action: this.ticketMessage.bind(this, ticket, type),
          txt: ticket._unreadcount,
          title: null,
        },
      ];
    } else if (ticket._unreadcount == -1) {
      icons = [
        {
          class: "fas fa-comments no-comment",
          action: this.ticketMessage.bind(this, ticket, type),
          txt: "",
          title: null,
        },
      ];
    }
    return icons;
  }

  filterTaskBySubTab(type, subTabType) {
    if (type == 101) {
      let selectedList = [];
      if (subTabType == 1) {
        //normal
        selectedList = this.normalTaskListAll.filter((x) => {
          return [101, 102].includes(x._tktype);
        });
      } else if (subTabType == 2) {
        //scheduled
        selectedList = this.normalTaskListAll.filter((x) => {
          return x._tktype == 103;
        });
      } else if (subTabType == 3) {
        //hold
        selectedList = this.normalTaskListAll.filter((x) => {
          return x._status == 3;
        });
      } else if (subTabType == 4) {
        //leave
        selectedList = this.normalTaskListAll.filter((x) => {
          return (x._tktype == 104 || x._tktype == 111 || x._tktype == 112 || x._tktype == 113 || x._tktype == 115);
        });
      } else {
        //all
        selectedList = this.normalTaskListAll;
      }
      this.normalTaskList = selectedList.length > 0 ? selectedList : [];
      this.setTableNormal(type);
    } else if (type == -101) {
      let selectedList = [];
      if (subTabType == 1) {
        //normal
        selectedList = this.normalTaskByMeListAll.filter((x) => {
          return [101, 102].includes(x._tktype);
        });
      } else if (subTabType == 2) {
        //scheduled
        selectedList = this.normalTaskByMeListAll.filter((x) => {
          return x._tktype == 103;
        });
      } else if (subTabType == 3) {
        //hold
        selectedList = this.normalTaskByMeListAll.filter((x) => {
          return x._status == 3;
        });
      } else if (subTabType == 4) {
        //leave
        selectedList = this.normalTaskByMeListAll.filter((x) => {
          return (x._tktype == 104 || x._tktype == 111 || x._tktype == 112 || x._tktype == 113 || x._tktype == 115);
        });
      } else {
        //all
        selectedList = this.normalTaskByMeListAll;
      }
      this.normalTaskByMeList = selectedList.length > 0 ? selectedList : [];
      this.setTableNormalTaskByMe(type);
    } else if (type == -5) {
      console.log('in -5')
      let selectedList = [];
      if (subTabType == 4) {
        //leave
        selectedList = this.ccTaskListAll.filter((x) => {
          return (x._tktype == 104 || x._tktype == 111 || x._tktype == 112 || x._tktype == 113 || x._tktype == 115);
        });
      } else {
        //all
        selectedList = this.ccTaskListAll;
      }
      this.ccTaskList = selectedList.length > 0 ? selectedList : [];
      this.setTableCCTask(type);
    }
  }

  starMarkOnTicket(ticket, type) {
    let params = {
      ticketId: ticket._tktid,
      isChecked: (ticket._is_star_mark) ? true : false
    };
    this.common.loading++;
    this.api.post("AdminTask/starMarkOnTicket", params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.getTaskByType(type);
        this.common.showToast(res['msg']);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
  }

  // start: meeting
  getMeetingListByType(type, startDate = null, endDate = null) {
    this.activeSabTab = type;
    this.common.loading++;
    if (!type && this.searchTask.startDate && this.searchTask.endDate) {
      startDate = this.common.dateFormatter(this.searchTask.startDate);
      endDate = this.common.dateFormatter(this.searchTask.endDate);
    }
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Admin/getMeetingListByType" + params).subscribe(
      (res) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        console.log("data", res["data"]);
        this.resetSmartTableData();
        this.meetingList = res["data"] || [];
        this.setTableMeeting(type);
        // if (type == 101) {}
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }
  // start cc task list
  setTableMeeting(type) {
    this.tableMeeting.data = {
      headings: this.generateHeadingsMeeting(),
      columns: this.getTableColumnsMeeting(type),
    };
    return true;
  }

  generateHeadingsMeeting() {
    let headings = {};
    for (var key in this.meetingList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = {
          title: key,
          placeholder: this.common.formatTitle(key),
        };
      }
    }
    return headings;
  }
  getTableColumnsMeeting(type) {
    let columns = [];
    this.meetingList.map((ticket) => {
      ticket["task_subject"] = ticket["subject"];
      ticket["_task_desc"] = ticket["_desc"];
      let column = {};
      for (let key in this.generateHeadingsMeeting()) {
        if (key.toLowerCase() == "action") {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsMeeting(ticket, type),
          };
        } else if (key == "subject") {
          column[key] = {
            value: ticket[key],
            class: "black",
            action: "",
            isTitle: true,
            title: `${ticket["_desc"] ? ticket["_desc"] : ''}\n${ticket['schedule_time'] ? ticket['schedule_time'] : ''}\n${ticket['duration'] ? ticket['duration'] : ''}\n${ticket['_link'] ? ticket['_link'] : ''}`,
          };
        } else if (key == "info") {
          column[key] = {
            value: !ticket['_room_id'] ? ((ticket['_link']) ? this.common.varifyLink(ticket[key], false) : null) : ticket[key],
            // class: !ticket['_room_id'] ? "blue" : "black",
            isHTML: true,
            // action: !ticket['_room_id'] ? this.jumpToLink.bind(this, ticket['info']) : null,
          };
        } else {
          column[key] = { value: ticket[key], class: "black", action: "" };
        }
        if (ticket._tktid > 0) {
          column['rowActions'] = { 'click': this.ticketMessage.bind(this, ticket, type) };
        } else {
          column['rowActions'] = { 'click': this.showTodoList.bind(this, 2), "stopPropagation": true };
        }
      }
      columns.push(column);
    });
    return columns;
  }
  // end cc task list

  jumpToLink(link) {
    window.open(link, '_blank');
  }

  showTodoList(type) {
    this.todoVisi = !this.todoVisi;
    if (this.todoVisi) {
      this.getTodoTaskList(2);
    }
  }

  actionIconsMeeting(ticket, type) {
    let icons = [];
    if (ticket._tktid > 0) {
      icons = [
        {
          class: "fas fa-comments",
          action: this.ticketMessage.bind(this, ticket, type),
          txt: "",
          title: null,
        },
      ];
      if (ticket._unreadcount > 0) {
        icons = [
          {
            class: "fas fa-comments new-comment",
            action: this.ticketMessage.bind(this, ticket, type),
            txt: ticket._unreadcount,
            title: null,
          },
        ];
      } else if (ticket._unreadcount == -1) {
        icons = [
          {
            class: "fas fa-comments no-comment",
            action: this.ticketMessage.bind(this, ticket, type),
            txt: "",
            title: null,
          },
        ];
      }
    }

    if ((type == 1 || type == 2) && [ticket._host, ticket._aduserid].includes(this.userService.loggedInUser.id) && ticket._status != 5 && ticket._tktid > 0) {
      if (type == 1) {
        icons.push({ class: "fas fa-edit", action: this.editMeeting.bind(this, ticket, type, true), txt: "", title: "Edit Meeting" });
        if (ticket.schedule_time && new Date() >= new Date(ticket.schedule_time)) {
          icons.push({ class: "fa fa-thumbs-up text-success", action: (ticket['_host'] == this.userService.loggedInUser.id) ? this.getUserActivityUpdate.bind(this, ticket, type, 5) : this.followUpMeeting.bind(this, ticket, type, 5), txt: "", title: "Mark Completed" });
        }
        // icons.push({class: "fas fa-trash-alt",action: this.deleteMeetingWithConfirm.bind(this, ticket, type),txt: "",title: "Delete Task"});
        icons.push({ class: "fa fa-times text-danger", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1), txt: "", title: "Mark rejected" });
      }
      if (type == 2) {
        if (!ticket.schedule_time) {
          icons.push({ class: "fas fa-edit", action: this.editMeeting.bind(this, ticket, type, true), txt: "", title: "Edit Meeting" });
          icons.push({ class: "fa fa-times text-danger", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1), txt: "", title: "Mark rejected" });
        } else if (ticket.schedule_time && new Date() >= new Date(ticket.schedule_time)) {
          icons.push({ class: "fa fa-thumbs-up text-success", action: (ticket['_host'] == this.userService.loggedInUser.id) ? this.getUserActivityUpdate.bind(this, ticket, type, 5) : this.followUpMeeting.bind(this, ticket, type, 5), txt: "", title: "Mark Completed" });
        }
      }
    }
    if (type == 0 && [-1, 5, 2].includes(ticket._status) && [ticket._host, ticket._aduserid].includes(this.userService.loggedInUser.id) && ticket._tktid > 0) {
      icons.push({ class: "fa fa-retweet", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 0), txt: "", title: "Re-Active" });
      icons.push({ class: "fa fa-caret-square-o-down", action: this.editMeeting.bind(this, ticket, type, false), txt: "", title: "Follow Up" });
    }
    return icons;
  }

  meetingAttendiesList = [];
  holdForFollowUp = {};
  getUserActivityUpdate(ticket, type, status) {
    this.holdForFollowUp = { ticket: ticket, type: type, status: status };
    let params = {
      ticketId: ticket._tktid,
      ticketType: 110
    }
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

  deleteMeetingWithConfirm(ticket, type) {
    if (ticket._refid) {
      let preTitle = "Delete";
      this.common.params = {
        title: preTitle + " Meeting ",
        description:
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Meeting" + `<b>`,
        isRemark: false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then((data) => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.deleteMeeting(ticket, type, data.remark);
        }
      });
    } else {
      this.common.showError("Invalid meeting");
    }
  }

  deleteMeeting(ticket, type, remark = null) {
    if (ticket._tktid) {
      let params = {
        subject: ticket.subject,
        detail: ticket._desc,
        roomId: (ticket._room_id) ? ticket._room_id : 1,
        host: ticket._host,
        userId: (ticket._users) ? JSON.stringify(ticket._users) : JSON.stringify([{ "id": ticket._host }]),
        type: 0,
        time: this.common.dateFormatter(ticket.schedule_time),
        duration: ticket.duration,
        buzz: (ticket.buzz) ? ticket.buzz : false,
        requestId: ticket._refid,
        isDelete: 1
      }
      // console.log("add meeting:",params); return false;
      this.common.loading++;
      this.api.post('Admin/saveMeetingDetail', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] === 1) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.getMeetingListByType(type);
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
      })
    } else {
      this.common.showError("Invalid request");
    }
  }
  // end: meeting

  editMeeting(ticket, type, isEdit) {
    console.log("🚀 ~ file: task.component.ts ~ line 3333 ~ TaskComponent ~ editMeeting ~ ticket", ticket)
    this.tableUnreadTaskForMeList.settings.arrow = false;
    this.common.params = {
      isEdit: isEdit,
      meetingData: ticket,
      userList: this.adminList,
      groupList: this.groupList,
      formType: 2,
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
        this.activeTab = "meeting";
        if (!isEdit && type != 0) {
          this.updateTicketStatus(ticket, type, 5);
        } else {
          this.getMeetingListByType(1);
        }
      }
      this.tableUnreadTaskForMeList.settings.arrow = true;
    });
  }


  openConfirmAlert(ticket, type) {
    this.common.params = {
      title: 'Approval ',
      description: `<b>&nbsp;` + 'Do you Want Approve this Leave Request' + `<b>`,
      btn1: "Approved",
      btn2: "Later"
    }

    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      console.log("data---", data);
      if (data.response) {
        this.updateTicketStatus(ticket, type, 5);
      }
      else {
        this.updateTicketStatus(ticket, type, 2);
      }
      let activeRowData = this.unreadTaskForMeList.find(task => task._tktid === ticket._tktid);
      if (activeRowData._isremind == 1 || activeRowData._is_star_mark == 1) {
      } else {
        this.unreadTaskForMeList = this.unreadTaskForMeList.filter(task => task._tktid !== ticket._tktid);
      }
      this.setTableUnreadTaskForMe(type);
      if (type === -8 && (this.unreadTaskForMeList && this.unreadTaskForMeList.length >= 3)) {
        // this.setTableUnreadTaskForMe(type);
      } else {
        this.getTaskByType(type)
      };
    });
  }

}
