import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { FieldIssueComponent } from '../../modals/field-issue/field-issue.component';
import { AssignInstallerToFieldrequestComponent } from '../../modals/assign-installer-to-fieldrequest/assign-installer-to-fieldrequest.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { ApproveFieldSupportRequestComponent } from '../../modals/approve-field-support-request/approve-field-support-request.component';

@Component({
  selector: 'field-issue-request',
  templateUrl: './field-issue-request.component.html',
  styleUrls: ['./field-issue-request.component.scss']
})
export class FieldIssueRequestComponent implements OnInit {
  activeTab = "";
  activeTabTicket = '';
  issueReqList = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };

  assignReqList = [];
  tableAssignReqList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };

  approvedReqList = [];
  tableApprovedReqList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  completedReqList = [];
  tableCompletedReqList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  pendingTicketList = [];
  tablePendingTicketList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };
  ackTicketList = [];
  tableAckTicketList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };
  completedTicketList = [];
  tableCompletedTicketList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };
  rejectedTicketList = [];
  tableRejectedTicketList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };

  constructor(
    public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {
    // this.showIssueRequest();
    // this.getFieldSupportRequestByType(1);
  }

  ngOnInit() {
  }

  addRequest(mode = null) {
    if (mode != 'edit') {
      this.common.params = null;
    }
    const activeModal = this.modalService.open(FieldIssueComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        // this.showIssueRequest();
        this.getFieldSupportRequestByType(1);
      }
    })
  }

  resetSmartTableData() {
    this.table.data = {
      headings: {},
      columns: []
    };
    this.tableAssignReqList.data = {
      headings: {},
      columns: []
    };
    this.tableApprovedReqList.data = {
      headings: {},
      columns: []
    };
    this.tableCompletedReqList.data = {
      headings: {},
      columns: []
    };
    this.tablePendingTicketList.data = {
      headings: {},
      columns: []
    };
    this.tableAckTicketList.data = {
      headings: {},
      columns: []
    };
    this.tableCompletedTicketList.data = {
      headings: {},
      columns: []
    };
    this.tableRejectedTicketList.data = {
      headings: {},
      columns: []
    };
  }

  // showIssueRequest() {
  getFieldSupportRequestByType(type = null) {
    this.issueReqList = [];
    this.resetSmartTableData();
    let param = "";
    if (type) {
      param = "?type=" + type;
    }
    this.common.loading++;
    this.api.get('Grid/getFieldSupportRequestList' + param)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        if (type == 1) {
          this.issueReqList = res['data'] || [];
          this.issueReqList.length ? this.setTable() : this.resetSmartTableData();
        } else if (type == 2) {
          this.assignReqList = res['data'] || [];
          this.assignReqList.length ? this.setTableAssignReqList() : this.resetSmartTableData();
        } else if (type == 3) {
          this.approvedReqList = res['data'] || [];
          this.approvedReqList.length ? this.setTableApprovedReqList() : this.resetSmartTableData();
        } else if (type == 4) {
          this.completedReqList = res['data'] || [];
          this.completedReqList.length ? this.setTableCompletedReqList() : this.resetSmartTableData();
        }
        console.log(this.issueReqList);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  // start: initial field request list
  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.issueReqList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.issueReqList.map(request => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end: initial field request list
  // start: assigned field request list
  setTableAssignReqList() {
    this.tableAssignReqList.data = {
      headings: this.generateHeadingsAssignReqList(),
      columns: this.getTableColumnsAssignReqList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsAssignReqList() {
    let headings = {};
    for (var key in this.assignReqList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsAssignReqList() {
    let columns = [];
    this.assignReqList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsAssignReqList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : assigned field request list
  // start: approved field request list
  setTableApprovedReqList() {
    this.tableApprovedReqList.data = {
      headings: this.generateHeadingsApprovedReqList(),
      columns: this.getTableColumnsApprovedReqList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsApprovedReqList() {
    let headings = {};
    for (var key in this.approvedReqList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsApprovedReqList() {
    let columns = [];
    this.approvedReqList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsApprovedReqList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : approved field request list
  // start: completed field request list
  setTableCompletedReqList() {
    this.tableCompletedReqList.data = {
      headings: this.generateHeadingsCompletedReqList(),
      columns: this.getTableColumnsCompletedReqList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsCompletedReqList() {
    let headings = {};
    for (var key in this.completedReqList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsCompletedReqList() {
    let columns = [];
    this.completedReqList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsCompletedReqList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : completed field request list

  actionIcons(request) {
    let icons = [
      { class: "fa fa-edit", action: this.editFieldSupportRequest.bind(this, request), txt: '' },
      { class: "fa fa-trash", action: this.deleteFieldSupportRequest.bind(this, request), txt: '' },
      { class: "fa fa-user-plus", action: this.openAssignInstallerToFieldrequestModal.bind(this, request), txt: '' }
    ];

    return icons;
  }
  actionIconsForApprove(request) {
    let icons = [
      { class: "fa fa-edit", action: this.openApproveFieldrequestModal.bind(this, request), txt: '' },
    ];

    return icons;
  }
  editFieldSupportRequest(request) {
    console.log("edit request:", request);
    // let editData = {
    //   requestId: request._id
    // }
    this.common.params = { request, title: "Edit Field Support Request", button: "Edit" };
    this.addRequest('edit');
  }

  deleteFieldSupportRequest(request, ) {
    if (request._id) {
      let params = {
        requestId: request._id
      }
      this.common.params = {
        title: 'Delete Field Support Request ',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Grid/deleteFieldSupportRequest', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getFieldSupportRequestByType(1);
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Request ID Not Available");
    }
  }

  openAssignInstallerToFieldrequestModal(request) {
    console.log("request:", request);
    if (request._id) {
      this.common.params = { requestId: request._id };
      const activeModal = this.modalService.open(AssignInstallerToFieldrequestComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          this.getFieldSupportRequestByType(1);
        }
      })
    } else {
      this.common.showError("Request-Id is missing");
    }
  }

  openApproveFieldrequestModal(request) {
    console.log("request:", request);
    if (request._id) {
      this.common.params = { request, title: "Approve Field Support Request", button: "Approve" };
      const activeModal = this.modalService.open(ApproveFieldSupportRequestComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          this.getFieldSupportRequestByType(2);
        }
      })
    } else {
      this.common.showError("Request-Id is missing");
    }
  }

  // start tck

  getFieldSupportTicketByType(type = null) {
    this.issueReqList = [];
    this.resetSmartTableData();
    let param = "";
    if (type) {
      param = "?type=" + type;
    }
    this.common.loading++;
    this.api.get('Installer/getInstallerRequestList' + param)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        if (type == 1) {
          this.pendingTicketList = res['data'] || [];
          this.pendingTicketList.length ? this.setTablePendingTicketTable() : this.resetSmartTableData();
        } else if (type == 2) {
          this.ackTicketList = res['data'] || [];
          this.ackTicketList.length ? this.setTableAckTicketList() : this.resetSmartTableData();
        } else if (type == 3) {
          this.completedTicketList = res['data'] || [];
          this.completedTicketList.length ? this.setTableCompletedTicketList() : this.resetSmartTableData();
        } else if (type == 4) {
          this.rejectedTicketList = res['data'] || [];
          this.rejectedTicketList.length ? this.setTableRejectedTicketList() : this.resetSmartTableData();
        }
        console.log(this.issueReqList);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  // end tkt
  // start: pending tkt list
  setTablePendingTicketTable() {
    this.tablePendingTicketList.data = {
      headings: this.generateHeadingsPendingTicketList(),
      columns: this.getTableColumnsPendingTicketList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsPendingTicketList() {
    let headings = {};
    for (var key in this.pendingTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsPendingTicketList() {
    let columns = [];
    this.pendingTicketList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsPendingTicketList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : pending tkt list
  // start: ack tkt list
  setTableAckTicketList() {
    this.tableAckTicketList.data = {
      headings: this.generateHeadingsAckTicketList(),
      columns: this.getTableColumnsAckTicketList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsAckTicketList() {
    let headings = {};
    for (var key in this.ackTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsAckTicketList() {
    let columns = [];
    this.ackTicketList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsAckTicketList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : ack tkt list
  // start: completed tkt list
  setTableCompletedTicketList() {
    this.tableAckTicketList.data = {
      headings: this.generateHeadingsCompletedTicketList(),
      columns: this.getTableColumnsCompletedTicketList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsCompletedTicketList() {
    let headings = {};
    for (var key in this.completedTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsCompletedTicketList() {
    let columns = [];
    this.completedTicketList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsCompletedTicketList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : completed tkt list
  // start: rejected tkt list
  setTableRejectedTicketList() {
    this.tableRejectedTicketList.data = {
      headings: this.generateHeadingsRejectedTicketList(),
      columns: this.getTableColumnsRejectedTicketList()
    };
    console.log('Table:', this.table.data);
    return true;
  }

  generateHeadingsRejectedTicketList() {
    let headings = {};
    for (var key in this.rejectedTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsRejectedTicketList() {
    let columns = [];
    this.rejectedTicketList.map(request => {
      let column = {};
      for (let key in this.generateHeadingsRejectedTicketList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIconsForApprove(request)
          };
        } else {
          column[key] = { value: request[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end : rejected tkt list

}
