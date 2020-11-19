import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddTransactionComponent } from '../../modals/process-modals/add-transaction/add-transaction.component';
import { FormDataComponent } from '../../modals/process-modals/form-data/form-data.component';
import { AddTransactionActionComponent } from '../../modals/process-modals/add-transaction-action/add-transaction-action.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-on-site-images',
  templateUrl: './on-site-images.component.html',
  styleUrls: ['./on-site-images.component.scss']
})
export class OnSiteImagesComponent implements OnInit {
  adminReportList: any;
  startDate = this.common.getDate(-2);
  endDate = this.common.getDate();
  today = new Date();
  selectedOnSiteImageId = null;
  adminList = [];
  processList = [];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  transActionList = null;
  tableTransActionList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  txnByMe = [];
  tableTxnByMe = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal) {
    this.getAdminReportsByUser();
    this.getAllAdmin();
    this.getProcessList();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() { }

  refresh() {
    this.getAdminReportsByUser();
    this.getAllAdmin();
    this.getProcessList();
    this.selectedOnSiteImageId = null;
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
      if (!res['data']) return;
      this.processList = res['data'];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getAdminReportsByUser() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let startDate = (this.startDate) ? this.common.dateFormatter(this.startDate) : null;
    let endDate = (this.endDate) ? this.common.dateFormatter(this.endDate) : null;
    const params = `?startDate=${startDate}&endDate=${endDate}`;
    // return;
    this.common.loading++;
    this.api.get('Admin/getOnSiteImagesByUser' + params, 'I').subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data']) {
          this.adminReportList = res['data'] || [];
          this.adminReportList.length ? this.setTable() : this.setTable();
          console.log(this.adminReportList);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      console.log(err);
    });
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
    for (var key in this.adminReportList[0]) {
      console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.adminReportList.map(adminReport => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(adminReport)
          };
        } else if (key == 'image') {
          column[key] = { value: adminReport[key], class: 'blue', action: this.goToImage.bind(this, adminReport['_url']) };
        } else {
          column[key] = { value: adminReport[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  goToImage(img) {
    window.open(img);
  }

  actionIcons(adminReport) {
    let icons = [
      { class: adminReport._refid > 0 ? "fas fa-sitemap" : "fas fa-sitemap blue", action: adminReport._refid > 0 ? null : this.openTransActionListModal.bind(this, adminReport), txt: "", title: 'Map with Txn Action', }
    ];
    return icons;
  }

  openTransActionListModal(adminReport) {
    this.selectedOnSiteImageId = adminReport._id;
    if (this.selectedOnSiteImageId > 0) {
      this.getProcessLeadByType(10);
      document.getElementById('transActionList').style.display = 'block';
    } else {
      this.common.showError("Invalid Request");
    }
  }

  closeTransActionListModal() {
    this.selectedOnSiteImageId = null;
    document.getElementById('transActionList').style.display = 'none';
    this.getAdminReportsByUser();
  }

  getProcessLeadByType(type) {
    let startDate = null, endDate = null;
    if (type == 10) {
      this.tableTransActionList.data = {
        headings: {},
        columns: []
      };
    } else if (type == 2) {
      this.tableTxnByMe.data = {
        headings: {},
        columns: []
      };
    }
    this.common.loading++;
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Processes/getMyProcessByType" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (type == 10) {
          this.transActionList = res['data'] || [];
          this.setTableTransActionList(type);
        } else if (type == 2) { //by me pending
          this.txnByMe = res['data'] || [];
          this.setTableTxnByMe(type);
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

  // start: TransActionList
  setTableTransActionList(type) {
    this.tableTransActionList.data = {
      headings: this.generateHeadingsTransActionList(),
      columns: this.getTableColumnsTransActionList(type)
    };
    return true;
  }

  generateHeadingsTransActionList() {
    let headings = {};
    for (var key in this.transActionList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsTransActionList(type) {
    let columns = [];
    this.transActionList.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsTransActionList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsForTransAction(lead, type)
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
  // end: TransActionList

  // start: leads by me
  setTableTxnByMe(type) {
    this.tableTxnByMe.data = {
      headings: this.generateHeadingsLeadsByMe(),
      columns: this.getTableColumnsLeadsByMe(type)
    };
    return true;
  }

  generateHeadingsLeadsByMe() {
    let headings = {};
    for (var key in this.txnByMe[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_expdate" || key === 'state_expdate') {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsLeadsByMe(type) {
    let columns = [];
    this.txnByMe.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsLeadsByMe()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsForTransAction(lead, type)
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
  // end: leads by me

  actionIconsForTransAction(lead, type) {
    let icons = [];
    if (type == 10) {
      icons = [
        { class: "fa fa-plus", action: this.mapOnSiteImageWithTransAction.bind(this, lead), txt: "", title: 'Map with on-site-image', }
      ];
    } else if (type == 2) {
      if (lead._state_type == 2) {
        icons.push({ class: "fa fa-thumbs-up text-success", action: null, txt: '', title: "Mark Completed from my-process page" });
      } else if (!(lead.pending_action)) {
        icons.push({ class: "fa fa-grip-horizontal", action: this.openTransAction.bind(this, lead, type), txt: '', title: "Add Next State" });
      } else {
        icons.push({ class: "fa fa-handshake", action: this.openTransAction.bind(this, lead, type, 2), txt: '', title: "Add Next Action" });
      }

    }
    return icons;
  }

  mapOnSiteImageWithTransAction(lead) {
    let params = {
      transActionId: lead._transaction_actionid,
      onSiteImageId: this.selectedOnSiteImageId
    }
    this.common.params = {
      title: 'Map On-Site_image with txn action',
      description: '<b>Are you sure to map ?<b>',
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        this.common.loading++;
        this.api.post("Processes/mapOnSiteImageWithTransAction", params).subscribe(res => {
          this.common.loading--;
          if (res['code'] == 1) {
            this.common.showToast(res['msg']);
            this.closeTransActionListModal();
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
  }

  closeAddTransactionModal() {
    document.getElementById('addTransactionModal').style.display = 'none';
    this.getProcessLeadByType(10);
  }

  openAddTransactionModal() {
    this.getProcessLeadByType(2);
    document.getElementById('addTransactionModal').style.display = 'block';
  }

  addTransaction() {
    this.common.params = { processList: this.processList, adminList: this.adminList, title: "Add Transaction ", button: "Add" }
    const activeModal = this.modalService.open(AddTransactionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getProcessLeadByType(2);
      }
    });
  }

  openTransAction(lead, type, formType = null) {
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
      requestId: (type == 10) ? lead._transaction_actionid : null,
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
      isMarkTxnComplete: ((lead._state_change == 2 && type == 10) || [2, 6, 7].includes(type)) ? 1 : null
    };
    let title = (actionData.formType == 0) ? 'Transaction Action' : 'Transaction Next State';
    this.common.params = { actionData, adminList: this.adminList, title: title, button: "Add" };
    const activeModal = this.modalService.open(AddTransactionActionComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      // console.log("res data:", data, lead);
      if (data.response && data.nextFormType) {
        // nextFormType: 1 = fromstate, 2=fromaction
        if (data.nextFormType == 1) {
          lead._state_id = data.state.id;
          lead.state_name = data.state.name;
          if (data.isFormHere == 1) {
            this.openTransFormData(lead, type, data.nextFormType);
          } else {
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
        this.closeAddTransactionModal();
        this.getProcessLeadByType(type);
      }
    });
  }

  openTransFormData(lead, type, formType = null) {
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
      // console.log("formData:", formType);
      if (formType == 2) {
        this.openTransAction(lead, type, 1);
      } else if (formType == 1) {
        this.openTransAction(lead, type, 2);
      } else {
        this.closeAddTransactionModal();
        this.getProcessLeadByType(type);
      }
    });
  }


}
