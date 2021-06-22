import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { AddentityfieldsComponent } from '../addentityfields/addentityfields.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'ngx-functional-reporting-mapping',
  templateUrl: './functional-reporting-mapping.component.html',
  styleUrls: ['./functional-reporting-mapping.component.scss']
})
export class FunctionalReportingMappingComponent implements OnInit {
  activeAdminUserList = [];
  reportingTypeList = [
    { id: 1, name: 'Reporting Manager' },
    { id: 0, name: 'Subordinate' }
  ]
  loggedInUser = null;
  title = "";
  button = "Add";
  reportingForm = {
    selectedUserId: null,
    funtionalUsertype: 1,
    user: { id: null, name: null },
    type: { id: 1, name: 'Reporting Manager' }
  }

  allReportingDataList = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  fromPage = null; //null=process,1=>ticket
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal,
    public userService: UserService) {
    this.loggedInUser = this.userService._details;
    this.title = this.common.params.title ? this.common.params.title : 'Functional Reporting Mapping';
    this.reportingForm.selectedUserId = this.common.params.activeAdminDetail.id;
    // this.button = this.common.params.button ? this.common.params.button : 'Add';
    // this.fromPage = this.common.params.fromPage ? this.common.params.fromPage : null;
    // if (this.common.params && this.common.params.editData) {
    //   this.contactForm.transId = this.common.params.editData.transId;
    // };
    this.getAllReporters();
    this.getActiveAdminList();
    this.common.refresh = this.refresh.bind(this);
  }
  // use from two module change carefully

  closeModal() {
    this.activeModal.close({ response: false });
  }

  refresh() {
    this.getAllReporters();
    this.getActiveAdminList();
  }

  ngOnInit() { }

  getActiveAdminList() {
    this.common.loading++;
    this.api.get('Admin/getAllAdmin').subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      (res['data']) ? this.activeAdminUserList = res['data'].map(admin => { return { id: admin.id, name: admin.name } }) : this.activeAdminUserList = [];
      if (this.activeAdminUserList && this.activeAdminUserList.length > 0) {
        this.activeAdminUserList = this.activeAdminUserList.filter(user => user.id != this.loggedInUser.id);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getAllReporters(type = 1) {
    this.resetTable();
    let params = `?userId=${this.reportingForm.selectedUserId}&type=${type}`;
    let apiName = "Admin/getFunctionalRm";
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (!res['data']) return;
      this.allReportingDataList = res['data'] || [];
      this.allReportingDataList.length ? this.setTable() : this.resetTable();
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
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
    for (var key in this.allReportingDataList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  addEntity(contact) {
    let editDataModal = {
      typeName: null,
      typeId: null,
      entityName: null,
      entityId: null,
      contactName: (contact.name) ? contact.name : null,
      contactId: null,
      contactNo: contact.mobile,
      email: (contact.email) ? contact.email : null,
      association: null,
      requestId: null
    }
    this.common.params = {
      entityTypes: null,
      entityContactFieldsTitle: "Add contact on entity",
      modalType: 4,
      editData: editDataModal
    }
    const activeModal = this.modalService.open(AddentityfieldsComponent, { size: 'md', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      // console.log("addEntity ~ data", data)
    });
  }

  getTableColumns() {
    let columns = [];
    this.allReportingDataList.map(reporting => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(reporting)
          };
        }
        // else if (key == 'mobile' && this.fromPage == 1) {
        //   column[key] = { value: reporting[key] ? reporting[key] : null, class: 'blue cursor-pointer', action: this.addEntity.bind(this, reporting), }
        // }
        else {
          column[key] = { value: reporting[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(reporting) {
    let icons = [
      { class: 'fas fa-trash-alt', action: this.deleteMappedUser.bind(this, reporting) },
      // { class: 'fa fa-phone', action: this.callSync.bind(this, reporting) }
    ];
    return icons;
  }

  callSync(lead) {
    let params = {
      mobileno: lead.mobile
    }
    this.common.loading++;
    this.api.post('Notification/sendCallSuggestionNotifications', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        // this.getTransactionContact();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  deleteMappedUser(row) {
    console.log('delete', row);
    let params = {
      requestId: row._id,
      reportingId: row._reporting_user_id,
      reporterId: row._reporter_user_id
    }
    if (row._id) {
      this.common.params = {
        title: 'Delete Record',
        description: '<b>Are Sure To Delete This Record<b>',
      }
      // console.log("deleteContact:",params);return false;
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.addReporting(params);
        }
      });
    }
  }

  addReporting(param = null) {
    console.log('reporting Form', this.reportingForm);
    let params = {};
    if (param) {
      params = param;
    } else {

      if (!this.reportingForm.user.id) {
        this.common.showError(`Please Select ${(this.reportingForm.type.id == 1) ? 'Reporting Manager' : 'Suboridinate'} First`);
        return;
      }

      params = {
        reportingId: (this.reportingForm.type.id == 1) ? this.reportingForm.user.id : this.reportingForm.selectedUserId,
        reporterId: (this.reportingForm.type.id == 1) ? this.reportingForm.selectedUserId : this.reportingForm.user.id
      }
    }
    // return console.log('params',params);
    let apiName = "Admin/saveFunctionalRm";
    this.common.loading++;
    this.api.post(apiName, params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.getAllReporters(this.reportingForm.funtionalUsertype);
            this.resetForm();
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  resetForm() {
    this.reportingForm.user = { id: null, name: null };
    this.reportingForm.type = { id: 1, name: 'Reporting Manager' };
  }

}
