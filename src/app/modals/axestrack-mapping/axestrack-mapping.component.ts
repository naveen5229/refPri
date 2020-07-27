import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-axestrack-mapping',
  templateUrl: './axestrack-mapping.component.html',
  styleUrls: ['./axestrack-mapping.component.scss']
})
export class AxestrackMappingComponent implements OnInit {
  axestrackPartnerData=[];
  axestrackPartnerUserData=[];
  axestrackCompanyData=[];
  axestrackCompanyUserData=[];
  vehicleData=[];
  elparid='';
  axesparid='';
  title='';
  userName='';
  userMobile='';
  

  constructor(public common: CommonService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public api: ApiService,
    public userService: UserService) {
      console.log("Params:",this.common.params);
      if(this.common.params.partner){
      this.elparid=this.common.params.partner.id;
      this.title=this.common.params.title;
      this.userName=this.common.params.partner.name;
      this.userMobile=this.common.params.partner.mobileno;
      this.getAxesPartner();
      }
      else if(this.common.params.partnerUser){
      this.elparid=this.common.params.partnerUser.id;
      this.title=this.common.params.title;
      this.userName=this.common.params.partnerUser.name;
      this.userMobile=this.common.params.partnerUser.mobileno;
      this.getAxesUserPartner();
      }

      else if(this.common.params.company){
      this.elparid=this.common.params.company.id;
      this.title=this.common.params.title;
      this.userName=this.common.params.company.name;
      this.userMobile=this.common.params.company.mobileno;
      this.getAxesCompany();
      }
      
      else if(this.common.params.companyUser){
      this.elparid=this.common.params.companyUser.id;
      this.title=this.common.params.title;
      this.userName=this.common.params.companyUser.name;
      this.userMobile=this.common.params.companyUser.mobileno;
      this.getAxesCompanyUser();
      }

      else if(this.common.params.vehicle){
        this.elparid=this.common.params.vehicle.id;
        this.title=this.common.params.title;
        this.userName=this.common.params.vehicle.regno;
        this.getAxesCompanyVehicle();
      }

      
     }

  ngOnInit() {
  }

  closeModal(res){
    this.activeModal.close({ response:res});
  }

  getAxesPartner(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getAxestrackPartner.json')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.axestrackPartnerData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }



  getAxestrackPartner(event){
    console.log("Event:",event);
    this.axesparid=event.provider_id;
  }



  savePartnerMapping(){
    this.common.loading++;
    let param={
      elPartnerId:this.elparid,
      axPartnerId:this.axesparid
    }
    console.log("PaRAM:",param);
    this.api.postTranstruck('AxesUserMapping/savePartnerMapping.json',param)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (res['success']){
          this.common.showToast(res['msg']);
          this.activeModal.close({response:true});
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  getAxesUserPartner(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getAxestrackPartAdminuser.json?axProviderId='+this.common.params.partnerUser._ax_provider_id)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.axestrackPartnerUserData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }



  getAxestrackUserPartner(event){
    console.log("Event:",event);
    this.axesparid=event.autoid;
  }

  savePartnerUserMapping(){
    this.common.loading++;
    let param={
      elPartAdminId:this.elparid,
      axPartAdminId:this.axesparid
    }
    console.log("PaRAM:",param);
    this.api.postTranstruck('AxesUserMapping/savePartadminuserMapping.json',param)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (res['success']){
          this.common.showToast(res['msg']);
          this.activeModal.close({response:true});
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  getAxesCompany(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getAxestrackCompany.json?axProviderId='+this.common.params.company._ax_provider_id)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.axestrackCompanyData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }



  getAxestrackCompany(event){
    console.log("Event:",event);
    this.axesparid=event.company_id;
  }

  saveCompanyMapping(){
    this.common.loading++;
    let param={
      elCompanyId:this.elparid,
      axCompanyId:this.axesparid
    }
    console.log("PaRAM:",param);
    this.api.postTranstruck('AxesUserMapping/saveCompanyMapping.json',param)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (res['success']){
          this.common.showToast(res['msg']);
          this.activeModal.close({response:true});
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  getAxesCompanyUser(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getAxestrackCompanyuser.json?axCompanyId='+this.common.params.companyUser._ax_company_id)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.axestrackCompanyUserData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }



  getAxestrackCompanyUser(event){
    console.log("Event:",event);
    this.axesparid=event.autoid;
  }

  saveCompanyUserMapping(){
    this.common.loading++;
    let param={
      elCompanyUserId:this.elparid,
      axCompanyUserId:this.axesparid
    }
    console.log("PaRAM:",param);
    this.api.postTranstruck('AxesUserMapping/saveCompanyUserMapping.json',param)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (res['success']){
          this.common.showToast(res['msg']);
          this.activeModal.close({response:true});
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  getAxesCompanyVehicle(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getAxestrackCompanyVehicle.json?axCompanyId='+this.common.params.vehicle._ax_company_id)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.vehicleData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
    // getAxestrackCompanyVehicle
  }

  getAxestrackCompanyVehicle(event){
    console.log("Event:",event);
    this.axesparid=event.autoid;
  }

  saveAxestrackCompanyVehicle(){
    this.common.loading++;
    let param={
      elVehicleId:this.elparid,
      axVehicleId:this.axesparid
    }
    console.log("PaRAM:",param);
    this.api.postTranstruck('AxesUserMapping/saveVehicleMapping.json',param)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (res['success']){
          this.common.showToast(res['msg']);
          this.activeModal.close({response:true});
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


}
