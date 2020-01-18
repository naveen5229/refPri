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
  Fouser = {
    id: null,
    name: null,
    mobileNo: null,
  };


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
  ) { }

  ngOnInit() {
  }


  closeModal() {
    this.activeModal.close();
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
    this.Fouser.id = value.id;
    this.Fouser.name = value.name;
    this.Fouser.mobileNo = value.mobileno;
    // return this.Fouser.Foid;
    console.log("", value);
    console.log(this.Fouser);
  }

  saveAdmin() {
    let params = {
      name: this.Fouser.name,
      mobile: this.Fouser.mobileNo
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
      mobile: this.Fouser.mobileNo
    }
    console.log(param);
    if (this.Fouser.name == null) {
      this.common.showError('Enter Name');
    }
    else if (this.Fouser.mobileNo == null) {
      this.common.showError('Enter Mobile Number');
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
