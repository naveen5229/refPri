import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-addpartner',
  templateUrl: './addpartner.component.html',
  styleUrls: ['./addpartner.component.scss']
})
export class AddpartnerComponent implements OnInit {
  loginData=[];
  show=false;
  partnerMapping=[];
  partner={
    id:null,
    name:null,
    userName:null,
    password:null,
    mobileNo:null,
    address:null,
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
    if (this.partner.authType == '1') {
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
        console.log("api data", res);
        if (!res['data']) return;
        this.partnerMapping = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  closeModal() {
    this.activeModal.close();
  }

  showHide(){
    if(this.show===false){
      this.show=true;
    }else if(this.show===true){
      this.show=false;
    }
  }

  getParentPartner(event){
    this.partner.id=event.id;
  }

  addPartner(){
    console.log("partnerId:",this.partner.id);
    console.log("Name:",this.partner.name);
    console.log("Username:",this.partner.userName);
    console.log("password:",this.partner.password);
    console.log("Mobile:",this.partner.mobileNo);
    console.log("Address:",this.partner.address);

    const params = {
      partnerId: this.partner.id,
      name: this.partner.name,
      mobileno: this.partner.mobileNo,
      authType: this.partner.authType,
      loginType: this.partner.loginType,
      userName:this.partner.userName,
      password:this.partner.password,
      isAdmin:false,
      address:this.partner.address
    }
    console.log("Params", params);
    this.common.loading++;
    this.api.postTranstruck("Partners/addPartnerOrPartAdmin.json", params)
      .subscribe(res => {
        this.common.loading--;
        this.common.showToast(res['data'][0].y_msg);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

}
