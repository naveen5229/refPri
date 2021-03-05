import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';
import { AddTransactionComponent } from '../../modals/process-modals/add-transaction/add-transaction.component';
import { AddTransactionActionComponent } from '../../modals/process-modals/add-transaction-action/add-transaction-action.component';
import { ChatboxComponent } from '../../modals/process-modals/chatbox/chatbox.component';
import { FormDataComponent } from '../../modals/process-modals/form-data/form-data.component';
import { AddTransactionContactComponent } from '../../modals/process-modals/add-transaction-contact/add-transaction-contact.component';
import { ViewDashboardComponent } from '../../modals/process-modals/view-dashboard/view-dashboard.component';
import { DocumentListingComponent } from '../../modals/document-listing/document-listing.component';
import { CsvUploadComponent } from '../../modals/csv-upload/csv-upload.component';
@Component({
  selector: 'ngx-my-process',
  templateUrl: './my-process.component.html',
  styleUrls: ['./my-process.component.scss']
})
export class MyProcessComponent implements OnInit {
  loginUserId = this.userService._details.id;
  activeSabTab = 0;
  activeSabTab1 = 0;
  activeTab = 'leadsForMe';
  adminList = [];
  processList = [];
  leadsForMe = [];
  leadsByMe = [];
  completedLeadsForFilter = [];
  allCompletedLeads = [];
  unreadLeads = [];
  ccLeads = [];
  missingOwnLeads = [];
  unassignedLeads = [];
  processDashboardList = []
  processDashboardHeaders = {};
  processDashboardTitle = '';

  tableLeadsForMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableLeadsByMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableAllCompletedLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnreadLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableCcLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableMissingOwnLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnassignedLeads = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  ownedByMeList = [];
  tableOwnedByMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  AdminTxnList = [];
  tableAdminTxn = {
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

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getProcessLeadByType(1);
    this.getAllAdmin();
    this.getProcessList();
    this.common.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.getProcessLeadByType(1);
    this.getAllAdmin();
    this.getProcessList();
    this.activeTab = 'leadsForMe';
    this.activeSabTab = 0;
  }

  ngOnInit() { }

  addTransaction() {
    // console.log("addProcessLead");
    this.common.params = { processList: this.processList, adminList: this.adminList, title: "Add Transaction ", button: "Add" }
    const activeModal = this.modalService.open(AddTransactionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.activeTab = 'leadsByMe';
        this.getProcessLeadByType(2);
      }
    });
  }

  exportCSV() {
    if (this.processDashboardList.length == 0) {
      this.common.showError('No Data Found')
    } else {
      this.common.getCSVFromDataArray(this.processDashboardList, this.processDashboardHeaders, this.processDashboardTitle)
    }
  }

  resetSearchData() {
    this.searchData = {
      startDate: <any>this.common.getDate(-2),
      endDate: <any>this.common.getDate()
    }
  }

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

  getProcessList() {
    this.common.loading++;
    this.api.get('Processes/getProcessList').subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (!res['data']) return;
      this.processList = res['data'];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getProcessLeadByType(type, startDate = null, endDate = null) {
    this.common.loading++;
    if ((type == 4 || type == 8 || type == 9) && this.searchData.startDate && this.searchData.endDate) {
      startDate = this.common.dateFormatter(this.searchData.startDate);
      endDate = this.common.dateFormatter(this.searchData.endDate);
    }
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Processes/getMyProcessByType" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (type == 1) {//for me pending
          this.leadsForMe = res['data'] || [];
          this.processDashboardList = this.leadsForMe;
          this.processDashboardTitle = 'Action_For_Me'
          this.setTableLeadsForMe(type);
        } else if (type == 9) { //for me Completd
          this.leadsForMe = res['data'] || [];
          this.processDashboardList = this.leadsForMe;
          this.processDashboardTitle = 'Action_For_Me'
          this.setTableLeadsForMe(type);
        } else if (type == 2) { //by me pending
          this.leadsByMe = res['data'] || [];
          this.processDashboardList = this.leadsByMe;
          this.processDashboardTitle = 'Transaction_By_Me'
          this.setTableLeadsByMe(type);
        } else if (type == 8) { //by me completed
          this.leadsByMe = res['data'] || [];
          this.processDashboardList = this.leadsByMe;
          this.processDashboardTitle = 'Transaction_By_Me'
          this.setTableLeadsByMe(type);
        } else if (type == 3) {
          this.ccLeads = res['data'] || [];
          this.processDashboardList = this.ccLeads;
          this.processDashboardTitle = 'CC_Transaction'
          this.setTableCcLeads(type);
        } else if (type == 4) {
          this.activeSabTab = 0;
          this.allCompletedLeads = res['data'] || [];
          this.completedLeadsForFilter = this.allCompletedLeads;
          this.processDashboardList = this.allCompletedLeads;
          this.processDashboardTitle = 'Completed_Transaction'
          this.setTableAllCompletedLeads(type);
        } else if (type == 5) {
          this.unreadLeads = res['data'] || [];
          this.processDashboardList = this.unreadLeads;
          this.processDashboardTitle = 'Unread_Transaction'
          this.setTableUnreadLeads(type);
        } else if (type == 0) {
          this.missingOwnLeads = res['data'] || [];
          this.processDashboardList = this.missingOwnLeads;
          this.processDashboardTitle = 'Missing_Owner_Transaction'
          this.setTableMissingOwnLeads(type);
        } else if (type == -1) {
          this.unassignedLeads = res['data'] || [];
          this.processDashboardList = this.unassignedLeads;
          this.processDashboardTitle = 'Unassigned_Transaction'
          this.setTableUnassignedLeads(type);
        } else if (type == 6) {
          this.ownedByMeList = res['data'] || [];
          this.processDashboardList = this.ownedByMeList;
          this.processDashboardTitle = 'Owned_By_Me'
          this.setTableOwnedByMe(type);
        } else if (type == 7) {
          this.AdminTxnList = res['data'] || [];
          this.processDashboardList = this.AdminTxnList;
          this.processDashboardTitle = 'Admin_Transaction'
          this.setTableAdminTxn(type);
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
    this.tableLeadsForMe.data = {
      headings: {},
      columns: []
    };
    this.tableLeadsByMe.data = {
      headings: {},
      columns: []
    };
    this.tableAllCompletedLeads.data = {
      headings: {},
      columns: []
    };
    this.tableUnreadLeads.data = {
      headings: {},
      columns: []
    };
    this.tableCcLeads.data = {
      headings: {},
      columns: []
    };
    this.tableMissingOwnLeads.data = {
      headings: {},
      columns: []
    };
    this.tableUnassignedLeads.data = {
      headings: {},
      columns: []
    };
    this.tableOwnedByMe.data = {
      headings: {},
      columns: []
    };
  }

  // start: leads for me
  setTableLeadsForMe(type) {
    this.tableLeadsForMe.data = {
      headings: this.generateHeadingsLeadsForMe(),
      columns: this.getTableColumnsLeadsForMe(type)
    };
    return true;
  }

  generateHeadingsLeadsForMe() {
    let headings = {};
    for (var key in this.leadsForMe[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsLeadsForMe(type) {
    let columns = [];
    this.leadsForMe.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsLeadsForMe()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == 'action_expdate' && new Date(lead[key]) < this.common.getDate()) {
          column[key] = { value: lead[key], class: 'black font-weight-bold', action: '' };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: leads for me

  // start: leads by me
  setTableLeadsByMe(type) {
    this.tableLeadsByMe.data = {
      headings: this.generateHeadingsLeadsByMe(),
      columns: this.getTableColumnsLeadsByMe(type)
    };
    return true;
  }

  generateHeadingsLeadsByMe() {
    let headings = {};
    for (var key in this.leadsByMe[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_expdate" || key === 'state_expdate') {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsLeadsByMe(type) {
    let columns = [];
    this.leadsByMe.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsLeadsByMe()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == 'state_expdate' && new Date(lead[key]) < this.common.getDate()) {
          column[key] = { value: lead[key], class: 'black font-weight-bold', action: '' };
        }
        else if (key == 'mobile_no') {
          column[key] = { value: lead[key], class: lead['_contact_count'] > 1 ? 'font-weight-bold' : '', action: '' };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: leads by me

  // start: AllCompletedLeads
  setTableAllCompletedLeads(type) {
    this.tableAllCompletedLeads.data = {
      headings: this.generateHeadingsAllCompletedLeads(),
      columns: this.getTableColumnsAllCompletedLeads(type)
    };
    return true;
  }

  generateHeadingsAllCompletedLeads() {
    let headings = {};
    for (var key in this.allCompletedLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }

      if (key === "addtime" || key === "completion_time") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsAllCompletedLeads(type) {
    let columns = [];
    this.allCompletedLeads.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsAllCompletedLeads()) {
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

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: AllCompletedLeads

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
    this.processDashboardHeaders = headings;
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
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end unread lead
  // start cc leads
  setTableCcLeads(type) {
    this.tableCcLeads.data = {
      headings: this.generateHeadingsCcLeads(),
      columns: this.getTableColumnsCcLeads(type)
    };
    return true;
  }

  generateHeadingsCcLeads() {
    let headings = {};
    for (var key in this.ccLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_expdate" || key === "state_expdate") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsCcLeads(type) {
    let columns = [];
    this.ccLeads.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsCcLeads()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == 'action_expdate' && new Date(lead[key]) < this.common.getDate()) {
          column[key] = { value: lead[key], class: 'black font-weight-bold', action: '' };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end cc leads
  // start:missing own lead
  setTableMissingOwnLeads(type) {
    this.tableMissingOwnLeads.data = {
      headings: this.generateHeadingsMissingOwnLeads(),
      columns: this.getTableColumnsMissingOwnLeads(type)
    };
    return true;
  }

  generateHeadingsMissingOwnLeads() {
    let headings = {};
    for (var key in this.missingOwnLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsMissingOwnLeads(type) {
    let columns = [];
    this.missingOwnLeads.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsMissingOwnLeads()) {
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

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end:missing own lead
  // start:unsigned lead
  setTableUnassignedLeads(type) {
    this.tableUnassignedLeads.data = {
      headings: this.generateHeadingsUnassignedLeads(),
      columns: this.getTableColumnsUnassignedLeads(type)
    };
    return true;
  }

  generateHeadingsUnassignedLeads() {
    let headings = {};
    for (var key in this.unassignedLeads[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsUnassignedLeads(type) {
    let columns = [];
    this.unassignedLeads.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsUnassignedLeads()) {
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

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end:unsigned lead

  // start:ownedbyme lead
  setTableOwnedByMe(type) {
    this.tableOwnedByMe.data = {
      headings: this.generateHeadingsOwnedByMe(),
      columns: this.getTableColumnsOwnedByMe(type)
    };
    return true;
  }

  generateHeadingsOwnedByMe() {
    let headings = {};
    for (var key in this.ownedByMeList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_expdate" || key === "state_expdate") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsOwnedByMe(type) {
    let columns = [];
    this.ownedByMeList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsOwnedByMe()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == 'state_expdate' && new Date(lead[key]) < this.common.getDate()) {
          column[key] = { value: lead[key], class: 'black font-weight-bold', action: '' };
        }
        else if (key == 'mobile_no') {
          column[key] = { value: lead[key], class: lead['_contact_count'] > 1 ? 'font-weight-bold' : '', action: '' };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end:ownedbyme lead

  // start: set table admin txn
  setTableAdminTxn(type) {
    this.tableAdminTxn.data = {
      headings: this.generateHeadingsAdminTxn(),
      columns: this.getTableColumnsAdminTxn(type)
    };
    return true;
  }

  generateHeadingsAdminTxn() {
    let headings = {};
    for (var key in this.AdminTxnList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    this.processDashboardHeaders = headings;
    return headings;
  }

  getTableColumnsAdminTxn(type) {
    let columns = [];
    this.AdminTxnList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsAdminTxn()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (key == 'state_expdate' && new Date(lead[key]) < this.common.getDate()) {
          column[key] = { value: lead[key], class: 'black font-weight-bold', action: '' };
        }
        else if (key == 'mobile_no') {
          column[key] = { value: lead[key], class: lead['_contact_count'] > 1 ? 'font-weight-bold' : '', action: '' };
        }
        else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }
        column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
        column['rowActions'] = { 'click': this.transMessage.bind(this, lead, type) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end:set table admin txn

  actionIcons(lead, type) {
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

    if (type == 1) {//for me
      icons.push({ class: 'fas fa-address-book s-4', action: this.addTransContact.bind(this, lead, type), txt: '', title: "Address Book" });
      icons.push({ class: "fa fa-thumbs-up text-success", action: this.openTransAction.bind(this, lead, type, null, true), txt: '', title: "Mark Completed" });
      icons.push({ class: "fas fa-plus-square text-primary", action: this.openPrimaryInfoFormData.bind(this, lead, type), txt: '', title: "Primary Info Form" });
      icons.push({ class: "fa fa-info-circle", action: this.editTransaction.bind(this, lead, type), txt: '', title: "View transaction" });

      if (lead._revert_action > 0) {
        icons.push({ class: "fa fa-thumbs-down text-primary", action: this.openTransAction.bind(this, lead, type, null, false), txt: '', title: "Inverse" });
      }
    } else if (!type) {
      icons.push({ class: "far fa-edit", action: this.editTransaction.bind(this, lead, type), txt: '', title: "Edit Txn" });
      if (lead._claim_txn) {
        icons.push({ class: "fa fa-hand-lizard-o text-warning", action: this.updateLeadPrimaryOwner.bind(this, lead, type), txt: '', title: "Claim Txn" });
      }
    } else if (type == 2 || type == 6 || type == 7) { //by me or owned by me
      icons.push({ class: "far fa-edit", action: this.editTransaction.bind(this, lead, type), txt: '', title: "Edit Txn" });
      icons.push({ class: 'fas fa-trash-alt', action: this.deleteTransaction.bind(this, lead, type), txt: '', title: "Delete Txn" });
      icons.push({ class: 'fas fa-address-book s-4', action: this.addTransContact.bind(this, lead, type), txt: '', title: "Address Book" });
      if (lead._state_type == 2) {
        icons.push({ class: "fa fa-thumbs-up text-success", action: this.updateTransactionStatusWithConfirm.bind(this, lead, type, 5), txt: '', title: "Mark Completed" });
      }
      else if (!(lead.pending_action)) {
        icons.push({ class: "fa fa-grip-horizontal", action: this.openTransAction.bind(this, lead, type), txt: '', title: "Add Next State" });
      }
      else {
        icons.push({ class: "fa fa-handshake", action: this.openTransAction.bind(this, lead, type, 2), txt: '', title: "Add Next Action" });
      }

      icons.push({ class: "fa fa-files-o", action: this.openDocList.bind(this, lead), txt: '', title: "All Document" });

    } else if (type == -1) {
      icons.push({ class: "fa fa-grip-horizontal", action: this.openTransAction.bind(this, lead, type, 1), txt: '', title: "Add Next State" });
      // icons.push({ class: "fa fa-user-plus", action: this.openTransAction.bind(this, lead, type), txt: '', title: "Assign Action Owner" });
    } else if (type == 3 && !lead._cc_status) { //cc
      icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByCcUser.bind(this, lead, type), txt: '', title: "Mark Ack as CC Lead" });

    } else if (type == 5) {//unread
      if (lead._cc_user_id > 0) {
        if (!lead._cc_status) {
          icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByCcUser.bind(this, lead, type), txt: '', title: "Mark Ack as CC Lead" });
        }
      } else if (lead._is_action == 1) {
        if (lead._status == 0) {
          icons.push({ class: "fa fa-thumbs-up text-warning", action: this.updateLeadActionStatus.bind(this, lead, type, 2), txt: '', title: "Mark Ack As Action" });
        }
      } else if (lead._status == 0) {
        icons.push({ class: "fa fa-thumbs-up text-warning", action: this.updateTransactionStatus.bind(this, lead, type, 2), txt: '', title: "Mark Ack" });
      } else if (lead._status == 2 && lead._state_type == 2) {
        icons.push({ class: "fa fa-thumbs-up text-success", action: this.updateTransactionStatusWithConfirm.bind(this, lead, type, 5), txt: '', title: "Mark Lead As completed" });
      } else if (lead._status == 5 && lead._ack_to_aduser == 1 && !lead._is_send) {
        icons.push({ class: "fa fa-check-square text-warning", action: this.ackLeadByAssigner.bind(this, lead, type), txt: '', title: "Mark Ack by Adduser" });
      }
    } else if (type == 4) {
      icons.push({ class: "fa fa-retweet", action: this.reviveTransAction.bind(this, lead, type, 1), txt: '', title: "Revive Transaction" });
    }

    if (type == 4 || lead._status == 5 || lead._status == -1) {
    } else {
      if (lead._isremind == 1) {
        icons.push({ class: "fa fa-bell isRemind", action: this.checkReminderSeen.bind(this, lead, type), txt: '', title: "Check Reminder" });
      } else if (lead._isremind == 2 && type != 5) {
        icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, lead, type), txt: '', title: "Edit Reminder" });
      } else if (type != 5) {
        icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, lead, type), txt: '', title: "Add Reminder" });
      }
    }
    return icons;
  }

  revert(lead) {
    console.log("🚀 ~ file: my-process.component.ts ~ line 855 ~ MyProcessComponent ~ revert ~ lead", lead)

  }

  editTransaction(lead, type) { //used in multi pages same func
    // this.common.showError("Edit Transaction on Working...");
    let rowData = {
      transId: lead._transactionid,
      processId: lead._processid,
      processName: lead._processname,
      identity: lead.identity,
      priOwnId: lead._pri_own_id,
      isDisabled: (type==1) ? true : ((lead._txn_editable) ? false : true),
      _default_identity: (lead._default_identity) ? lead._default_identity : 0,
    }
    let title = (type==1) ? "View Transaction" : "Add Transaction";

    this.common.params = { rowData, processList: this.processList, adminList: this.adminList, title: title, button: "Update" }
    const activeModal = this.modalService.open(AddTransactionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        // this.activeTab = 'leadsByMe';
        this.getProcessLeadByType(type);
      }
    });
  }

  deleteTransaction(lead, type) {
    console.log(lead, type);
    if (type == 7) {
      if (lead._delete_txn == 1 || lead._delete_txn == 5) {
        this.deletCallBack(lead, type);
      } else {
        this.common.showError('Permission Denied');
      }
    } else if (type == 2 || type == 6) {
      if (lead._delete_txn == 5) {
        this.deletCallBack(lead, type);
      } else {
        this.common.showError('Permission Denied');
      }
    }
  }

  deletCallBack(lead, type) {
    let params = {
      transId: lead._transactionid
    }
    if (lead._transactionid) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteTransaction', params).subscribe(res => {
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
        }
      });
    } else {
      this.common.showError("Invalid Request");
    }
  }

  reviveTransAction(lead, type) {
    let params = {
      transId: lead._transactionid
    }
    if (lead._transactionid) {
      this.common.params = {
        title: 'Revive Record',
        description: `<b>&nbsp;` + 'Are Sure To Revive This Transaction' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/reviveTransaction', params).subscribe(res => {
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
        }
      });
    } else {
      this.common.showError("Invalid Request");
    }
  }

  addTransContact(lead, type) {
    // this.common.showError("Add Contact on working...");
    let editData = {
      transId: lead._transactionid
    };
    this.common.params = { editData, title: "Transaction Contacts", button: "Add" };
    const activeModal = this.modalService.open(AddTransactionContactComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getProcessLeadByType(type);
    });
  }

  openTransAction(lead, type, formType = null, isComplete: Boolean = null) {
    console.log("openTransAction", lead);
    let formTypeTemp = 0;
    if (!formType) {
      formTypeTemp = ([2, 6, 7].includes(type)) ? 1 : 0;
    } else {
      formTypeTemp = formType;
    }
    let actionData = {
      processId: lead._processid,
      transId: lead._transactionid,
      processName: lead._processname,
      identity: lead.identity,
      formType: formTypeTemp,
      requestId: (type == 1) ? lead._transaction_actionid : null,
      actionId: (lead._action_id > 0) ? lead._action_id : null,
      actionName: (lead._action_id > 0) ? lead._action_name : '',
      stateId: (lead._state_id > 0) ? lead._state_id : null,
      stateName: (lead._state_id > 0) ? lead._state_name : '',
      actionOwnerId: lead._action_owner,
      modeId: (lead._mode_id > 0) ? lead._mode_id : null,
      modeName: (lead._mode_id > 0) ? lead._mode_name : '',
      remark: (lead._remark) ? lead._remark : null,
      isStateForm: lead._state_form,
      isActionForm: lead._action_form,
      isModeApplicable: (lead._is_mode_applicable) ? lead._is_mode_applicable : 0,
      isMarkTxnComplete: ((lead._state_change == 2 && type == 1) || [2, 6, 7].includes(type)) ? 1 : null
    };
    let title = (actionData.formType == 0) ? 'Transaction Action' : 'Transaction Next State';
    this.common.params = { actionData, adminList: this.adminList, title: title, button: "Add", isComplete: isComplete };
    const activeModal = this.modalService.open(AddTransactionActionComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log("res data:", data, lead);
      if (data.response && data.nextFormType) {
        // nextFormType: 1 = fromstate, 2=fromaction
        if (data.nextFormType == 1) {
          lead['_next_state_id'] = data.state.id;
          lead['next_state_name'] = data.state.name;
          if (data.isFormHere == 1) {
            this.openTransFormData(lead, type, data.nextFormType);
          } else {
            lead._state_id = data.state.id;
            lead.state_name = data.state.name;
            this.openTransAction(lead, type, 2);
          }

        } else if (data.nextFormType == 2) {
          if (data.isFormHere == 1) {
            this.openTransFormData(lead, type, data.nextFormType);
          } else {
            this.openTransAction(lead, type, 1);
          }
        }
      } else {
        this.getProcessLeadByType(type);
      }
    });
  }

  openTransFormData(lead, type, formType = null) {
    console.log("openTransAction");
    let title = 'Action Form';
    let refId = 0;
    let refType = 0;
    // formType: 1 = stateform, 2=actionform
    if (formType == 1) {
      title = 'State Form';
      refId = lead._state_id;
      refType = 0;
    } else if (formType == 2) {
      title = 'Action Form';
      refId = lead._action_id;
      refType = 1;
    }
    let actionData = {
      processId: lead._processid,
      processName: lead._processname,
      transId: lead._transactionid,
      refId: refId,
      refType: refType,
      formType: formType,
    };

    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log("formData:", formType);
      if (formType == 2) {
        this.openTransAction(lead, type, 1);
      } else if (formType == 1) {
        if(lead._next_state_id){
          lead._state_id = lead._next_state_id;
          lead.state_name = lead.next_state_name;
        }
        this.openTransAction(lead, type, 2);
      } else {
        this.getProcessLeadByType(type);
      }
    });
  }

  openPrimaryInfoFormData(lead, type) {
    let title = 'Primary Info Form';
    let actionData = {
      processId: lead._processid,
      processName: lead._processname,
      transId: lead._transactionid,
      refId: lead._processid,
      refType: 3,
      formType: null,
    };

    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getProcessLeadByType(type);
    });
  }

  openDocList(lead) {
    this.common.params = { transId: lead._transactionid }
    const activeModal = this.modalService.open(DocumentListingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  updateTransactionStatus(lead, type, status) {
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

  transMessage(lead, type) {
    console.log("transMessage:", lead);
    if (lead._transactionid > 0) {
      let editData = {
        transactionid: lead._transactionid,
        lastSeenId: lead._lastreadid,
        tabType: type,
        priOwnId: (lead._pri_own_id > 0) ? lead._pri_own_id : null,
        rowData: lead,
        stateOwnerId: lead._state_owner_id
      }
      this.common.params = {
        editData, title: "Transaction Comment", button: "Save", subTitle: lead.identity, fromPage: 'process',
        userList: this.adminList,
        groupList: null,
        departmentList: null
      };
      const activeModal = this.modalService.open(ChatboxComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        this.getProcessLeadByType(type);
      });
    } else {
      this.common.showError("Invalid Lead");
    }
  }

  searchAllCompletedLead() {
    console.log("searchData:", this.searchData);
    if (this.searchData.startDate && this.searchData.endDate) {
      let startDate = this.common.dateFormatter(this.searchData.startDate);
      let endDate = this.common.dateFormatter(this.searchData.endDate);
      this.getProcessLeadByType(4, startDate, endDate);
    } else {
      this.common.showError("Select start date and end date");
    }
  }

  showReminderPopup(lead, type) {
    // console.log("showReminderPopup");
    this.common.params = { ticketId: lead._transactionid, title: "Add Reminder", btn: "Set Reminder", fromPage: "trans" };
    const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getProcessLeadByType(type);
      }
    });
  }

  checkReminderSeen(lead, type) {
    let params = {
      ticketId: lead._transactionid
    };
    this.common.loading++;
    this.api.post('Processes/checkLeadReminderSeen', params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.common.showToast(res['msg']);
      this.getProcessLeadByType(type);
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
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

  uploadDataByCsv() {
    //console.log("uploadDataByCsv");
    this.common.params = { title: "CSV", button: "Upload", typeFrom: 'process', processList: this.processList };
    const activeModal = this.modalService.open(CsvUploadComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.activeTab = 'leadsByMe';
        this.getProcessLeadByType(2);
      }
    });
  }

  infoMatrix(lead, type) {
    console.log("infoMatrix");
    let ref = {
      // id: lead._processid,
      id: lead._state_id,
      type: 0
    }
    this.common.params = { ref: ref };
    const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.response);
      }
    });
  }

  openDynamicDashboard(processId, processName) {
    this.common.params = { processId: processId, processName: processName };
    console.log("params:", this.common.params);
    const activeModal = this.modalService.open(ViewDashboardComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  updateLeadPrimaryOwner(lead, type) {
    let apiBase = '';
    let params = {};
    if (lead.assigned_to == null) {
      apiBase = "Processes/updateLeadPrimaryOwner";
      params = {
        leadId: lead._transactionid,
        assigneeUserId: this.userService._details.id,
        isCCUpdate: 0,
        assigneeUserNameOld: null,
        assigneeUserNameNew: this.userService._details.name,
        isClaim: 1
      }
    } else {
      apiBase = "Processes/changeTransactionActionOwner";
      params = {
        transId: lead._transactionid,
        transActionId: lead._trans_action_id,
        actionOwnerId: this.userService._details.id,
        actionOwnerName: this.userService._details.name,
        actionOwnerNameOld: null,
        isClaim: 1
      }
    }
    if (lead._transactionid > 0) {
      this.common.loading++;
      this.api.post(apiBase, params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            if (!lead.pending_action) {
              this.openTransAction(lead, type, 1);
            }
            this.getProcessLeadByType(type);
          } else {
            this.common.showError(res['data'][0].y_msg);
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
      this.common.showError("Select Primary Owner")
    }
  }

  filterTicketBySubTab(type, subTabType) {
    if (type == 4) {
      let selectedList = [];
      if (subTabType == 1) {//by me
        selectedList = this.completedLeadsForFilter.filter((x) => {
          return x._aduserid == this.loginUserId;
        });
      } else if (subTabType == 2) {//owned by me
        selectedList = this.completedLeadsForFilter.filter((x) => {
          return x._pri_own_id == this.loginUserId;
        });
      } else if (subTabType == 3) {//admin
        selectedList = this.completedLeadsForFilter.filter((x) => {
          return x._admin_id == this.loginUserId;
        });
      } else {//all
        selectedList = this.completedLeadsForFilter;
      }
      this.allCompletedLeads = selectedList.length > 0 ? selectedList : [];
      this.setTableAllCompletedLeads(type);
    }
  }
}
