import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-addpartneruser',
  templateUrl: './addpartneruser.component.html',
  styleUrls: ['./addpartneruser.component.scss']
})
export class AddpartneruserComponent implements OnInit {

  partnerUserMapping=[];
  loginData=[];

  partnerUser={
    id:null,
    name:null,
    userName:null,
    password:null,
    mobileNo:null,
    loginType: '',
    authType:'1'
  }
  constructor(public common:CommonService,
  public api:ApiService,
  public activeModal:NgbActiveModal,
  public modalSService:NgbModal) { 
    this.getPartnerMappingData();
    this.displayLoginType();
  }

  ngOnInit() {
  }

  displayLoginType() {
    if (this.partnerUser.authType == '1') {
      this.loginData = [
        { id: 1, name: 'Otp' },
        { id: 2, name: 'QR Code' }
      ]
    }
  }

  getPartnerMappingData(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getElogistPartner.json')
      .subscribe(res => {
        this.common.loading--;
        if(res['code'] ===0){this.common.showError(res['msg']);return false;}
        if (!res['data']) return;
        this.partnerUserMapping = res['data'];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getParentPartnerUser(event){
    this.partnerUser.id=event.id;
  }

  closeModal() {
    this.activeModal.close();
  }

  addPartnerUser(){
    console.log("partnerId:",this.partnerUser.id);
    console.log("Name:",this.partnerUser.name);
    console.log("Username:",this.partnerUser.userName);
    console.log("password:",this.partnerUser.password);
    console.log("Mobile:",this.partnerUser.mobileNo);

    const params = {
      partnerId: this.partnerUser.id,
      name: this.partnerUser.name,
      mobileno: this.partnerUser.mobileNo,
      authType: this.partnerUser.authType,
      loginType: this.partnerUser.loginType,
      userName:this.partnerUser.userName,
      password:this.partnerUser.password,
      isAdmin: true,
      address:null
    }
    console.log("Params", params);
    this.common.loading++;
    this.api.postTranstruck("Partners/addPartnerOrPartAdmin.json", params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']>0){
          this.common.showToast(res['data'][0].y_msg);
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

}
