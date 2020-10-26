import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDataTableComponent } from '../../modals/process-modals/form-data-table/form-data-table.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';
import { TicketChatboxComponent } from '../../modals/ticket-modals/ticket-chatbox/ticket-chatbox.component';
import { AddExtraTimeComponent } from '../../modals/ticket-modals/add-extra-time/add-extra-time.component';
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

  ticketFormFields;
  tpPropertyList = [];
  ticketForm = {
    requestId: null,
    tp: { id: null, name: null },
    tpProperty: { id: null, name: null },
    priCat: { id: null, name: null },
    secCat: { id: null, name: null },
    type: { id: null, name: null },
    info: null,
    remark: null
  }
  priCatList = [];
  secCatList = [];
  typeList = [];
  evenArray = [];
  oddArray = [];
  assignUserObject = {
    tktId:null,
    userId:null,
    type:null
  }

  forwardTicketObject = {
    tktId:null,
    userId:null,
    remark:null,
    tabType:null
  }

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getTicketByType(101);
    this.getAllAdmin();
    this.getTicketProcessList();
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

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      // if (!res['data']) return;
      this.tpList = res['data'] || [];
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
          this.ticketFormFields = res['data'] = res['data'];
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
        if (element._pri_cat_id) {
          this.priCatList.push({ id: element._pri_cat_id, name: element.primary_category });
        }
        if (element._sec_cat_id) {
          this.secCatList.push({ id: element._sec_cat_id, name: element.secondary_category });
        }
        if (element._type_id) {
          this.typeList.push({ id: element._type_id, name: element.type });
        }
      });
    }
  }

  findSecCatByPriCat(priCatId) {
    console.log("onPriCatSelected:", priCatId);
    if (this.tpPropertyList && this.tpPropertyList.length > 0) {
      let selectedLsit = this.tpPropertyList.filter(x => { return x._pri_cat_id == priCatId });
      if (selectedLsit) {
        console.log("findSecCatByPriCat:", selectedLsit);
        selectedLsit.forEach(element => {
          if (element._sec_cat_id) {
            this.secCatList.push({ id: element._sec_cat_id, name: element.secondary_category });
          }
        });
      }
    }
  }

  findTypeBySecCat(secCatId) {
    if (this.tpPropertyList && this.tpPropertyList.length > 0) {
      let selectedLsit = this.tpPropertyList.filter(x => { return x._sec_cat_id == secCatId });
      console.log("findTypeBySecCat:", selectedLsit);
      if (selectedLsit) {
        selectedLsit.forEach(element => {
          if (element._type_id) {
            this.typeList.push({ id: element._type_id, name: element.type });
          }
        });
      }
    }
  }

  onPriCatSelected() {
    console.log("onPriCatSelected:", this.ticketForm.priCat);
    this.ticketForm.secCat = { id: null, name: null };
    this.ticketForm.type = { id: null, name: null };
    this.findSecCatByPriCat(this.ticketForm.priCat.id);
  }

  onSecCatSelected() {
    this.ticketForm.type = { id: null, name: null };
    this.findTypeBySecCat(this.ticketForm.secCat.id);
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
      priCat: { id: null, name: null },
      secCat: { id: null, name: null },
      type: { id: null, name: null },
      info: null,
      remark: null
    }
  }

  openAddTicketModal() {
    // this.getTicketFormField();
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
    setTimeout(() => {
      this.getTicketFormField();
      this.getTicketProcessProperty();
    }, 500);
  }

  getTicketByType(type, startDate = null, endDate = null) {
    this.common.loading++;
    // if ((type == 102) && this.searchData.startDate && this.searchData.endDate) {
    //   startDate = this.common.dateFormatter(this.searchData.startDate);
    //   endDate = this.common.dateFormatter(this.searchData.endDate);
    // }
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
        }else if (key == "remaining_time") {
          column[key] = {
            value: this.common.findRemainingTime(lead[key]),
            class: "black",
            action: "",
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
        }else if (key == "remaining_time") {
          column[key] = {
            value: this.common.findRemainingTime(lead[key]),
            class: "black",
            action: "",
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

  actionIcons(ticket, type) {
    console.log("actionIcons:", ticket);
    // let icons = [{ class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: null, },];

    let icons = [];

    if(type == 101 || type == 102){
      icons.push({ class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: null, });
      icons.push({ class: "fas fa-user-clock", action: this.addTime.bind(this, ticket, type), txt: '', title: "Add Time" });
      icons.push({ class: "fas fa-share", action: this.openForwardTicket.bind(this, ticket, type), txt: '', title: "Forward Ticket" });
      icons.push({ class: "fas fa-history", action: this.ticketHistory.bind(this, ticket, type), txt: '', title: "History" });

      if (ticket._unreadcount > 0) {
          icons = [{ class: "fas fa-comments new-comment", action: this.ticketMessage.bind(this, ticket, type), txt: ticket._unreadcount, title: null, },];
        } else if (ticket._unreadcount == -1) {
          icons = [{ class: "fas fa-comments no-comment", action: this.ticketMessage.bind(this, ticket, type), txt: "", title: null, },];
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
        }
  }else  if (type == 100) {
      icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.claimTicket.bind(this, ticket, type), txt: '', title: "Claim Ticket" });
  }else  if (type == 103) {
    icons.push({ class: "fas fa-user-plus", action: this.openAssignUserModal.bind(this, ticket, type), txt: '', title: "Assign User" });
  }
    return icons;
  }

  claimTicket(ticket, type){
    let params = {
      tktId: ticket._ticket_id,
      userId:this.loginUserId
    };
    console.log('params',params);
    // return;
    this.common.loading++;
    this.api.post("Ticket/addTicketAllocation", params).subscribe((res) => {
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

  addTime(ticket, type){
    this.common.params = {
      ticketId: ticket._ticket_allocation_id,
      title: "Add Time",
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
    console.log("type:", type,ticket);
    let ticketEditData = {
      ticketData: ticket,
      ticketId: ticket._ticket_allocation_id,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      // taskId: ticket._refid,
      // taskType: ticket._tktype,
      tabType: type,
    };

    let subTitle = ticket.info;
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.adminList
    };
    const activeModal = this.modalService.open(TicketChatboxComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      type ? this.getTicketByType(type) : null;
    });
  }

  showReminderPopup(ticket, type) {
    this.common.params = {
      ticketId: ticket._ticket_allocation_id,
      remindertime: ticket._remindtime,
      title: "Add Reminder",
      btn: "Set Reminder",
      fromPage: "ticket"
    };
    const activeModal = this.modalService.open(ReminderComponent, {
      size: "sm",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getTicketByType(type);
      }
    });
  }

  checkReminderSeen(ticket, type) {
    let params = {
      ticket_id: ticket._ticket_allocation_id,
    };
    this.common.loading++;
    this.api.post("Ticket/checkReminderSeen", params).subscribe((res) => {
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
    let selected = this.tpPropertyList.find(ele => {
      return (ele._pri_cat_id == this.ticketForm.priCat.id && ele._sec_cat_id == this.ticketForm.secCat.id && ele._sec_cat_id == this.ticketForm.type.id)
    });

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
      this.common.showError('Combination mismatch: Primary Category,Secondary Category,Type');
      return false;
    }
    this.common.loading++;
    this.api.post('Ticket/saveTicket', params).subscribe(res => {
      this.common.loading--;
      console.log('response:', res);
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.getTicketByType(101);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      console.log('Error:', err)
    })

    console.log("save ticketForm:", this.ticketForm, this.tpPropertyList);
    console.log('OddEven Array', this.oddArray, this.evenArray)
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

  

  openAssignUserModal(ticket, type){
    console.log(this.assignUserObject,ticket);
    this.assignUserObject.tktId = ticket._ticket_id;
    this.assignUserObject.type = type;
    document.getElementById('assignUserModal').style.display = 'block';
    }

    closeassignUserModal(){
      document.getElementById('assignUserModal').style.display = 'none';
      this.resetAssignUser();
    }

    resetAssignUser(){
      this.assignUserObject = {
        tktId:null,
        userId:null,
        type:null
      }
    }

    appointUser(){
      let params = {
        tktId: this.assignUserObject.tktId,
        userId:this.assignUserObject.userId.id
      };
      console.log('params',params);
      return;
      this.common.loading++;
      this.api.post("Ticket/addTicketAllocation", params).subscribe((res) => {
        this.common.loading--;
        this.common.showToast(res["msg"]);
        this.getTicketByType(this.assignUserObject.type);
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
      );
    }

    ticketHistory(ticket,type){
      // console.log('params',ticket);
      // return;
      this.common.loading++;
      this.api.get("Ticket/getTicketHistory?tktId=" + ticket._ticket_id).subscribe((res) => {
        this.common.loading--;
        if(res['code'] > 0){
          if(res['data']){
            this.ticketHistoryList = res['data'];
            this.setTableTicketHistory();
            document.getElementById('ticketHistory').style.display = 'block';
          }else{
              this.common.showError('No Data')
          }
        }else{
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      });
    }

    closeTicketHistory(){
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
          } else {
            column[key] = { value: lead[key], class: 'black', action: '' };
          }

        }
        columns.push(column);
      });
      return columns;
    }

    forwardTicket(type){
      let params = {
        ticketId: this.forwardTicketObject.tktId,
        userid:this.forwardTicketObject.userId.id,
        remark:this.forwardTicketObject.remark
      };
      console.log('params',params);
      // return;
      this.common.loading++;
      this.api.post("Ticket/forwardTicket", params).subscribe((res) => {
        this.common.loading--;
        if(res['code'] > 0){
          this.common.showToast(res["msg"]);
          this.closeForwardTicket();
          this.getTicketByType(type);
        }else{
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
      );
    }

    openForwardTicket(ticket, type){
      console.log(ticket);
      this.forwardTicketObject.tktId = ticket._ticket_allocation_id;
      this.forwardTicketObject.tabType = type;
      console.log(this.forwardTicketObject)
      document.getElementById('forwardTicket').style.display = 'block';
    }

    closeForwardTicket(){
      document.getElementById('forwardTicket').style.display = 'none';
      this.resetforwardTicket()
    }

    resetforwardTicket(){
      this.forwardTicketObject = {
        tktId:null,
        userId:null,
        remark:null,
        tabType:null
      }
    }
}
