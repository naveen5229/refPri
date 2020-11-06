import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDataTableComponent } from '../../modals/process-modals/form-data-table/form-data-table.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';
import { TicketChatboxComponent } from '../../modals/ticket-modals/ticket-chatbox/ticket-chatbox.component';
import { AddExtraTimeComponent } from '../../modals/ticket-modals/add-extra-time/add-extra-time.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TicketClosingFormComponent } from '../../modals/ticket-modals/ticket-form-field/ticket-closing-form.component';
// import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  loginUserId = this.userService._details.id;
  activeTab = 'allocatedTkt';
  adminList = [];
  tpList = [];
  allocatedTkt = [];
  unallocatedTkt = [];
  unreadTkt = [];
  unassignedTkt = [];
  completedTkt = [];
  ccTkt = [];
  addedByMeTkt = [];
  groupList = [];
  tableAllocatedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnallocatedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnreadTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnassignedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableCompletedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableCcTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableAddedByMeTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  ticketHistoryList = [];
  tableTicketHistory = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  allOpenTicketList = [];
  tableAllOpenTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  ticketFormFields;
  tpPropertyList = [];
  ticketForm = {
    requestId: null,
    tp: { id: null, name: null },
    tpProperty: { id: null, name: null },
    priCat: { id: 0, name: null },
    secCat: { id: 0, name: null },
    type: { id: 0, name: null },
    info: null,
    remark: null
  }
  priCatList = [];
  secCatList = [];
  typeList = [];
  evenArray = [];
  oddArray = [];
  assignUserObject = {
    tktId: null,
    userId: null,
    type: null
  }

  forwardTicketObject = {
    ticketAllocationId: null,
    tktId: null,
    userId: { id: null, name: '' },
    remark: null,
    tabType: null
  }

  searchData = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getTicketByType(101);
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
  }

  ngOnInit() { }

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

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      // if (!res['data']) return;
      let tpList = res['data'] || [];
      this.tpList = tpList.filter(ele => {
        return (ele._is_active && ele._ticket_input > 0)
      })
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getTicketFormField() {
    if (!this.ticketForm.tp.id) {
      this.common.showError("Ticket Process is missing");
      return false;
    }
    this.ticketFormFields = null;
    let params = "?refId=" + this.ticketForm.tp.id + "&refType=0" + "&ticketId=" + this.ticketForm.requestId;
    this.api.get("Ticket/getTicketFormFieldById" + params).subscribe(res => {
      if (res['code'] > 0) {
        if (res['data']) {
          this.ticketFormFields = res['data'];
          this.formatArray();
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getTicketProcessProperty() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessProperty?tpId=' + this.ticketForm.tp.id).subscribe(res => {
      this.common.loading--;
      this.tpPropertyList = res['data'] || [];
      this.findPriCat();
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  formatArray() {
    this.evenArray = [];
    this.oddArray = [];
    this.ticketFormFields.map(dd => {
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
        console.log("date==", dd.r_value);
      }
      if (dd.r_coltype == 'checkbox') {
        dd.r_value = (dd.r_value == "true") ? true : false;
      }
      if (dd.r_fixedvalues) {
        dd.r_fixedvalues = dd.r_fixedvalues;
      }
      if (dd.r_colorder && dd.r_colorder % 2 == 0) {
        this.evenArray.push(dd);
      } else {
        this.oddArray.push(dd);
      }
    });
    console.log("evenArray", this.evenArray);
    console.log("oddArray", this.oddArray);
  }

  findPriCat() {
    if (this.tpPropertyList && this.tpPropertyList.length > 0) {
      this.tpPropertyList.forEach(element => {
        if (element._pri_cat_id && !this.priCatList.find(x => { return x.id == element._pri_cat_id })) {
          this.priCatList.push({ id: element._pri_cat_id, name: element.primary_category });
        }
        if (element._sec_cat_id && !this.secCatList.find(x => { return x.id == element._sec_cat_id })) {
          this.secCatList.push({ id: element._sec_cat_id, name: element.secondary_category });
        }
        if (element._type_id && !this.typeList.find(x => { return x.id == element._type_id })) {
          this.typeList.push({ id: element._type_id, name: element.type });
        }
      });
    }
  }

  resetTicketForm() {
    this.tpPropertyList = [];
    this.oddArray = [];
    this.evenArray = [];
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    this.ticketFormFields = null;
    this.ticketForm = {
      requestId: null,
      tp: { id: null, name: null },
      tpProperty: { id: null, name: null },
      priCat: { id: 0, name: null },
      secCat: { id: 0, name: null },
      type: { id: 0, name: null },
      info: null,
      remark: null
    }
  }

  openAddTicketModal() {
    document.getElementById('addTicketModal').style.display = 'block';
  }

  closeAddTicketModal() {
    document.getElementById('addTicketModal').style.display = 'none';
    this.resetTicketForm();
  }

  onSelectedTp(event) {
    console.log("event:", event);
    this.ticketForm.tp.id = event._id;
    this.ticketForm.tp.name = event.name;

    this.tpPropertyList = [];
    this.oddArray = [];
    this.evenArray = [];
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    this.ticketFormFields = null;
    setTimeout(() => {
      this.getTicketFormField();
      this.getTicketProcessProperty();
    }, 500);
  }

  getTicketByType(type, startDate = null, endDate = null) {
    this.common.loading++;
    if ((type == 105) && this.searchData.startDate && this.searchData.endDate) {
      startDate = this.common.dateFormatter(this.searchData.startDate);
      endDate = this.common.dateFormatter(this.searchData.endDate);
    }
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Ticket/getTicketByType" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (type == 100) {
          this.unallocatedTkt = res['data'] || [];
          this.setTableUnallocatedTkt(type);
        } else if (type == 101) {
          this.allocatedTkt = res['data'] || [];
          this.setTableAllocatedTkt(type);
        } else if (type == 102) {
          this.unreadTkt = res['data'] || [];
          this.setTableUnreadTkt(type);
        } else if (type == 103) {
          this.unassignedTkt = res['data'] || [];
          this.setTableUnassignedTkt(type);
        } else if (type == 105) {
          this.completedTkt = res['data'] || [];
          this.setTablecompletedTkt(type);
        } else if (type == 104) {
          this.ccTkt = res['data'] || [];
          this.setTableccTkt(type);
        } else if (type == 106) {
          this.addedByMeTkt = res['data'] || [];
          this.setTableaddedByMeTkt(type);
        } else if (type == 107) {
          this.allOpenTicketList = res['data'] || [];
          this.setTableAllOPenTkt(type);
        }
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
    this.tableAllocatedTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnallocatedTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnreadTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnassignedTkt.data = {
      headings: {},
      columns: []
    };
  }

  // start: allocatedTkt
  setTableAllocatedTkt(type) {
    this.tableAllocatedTkt.data = {
      headings: this.generateHeadingsAllocatedTkt(),
      columns: this.getTableColumnsAllocatedTkt(type)
    };
    return true;
  }

  generateHeadingsAllocatedTkt() {
    let headings = {};
    for (var key in this.allocatedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsAllocatedTkt(type) {
    let columns = [];
    this.allocatedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsAllocatedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
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
  // end: allocatedTkt

  // start: UnallocatedTkt
  setTableUnallocatedTkt(type) {
    this.tableUnallocatedTkt.data = {
      headings: this.generateHeadingsUnallocatedTkt(),
      columns: this.getTableColumnsUnallocatedTkt(type)
    };
    return true;
  }

  generateHeadingsUnallocatedTkt() {
    let headings = {};
    for (var key in this.unallocatedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnallocatedTkt(type) {
    let columns = [];
    this.unallocatedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnallocatedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: unallocatedTkt
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
            icons: this.actionIcons(lead, type)
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
  // end: unreadTkt
  // start: UnassignedTkt
  setTableUnassignedTkt(type) {
    this.tableUnassignedTkt.data = {
      headings: this.generateHeadingsUnassignedTkt(),
      columns: this.getTableColumnsUnassignedTkt(type)
    };
    return true;
  }

  generateHeadingsUnassignedTkt() {
    let headings = {};
    for (var key in this.unassignedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnassignedTkt(type) {
    let columns = [];
    this.unassignedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnassignedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: UnassignedTkt

  // start: CCTkt
  setTableccTkt(type) {
    this.tableCcTkt.data = {
      headings: this.generateHeadingsccTkt(),
      columns: this.getTableColumnsccTkt(type)
    };
    return true;
  }

  generateHeadingsccTkt() {
    let headings = {};
    for (var key in this.ccTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsccTkt(type) {
    let columns = [];
    this.ccTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsccTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: CCTkt

  // start: addedByMeTkt
  setTableaddedByMeTkt(type) {
    this.tableAddedByMeTkt.data = {
      headings: this.generateHeadingsaddedByMeTkt(),
      columns: this.getTableColumnsaddedByMeTkt(type)
    };
    return true;
  }

  generateHeadingsaddedByMeTkt() {
    let headings = {};
    for (var key in this.addedByMeTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsaddedByMeTkt(type) {
    let columns = [];
    this.addedByMeTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsaddedByMeTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: addedByMeTkt

  // start: allOpenTickets
  setTableAllOPenTkt(type) {
    this.tableAllOpenTkt.data = {
      headings: this.generateHeadingsallOpenTickets(),
      columns: this.getTableColumnsallOpenTickets(type)
    };
    return true;
  }

  generateHeadingsallOpenTickets() {
    let headings = {};
    for (var key in this.allOpenTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsallOpenTickets(type) {
    let columns = [];
    this.allOpenTicketList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsallOpenTickets()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: allOpenTickets

  // start: CompletedTkt
  setTablecompletedTkt(type) {
    this.tableCompletedTkt.data = {
      headings: this.generateHeadingscompletedTkt(),
      columns: this.getTableColumnscompletedTkt(type)
    };
    return true;
  }

  generateHeadingscompletedTkt() {
    let headings = {};
    for (var key in this.completedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnscompletedTkt(type) {
    let columns = [];
    this.completedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingscompletedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: CompletedTkt

  actionIcons(ticket, type) {
    console.log("actionIcons:", ticket);
    let icons = [];
    if (type == 101 || type == 102 || type == 106 || type == 104 || type == 105 || type == 107) {
      icons.push({ class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: 'Chat Box', });

      if (ticket._unreadcount > 0) {
        icons = [{ class: "fas fa-comments new-comment", action: this.ticketMessage.bind(this, ticket, type), txt: ticket._unreadcount, title: 'Chat Box', },];
      } else if (ticket._unreadcount == -1) {
        icons = [{ class: "fas fa-comments no-comment", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: 'Chat Box', },];
      }

      if (ticket._status == 5 || ticket._status == -1) {
      } else {
        if (ticket._isremind == 1 && (type == 106 || type == 104 || type == 101 || type == 102 || type == 107)) {
          icons.push({ class: "fa fa-bell isRemind", action: this.checkReminderSeen.bind(this, ticket, type), txt: "", title: 'Reminder', });
        } else if (ticket._isremind == 2 && (type != 102)) {
          icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, ticket, type), txt: "", title: 'Reminder', });
        } else {
          if (type != 102) {
            icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, ticket, type), txt: "", title: 'Reminder', });
          }
        }
      }

      if (type == 106) {
        icons.push({ class: 'fas fa-trash-alt', action: this.deleteTicket.bind(this, ticket, type), txt: '', title: "Delete Ticket" });
      } else if (type == 101 || type == 102 || type == 107) {
        icons.push({ class: "fas fa-share", action: this.openForwardTicket.bind(this, ticket, type), txt: '', title: "Forward Ticket" });
        if (type == 107) {
          if (!ticket._status) {
            icons.push({ class: "fa fa-check-square text-warning", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 2), txt: "", title: "Mark Ack", });
          } else if (ticket._status == 2) {
            icons.push({ class: "fa fa-thumbs-up text-success", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 5), txt: "", title: "Mark Completed", });
          }
          if ((ticket._allocated_user == -1 && ticket._status == 0) || ticket._status === null) {
            icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.claimTicket.bind(this, ticket, type), txt: '', title: "Claim Ticket" });
          }
        }
      } else if (type == 105) {
        icons.push({ class: "fa fa-retweet", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 0), txt: "", title: "Re-Active", });
      }

      if (ticket._status == 2 && (type == 101 || type == 102)) {
        icons.push({ class: "fas fa-user-clock", action: this.addTime.bind(this, ticket, type), txt: '', title: "Add Extra Time" });
      }

      icons.push({ class: "fas fa-history", action: this.ticketHistory.bind(this, ticket, type), txt: '', title: "History" });

      if (!ticket._status && (type == 101 || type == 102)) {
        icons.push({ class: "fa fa-times text-danger", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, -1), txt: "", title: "Mark Rejected", });
        icons.push({ class: "fa fa-check-square text-warning", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 2), txt: "", title: "Mark Ack", });
      } else if (ticket._status == 2 && (type == 101 || type == 102)) {
        icons.push({ class: "fa fa-thumbs-up text-success", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 5), txt: "", title: "Mark Completed", });
      }
    } else if (type == 100) {
      icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.claimTicket.bind(this, ticket, type), txt: '', title: "Claim Ticket" });
    } else if (type == 103) {
      icons.push({ class: "fas fa-user-plus", action: this.openAssignUserModal.bind(this, ticket, type), txt: '', title: "Assign User" });
    }
    icons.push({ class: "fa fa-info-circle", action: this.openInfoModal.bind(this, ticket, type), txt: '', title: "Ticket Info" });

    return icons;
  }

  deleteTicket(ticket, type) {
    if (ticket._ticket_id > 0) {
      this.common.params = {
        title: "Delete Ticket ",
        description: '<b>Are You Sure To Delete This Ticket ?<b>',
        isRemark: false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
      activeModal.result.then((data) => {
        if (data.response) {
          let params = {
            ticketId: ticket._ticket_id
          };
          this.common.loading++;
          this.api.post('Ticket/deleteTicket', params).subscribe(res => {
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
      });
    } else {
      this.common.showError("Invalid Ticket");
    }
  }

  changeTicketStatusWithConfirm(ticket, type, status) {
    console.log(ticket, 'status');
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
          if (status == 5 && ticket._close_form > 0) {
            this.openTicketFormData(ticket, type, status);
          } else {
            this.updateTicketStatus(ticket, type, status, data.remark);
          }
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
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

  ticketMessage(ticket, type) {
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

  saveTicket() {
    console.log("ticketForm:", this.ticketForm);
    let selected = this.tpPropertyList.find(ele => {
      return (ele._pri_cat_id == this.ticketForm.priCat.id && ele._sec_cat_id == this.ticketForm.secCat.id && ele._type_id == this.ticketForm.type.id)
    });

    console.log("selected:", selected);

    if (selected) {
      this.ticketForm.tpProperty.id = selected._id;
      this.ticketForm.tpProperty.name = selected.name;
    } else {
      this.ticketForm.tpProperty = { id: null, name: null }
    }

    let params = {
      tpPropId: this.ticketForm.tpProperty.id ? this.ticketForm.tpProperty.id : null,
      remark: this.ticketForm.remark,
      info: JSON.stringify(this.evenArray.concat(this.oddArray)),
      isAllocated: false,
      requestId: (this.ticketForm.requestId > 0) ? this.ticketForm.requestId : null
    }

    if (!params.tpPropId) {
      this.common.showError('Combination mismatch: Primary Category, Secondary Category, Type');
      return false;
    }
    this.common.loading++;
    this.api.post('Ticket/saveTicket', params).subscribe(res => {
      this.common.loading--;
      console.log('response:', res);
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeAddTicketModal();
          this.getTicketByType(101);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error:', err)
    })
  }

  AdditionalForm(arraytype, i) {
    let additionalData = null;
    if (arraytype === 'oddArray') {
      additionalData = this.oddArray[i]._param_child;
    } else if (arraytype === 'evenArray') {
      additionalData = this.evenArray[i]._param_child;
    }
    console.log(additionalData, 'final data');
    this.common.params = { additionalform: (additionalData && additionalData.length > 0) ? additionalData : null };
    const activeModal = this.modalService.open(FormDataTableComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.data, 'response')
        if (data.data) {
          if (arraytype === 'oddArray') {
            this.oddArray[i]._param_child = data.data;
          } else if (arraytype === 'evenArray') {
            this.evenArray[i]._param_child = data.data;
          }
        }
      }
    });
  }

  openAssignUserModal(ticket, type) {
    console.log(this.assignUserObject, ticket);
    this.assignUserObject.tktId = ticket._ticket_id;
    this.assignUserObject.type = type;
    document.getElementById('assignUserModal').style.display = 'block';
  }

  closeassignUserModal() {
    document.getElementById('assignUserModal').style.display = 'none';
    this.resetAssignUser();
  }

  resetAssignUser() {
    this.assignUserObject = {
      tktId: null,
      userId: null,
      type: null
    }
  }

  appointUser() {
    let params = {
      tktId: this.assignUserObject.tktId,
      userId: this.assignUserObject.userId.id
    };
    this.common.loading++;
    this.api.post("Ticket/addTicketAllocation", params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.closeassignUserModal();
          this.common.showToast(res['data'][0].y_msg);
          this.getTicketByType(this.assignUserObject.type);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showToast(res["msg"]);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  ticketHistory(ticket, type) {
    this.common.loading++;
    this.api.get("Ticket/getTicketHistory?tktId=" + ticket._ticket_id).subscribe((res) => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data']) {
          this.ticketHistoryList = res['data'];
          this.setTableTicketHistory();
          document.getElementById('ticketHistory').style.display = 'block';
        } else {
          this.common.showError('No Data')
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

  closeTicketHistory() {
    document.getElementById('ticketHistory').style.display = 'none';
  }

  setTableTicketHistory() {
    this.tableTicketHistory.data = {
      headings: this.generateHeadingsTicketHistory(),
      columns: this.getTableColumnsTicketHistory()
    };
    return true;
  }

  generateHeadingsTicketHistory() {
    let headings = {};
    for (var key in this.ticketHistoryList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsTicketHistory() {
    let columns = [];
    this.ticketHistoryList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsTicketHistory()) {
        if (key.toLowerCase() == 'action') {
          // column[key] = {
          //   value: "",
          //   isHTML: true,
          //   action: null,
          //   icons: this.actionIcons(lead, type)
          // };
        } else if (key == "spent_time") {
          column[key] = { value: this.common.findRemainingTime(lead[key]), class: "black", action: "", };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

      }
      columns.push(column);
    });
    return columns;
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
    console.log(ticket);
    this.forwardTicketObject.ticketAllocationId = ticket._ticket_allocation_id;
    this.forwardTicketObject.tktId = ticket._ticket_id;
    this.forwardTicketObject.tabType = type;
    console.log(this.forwardTicketObject)
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
        console.log(data.data, 'response');
        this.updateTicketStatus(ticket, type, status, null);
      }
    });
  }

  openInfoModal(ticket, type) {
    console.log(ticket);
    // return
    this.ticketForm.tp.id = ticket._tpid;
    this.ticketForm.requestId = ticket._ticket_id;

    this.tpPropertyList = [];
    this.oddArray = [];
    this.evenArray = [];
    this.priCatList = [];
    this.secCatList = [];
    this.typeList = [];
    this.ticketFormFields = null;
    setTimeout(async () => {
      await this.getTicketFormField();
    }, 500);

    document.getElementById('infoWindow').style.display = 'block';
  }

  closeInfo() {
    document.getElementById('infoWindow').style.display = 'none';
    this.resetTicketForm();
  }
}
