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
    }

  };



  departments = [];
  name = null;
  mobile = null;
  data = [];
  preSelected = {
    name: '',
    mobileno: ''
  };

  constructor(
    public api: ApiService,
    public common: CommonService,
    public user: UserService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public renderer: Renderer,
    private sanitizer: DomSanitizer
  ) {
    this.getDepartments();
  }

  ngOnInit() {
  }


  closeModal() {
    this.activeModal.close();
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
    if (value.dept_id > 0) {
      this.Fouser.department.id = value.dept_id;
      this.Fouser.department.name = this.departments.find(e => e.id == value.dept_id).name;
    }
    this.Fouser.isActive = value.isActive.toString();

  }

  saveAdmin() {
    let params = {
      name: this.Fouser.name,
      mobile: this.Fouser.mobileNo,
      department: this.Fouser.department.id
    }
    console.log(params);
    if (this.Fouser.name == null) {
      this.common.showError('Enter Name');
    }
    else if (this.Fouser.mobileNo == null) {
      this.common.showError('Enter Mobile Number');
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
            this.closeModal();
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
      isActive: Boolean(JSON.parse(this.Fouser.isActive))

    }
    console.log(param);
    if (this.Fouser.name == null) {
      this.common.showError('Enter Name');
    }
    else if (this.Fouser.mobileNo == null) {
      this.common.showError('Enter Mobile Number');
    } else if (this.Fouser.department.id == null) {
      this.common.showError('Select Department');
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
