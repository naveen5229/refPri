import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddTransactionActionComponent } from '../../modals/process-modals/add-transaction-action/add-transaction-action.component';
import { ChatboxComponent } from '../../modals/process-modals/chatbox/chatbox.component';
import { FormDataComponent } from '../../modals/process-modals/form-data/form-data.component';
import { AddTransactionComponent } from '../../modals/process-modals/add-transaction/add-transaction.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { AddTransactionContactComponent } from '../../modals/process-modals/add-transaction-contact/add-transaction-contact.component';
import { DocumentListingComponent } from '../../modals/document-listing/document-listing.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';

@Component({
  selector: 'ngx-personalised-dashboard',
  templateUrl: './personalised-dashboard.component.html',
  styleUrls: ['./personalised-dashboard.component.scss']
})
export class PersonalisedDashboardComponent implements OnInit {
  activeTab = null;
  adminList = [];
  processList = [];
  ownedByMeList = [];
  processId = null;
  tableOwnedByMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  leadsForMe = [];
  tableLeadsForMe = {
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
    this.getProcessList();
    this.getAllAdmin();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {}

  refresh() {
    this.getProcessList();
    this.getAllAdmin();
    this.activeTab = null;
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
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

  getProcessLeadByType(type) {
    if (!this.processId) {
      this.common.showError("Process is missing");
      this.activeTab = null;
      return false;
    }
    this.common.loading++;
    let processid = this.processId._id;
    let startDate = this.common.dateFormatter(this.searchData.startDate, null, false);
    let endDate = this.common.dateFormatter(this.searchData.endDate, null, false);
    this.resetSmartTableData();
    let params = "?processId=" + processid + "&type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Processes/getProcessDashboardData" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (type == 2) {//for me
          this.leadsForMe = res['data'] || [];
          this.setTableLeadsForMe(type);
        } else if (type == 1) {
          this.ownedByMeList = res['data'] || [];
          this.setTableOwnedByMe(type);
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
      }
      columns.push(column);
    });
    return columns;
  }
  // end: leads for me

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
      }
      columns.push(column);
    });
    return columns;
  }
  // end:ownedbyme lead

  resetSmartTableData() {
    this.tableLeadsForMe.data = this.tableOwnedByMe.data = {
      headings: {},
      columns: []
    };
  }

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

    if (type == 2) {//for me
      icons.push({ class: 'fas fa-address-book s-4', action: this.addTransContact.bind(this, lead, type), txt: '', title: "Address Book" });
      icons.push({ class: "fa fa-thumbs-up text-success", action: this.openTransAction.bind(this, lead, type,null,true), txt: '', title: "Mark Completed" });
      icons.push({ class: "fas fa-plus-square text-primary", action: this.openPrimaryInfoFormData.bind(this, lead, type), txt: '', title: "Primary Info Form" });

    } else if (type == 1) { //by me or owned by me
      icons.push({ class: "far fa-edit", action: this.editTransaction.bind(this, lead, type), txt: '', title: "Edit Lead" });
      icons.push({ class: 'fas fa-trash-alt', action: this.deleteTransaction.bind(this, lead, type), txt: '', title: "Delete Lead" });
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

  transMessage(lead, type) {
    console.log("transMessage:", lead);
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

  showReminderPopup(lead, type) {
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

  openTransAction(lead, type, formType = null, isComplete: Boolean = null) {
    console.log("openTransAction");
    let formTypeTemp = 0;
    if (!formType) {
      formTypeTemp = (type == 1 || type == 6) ? 1 : 0;
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
      isMarkTxnComplete: ((lead._state_change == 2 && type == 1) || [1].includes(type)) ? 1 : null
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
            if(lead._auto_assign_na>0){
              this.getProcessLeadByType(type);
            }else{
              this.openTransAction(lead, type, 2);
            }
          }

        } else if (data.nextFormType == 2) {
          if (data.isFormHere == 1) {
            this.openTransFormData(lead, type, data.nextFormType);
          } else {
            if(lead._auto_assign_na>0){
              this.getProcessLeadByType(type);
            }else{
              this.openTransAction(lead, type, 1);
            }
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

  editTransaction(lead, type) {
    // this.common.showError("Edit Transaction on Working...");
    let rowData = {
      transId: lead._transactionid,
      processId: lead._processid,
      processName: lead._processname,
      identity: lead.identity,
      priOwnId: lead._pri_own_id,
      isDisabled: (lead._txn_editable) ? false : true,
      _default_identity: (lead._default_identity) ? lead._default_identity : 0,
    }

    this.common.params = { rowData, processList: this.processList, adminList: this.adminList, title: "Add Transaction ", button: "Update" }
    const activeModal = this.modalService.open(AddTransactionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        // this.activeTab = 'leadsByMe';
        this.getProcessLeadByType(type);
      }
    });
  }

  deleteTransaction(lead, type) {
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
  
  openDocList(lead) {
    this.common.params = { transId: lead._transactionid }
    const activeModal = this.modalService.open(DocumentListingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

}
