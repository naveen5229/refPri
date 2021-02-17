import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-addfouser',
  templateUrl: './addfouser.component.html',
  styleUrls: ['./addfouser.component.scss']
})
export class AddfouserComponent implements OnInit {

  btn='Add';
  data = [];
  loginType = '1';
  authType = '1';
  // foAdminUser: FormGroup;
  submitted = false;
  isActive = false;
  Fouser = {
    foAdminName: null,
    name: null,
    mobileNo: null,
    userName:null,
    password:null,
    Foid: null,
    foaid:null
  };
  foadminusrId = null;
  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal,
    public user: UserService) {
      this.displayLoginType();
     }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.close();

  }

  displayLoginType() {
    if (this.authType == '1') {
      this.data = [
        { id: 1, name: 'Otp' },
        { id: 2, name: 'QR Code' }
      ]
    }
  }

  addFoAdmin() {
    console.log("IsActive:",this.isActive);
    let params = {};
    params = {
      name: this.Fouser.name,
      mobileno: this.Fouser.mobileNo,
      foid: this.Fouser.Foid,
      authType: this.authType,
      loginType: this.loginType,
      rowId: this.Fouser.foaid,
      userName:this.Fouser.userName,
      password:this.Fouser.password,
      isActive:this.isActive
    };
    this.common.loading++;
    // let response;
    this.api.postTranstruck('AddFouser/addCompanyUsers.json?', params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']>0){
          this.common.showToast(res['msg']);
          this.activeModal.close();
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  selectFoUserList(value) {
    this.Fouser.Foid = value.id;
  }

}
