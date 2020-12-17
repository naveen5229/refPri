import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReminderComponent } from '../../modals/reminder/reminder.component';
import { TicketChatboxComponent } from '../../modals/ticket-modals/ticket-chatbox/ticket-chatbox.component';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { TicketClosingFormComponent } from '../../modals/ticket-modals/ticket-form-field/ticket-closing-form.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {
  loginUserId = this.userService._details.id;
  tpId = null;
  activeTab = null;
  adminList = [];
  tpList = [];
  allOpenTicket = [];
  groupList = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  searchData = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }

  forwardTicketObject = {
    ticketAllocationId: null,
    tktId: null,
    userId: { id: null, name: '' },
    remark: null,
    tabType: null
  }

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
    this.common.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
    this.resetSmartTableData();
    this.activeTab = null;
  }
  ngOnInit() {}

  
  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      if (res['code'] > 0) {
        this.adminList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups').subscribe(res => {
      if (res["code"] > 0) {
        let groupList = res['data'] || [];
        this.groupList = groupList.map((x) => {
          return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
        });
      } else {
        this.common.showError(res["msg"]);
      }
    },err => {
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      let tpList = res['data'] || [];
      this.tpList = tpList.filter(ele => {
        return (ele._is_active)
      })
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getTicketByType(type, startDate = null, endDate = null) {
    if(!this.tpId){
      this.common.showError("Ticket Process is missing");
      return false;
    }
    this.activeTab = "allOpen";
    if (this.searchData.startDate && this.searchData.endDate) {
      startDate = this.common.dateFormatter(this.searchData.startDate);
      endDate = this.common.dateFormatter(this.searchData.endDate);
    }
    this.resetSmartTableData();
    let params = "?tpId=" + this.tpId + "&startDate=" + startDate + "&endDate=" + endDate;
    this.common.loading++;
    this.api.get("Ticket/getDynamicDashboardData" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
          this.allOpenTicket = res['data'] || [];
          this.setTableAllOpenTicket(type);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  resetSmartTableData() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  // start: allocatedTkt
  setTableAllOpenTicket(type) {
    this.table.data = {
      headings: this.generateHeadingsAllOpenTicket(),
      columns: this.getTableColumnsAllOpenTicket(type)
    };
    return true;
  }

  generateHeadingsAllOpenTicket() {
    let headings = {};
    for (var key in this.allOpenTicket[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsAllOpenTicket(type) {
    let columns = [];
    this.allOpenTicket.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAllOpenTicket()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: "black", action: "", };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: allocatedTkt

  actionIcons(ticket, type) {
    let icons = [];
    if (type == 107) {
      icons.push({ class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: 'Chat Box', });

      if (ticket._unreadcount > 0) {
        icons = [{ class: "fas fa-comments new-comment", action: this.ticketMessage.bind(this, ticket, type), txt: ticket._unreadcount, title: 'Chat Box', },];
      } else if (ticket._unreadcount == -1) {
        icons = [{ class: "fas fa-comments no-comment", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: 'Chat Box', },];
      }

      if (ticket._status == 5 || ticket._status == -1) {
      } else {
        if (ticket._isremind == 1 && (type == 107)) {
          icons.push({ class: "fa fa-bell isRemind", action: this.checkReminderSeen.bind(this, ticket, type), txt: "", title: 'Reminder', });
        } else if (ticket._isremind == 2 && (type != 102)) {
          icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, ticket, type), txt: "", title: 'Reminder', });
        } else {
          if (type != 102) {
            icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, ticket, type), txt: "", title: 'Reminder', });
          }
        }
      }
      icons.push({ class: "fas fa-history", action: this.ticketHistory.bind(this, ticket, type), txt: '', title: "History" });
      icons.push({ class: "fas fa-share", action: this.openForwardTicket.bind(this, ticket, type), txt: '', title: "Forward Ticket" });
      if (type == 107) {
        if (ticket._allocated_user == this.loginUserId && !ticket._status) {
          icons.push({ class: "fa fa-check-square text-warning", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 2), txt: "", title: "Mark Ack", });
        } else if (ticket._allocated_user == this.loginUserId && ticket._status == 2) {
          icons.push({ class: "fa fa-thumbs-up text-success", action: (ticket._close_form > 0) ? this.openTicketFormData.bind(this, ticket, type, 5,1) : this.changeTicketStatusWithConfirm.bind(this, ticket, type, 5), txt: "", title: "Mark Completed", });
        }
        if ((ticket._allocated_user == -1 && ticket._status == 0) || ticket._status === null) {
          icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.claimTicket.bind(this, ticket, type), txt: '', title: "Claim Ticket" });
        }
      }
      icons.push({ class: "fas fa-plus-square", action: this.openTicketFormData.bind(this, ticket, type, null,2), txt: '', title: "Update Primary Info" });
    }
    icons.push({ class: "fa fa-info-circle", action: this.openInfoModal.bind(this, ticket, type, 0), txt: '', title: "Ticket Info" });

    return icons;
  }

  
  ticketMessage(ticket, type) {
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

  showReminderPopup(ticket, type) {
    this.common.params = {
      ticketId: ticket._ticket_id,
      remindertime: ticket._remindtime,
      title: "Add Reminder",
      btn: "Set Reminder",
      fromPage: "ticket"
    };
    const activeModal = this.modalService.open(ReminderComponent, { size: "sm", container: "nb-layout", backdrop: "static", });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTicketByType(type);
      }
    });
  }

  checkReminderSeen(ticket, type) {
    let params = {
      ticketId: ticket._ticket_id,
    };
    this.common.loading++;
    this.api.post("Ticket/checkTicketReminderSeen", params).subscribe((res) => {
      this.common.loading--;
      this.common.showToast(res["msg"]);
      this.getTicketByType(type);
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
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

  changeTicketStatusWithConfirm(ticket, type, status) {
    // console.log(ticket, 'status');
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
        console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(ticket, type, status, data.remark);
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }
  
  updateTicketStatus(ticket, type, status, remark = null) {
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

  claimTicket(ticket, type) {
    let params = {
      tktId: ticket._ticket_id,
      userId: this.loginUserId
    };
    this.common.loading++;
    this.api.post("Ticket/addTicketAllocation", params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg'])
      }
      this.getTicketByType(type);
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
  }

  openTicketFormData(ticket, type, status,refType,isDisabled) {
    let title = (refType==2) ? 'Primary Info Fields' : 'Ticket Closing Form';
    let actionData = {
      ticketId: ticket._ticket_id,
      refId: ticket._tpid,
      refType: refType,
      isDisabled: (isDisabled) ? true : false
    };
    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(TicketClosingFormComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        if(refType==1){
          if(data.isContinue){
            this.updateTicketStatus(ticket, type, status, null);
          }else{
            this.changeTicketStatusWithConfirm(ticket, type, status)
          }
        }
      }
    });
  }

  openInfoModal(ticket, type, refType) {
    this.openTicketFormData(ticket, type, null,refType,true)
  }

  forwardTicket(type) {
    let params = {
      ticketAllocationId: this.forwardTicketObject.ticketAllocationId,
      ticketId: this.forwardTicketObject.tktId,
      userid: this.forwardTicketObject.userId.id,
      remark: this.forwardTicketObject.remark
    };
    this.common.loading++;
    this.api.post("Ticket/forwardTicket", params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeForwardTicket();
          this.getTicketByType(type);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  openForwardTicket(ticket, type) {
    this.forwardTicketObject.ticketAllocationId = ticket._ticket_allocation_id;
    this.forwardTicketObject.tktId = ticket._ticket_id;
    this.forwardTicketObject.tabType = type;
    console.log("forwardTicketObject:",this.forwardTicketObject)
    document.getElementById('forwardTicket').style.display = 'block';
  }

  closeForwardTicket() {
    document.getElementById('forwardTicket').style.display = 'none';
    this.resetforwardTicket()
  }

  resetforwardTicket() {
    this.forwardTicketObject = {
      ticketAllocationId: null,
      tktId: null,
      userId: { id: null, name: null },
      remark: null,
      tabType: null
    }
  }

}
