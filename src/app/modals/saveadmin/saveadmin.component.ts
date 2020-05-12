import { Component, OnInit, Renderer } from '@angular/core';
import { UserService } from '../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'saveadmin',
  templateUrl: './saveadmin.component.html',
  styleUrls: ['./saveadmin.component.scss']
})
export class SaveadminComponent implements OnInit {

  isUpdate = false;
  submitted = false;
  preSelectedDept = {
    id: null,
    name: ''
  };
  Fouser = {
    id: null,
    name: null,
    mobileNo: null,
    isActive: '',
    department: {
      id: null,
      name: ''
    },
    reportingManager: {
      id: null,
      name: '',
      mobileno: ''
    },
    doj: null
  };

  departments = [];
  name = null;
  mobile = null;
  data = [];
  preSelected = {
    name: '',
    mobileno: ''
  };
  preSelectedManager = {
    name: '',
    mobileno: ''
  };
  activeAdminDetails = {};

  constructor(
    public api: ApiService,
    public common: CommonService,
    public user: UserService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public renderer: Renderer,
    private sanitizer: DomSanitizer
  ) {
    this.Fouser.doj = this.common.getDate(); // for new
    this.getDepartments();
    if (this.common.params && this.common.params.title == 'Edit Admin') {
      console.log(this.common.params.activeAdminDetail);
      this.activeAdminDetails = this.common.params.activeAdminDetail;
      this.Fouser.id = this.activeAdminDetails['id'];
      this.Fouser.name = this.activeAdminDetails['name'];
      this.Fouser.isActive = 'true';
      this.Fouser.mobileNo = this.activeAdminDetails['mobileno'];
      this.Fouser.department.id = this.activeAdminDetails['_dept_id'];
      this.Fouser.department.name = this.activeAdminDetails['department_name'];
      this.Fouser.reportingManager.id = this.activeAdminDetails['_reporting_user_id'];
      this.Fouser.reportingManager.name = this.activeAdminDetails['reporting_manager'];
      this.preSelected.name = this.activeAdminDetails['reporting_manager'];
      this.preSelected.mobileno = this.activeAdminDetails['reporting_manager'];
      this.Fouser.doj = (this.activeAdminDetails['doj']) ? this.common.dateFormatter(this.activeAdminDetails['doj']) : null;
    }
    this.common.params = {};
  }

  ngOnInit() {
  }


  closeModal(response) {
    this.activeModal.close(false);
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList", "I")
      .subscribe(res => {
        this.common.loading--;
        this.departments = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  selectedDepartment(selectedDepartment) {
    console.log(selectedDepartment);
    this.Fouser.department.id = selectedDepartment.id;
    this.Fouser.department.name = selectedDepartment.name;
  }

  selectReportingManager(selectedReportingManager) {
    console.log(selectedReportingManager);
    this.Fouser.reportingManager.id = selectedReportingManager.id;
    this.Fouser.reportingManager.name = selectedReportingManager.name;
    this.preSelected.name = selectedReportingManager.report_user_name;
    this.preSelectedManager.name = selectedReportingManager.report_user_name;
    this.preSelected.mobileno = selectedReportingManager.report_user_mobile;
    this.preSelectedManager.mobileno = selectedReportingManager.report_user_mobile;
  }

  addFoAdmin() {
    let params = {
      name: this.Fouser.name,
      mobileno: this.Fouser.mobileNo,
      // foid: this.Fouser.Foid,

    };
    this.common.loading++;
    let response;
    this.api.post('FoAdmin/addUsers', params)
      .subscribe(res => {
        this.common.loading--;

        console.log('Res:', res['data']);
        this.activeModal.close();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  selectFoUser(value) {
    console.log(value);
    this.Fouser.id = value.id;
    this.Fouser.name = value.name;
    this.Fouser.mobileNo = value.mobileno;
    this.Fouser.reportingManager.id = value.reporting_user_id;
    this.Fouser.reportingManager.name = value.report_user_name;
    this.Fouser.reportingManager.mobileno = value.report_user_mobile;
    this.preSelected.name = value.report_user_name;
    this.preSelected.mobileno = value.report_user_mobile;
    this.preSelectedManager.name = value.report_user_name;
    this.preSelectedManager.mobileno = value.report_user_mobile;
    console.log(this.preSelectedManager);
    if (value.dept_id > 0) {
      this.Fouser.department.id = value.dept_id;
      this.Fouser.department.name = this.departments.find(e => e.id == value.dept_id).name;
    }
    this.Fouser.isActive = value.is_active.toString();
    this.Fouser.doj = (value.doj) ? this.common.dateFormatter(value.doj) : null;

  }

  saveAdmin() {
    let params = {
      name: this.Fouser.name,
      mobile: this.Fouser.mobileNo,
      departmentId: this.Fouser.department.id,
      reportingManagerId: this.Fouser.reportingManager.id,
      doj: (this.Fouser.doj) ? this.common.dateFormatter(this.Fouser.doj) : null
    }
    console.log(params);
    if (this.Fouser.name == null) {
      this.common.showError('Enter Name');
    } else if (this.Fouser.mobileNo == null) {
      this.common.showError('Enter Mobile Number');
    } else if (!this.Fouser.doj) {
      return this.common.showError("Date of joining is missing");
    } else if (this.Fouser.doj > this.common.getDate()) {
      return this.common.showError("Date of joining must not be future date");
    } else {
      this.common.loading++;
      this.api.post('Admin/save', params)
        .subscribe(res => {
          this.common.loading--;
          console.log(res)
          this.data = res['data']
          if (this.data['y_id'] <= 0) {
            this.common.showError(this.data[0]['y_msg']);
          } else {
            this.common.showToast(this.data[0]['y_msg']);
            this.closeModal(true);
          }
          console.log("pa", this.data)
        }, err => {
          this.common.loading--;
          console.error(err);
          this.common.showError();
        });
    }

  }

  updateAdmin() {
    let param = {
      id: this.Fouser.id,
      name: this.Fouser.name,
      mobile: this.Fouser.mobileNo,
      departmentId: this.Fouser.department.id,
      reportingManagerId: this.Fouser.reportingManager.id,
      isActive: Boolean(JSON.parse(this.Fouser.isActive)),
      doj: (this.Fouser.doj) ? this.common.dateFormatter(this.Fouser.doj) : null
    }
    console.log(param);
    if (this.Fouser.name == null) {
      this.common.showError('Enter Name');
    } else if (this.Fouser.mobileNo == null) {
      this.common.showError('Enter Mobile Number');
    } else if (this.Fouser.department.id == null) {
      this.common.showError('Select Department');
    } else if (!this.Fouser.doj) {
      return this.common.showError("Date of joining is missing");
    } else if (this.Fouser.doj > this.common.getDate()) {
      return this.common.showError("Date of joining must not be future date");
    } else {
      this.common.loading++;
      this.api.post('Admin/save', param)
        .subscribe(res => {
          this.common.loading--;
          console.log(res)
          this.data = res['data']
          if (this.data['y_id'] <= 0) {
            this.common.showError(this.data[0]['y_msg']);
          } else {
            this.common.showToast(this.data[0]['y_msg']);
            this.onCancel();
            // this.closeModal();
          }

          console.log("pa", this.data)
        }, err => {
          this.common.loading--;
          console.error(err);
          this.common.showError();
        });
    }
  }

  onCancel() {
    this.Fouser.id = null;
    this.Fouser.name = null;
    this.Fouser.mobileNo = null;
    this.preSelected = {
      name: '',
      mobileno: ''
    };
  }

}
