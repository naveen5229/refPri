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
            icons: this.actionIconsForApprove(request)
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

}
