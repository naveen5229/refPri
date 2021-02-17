import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-addcompany',
  templateUrl: './addcompany.component.html',
  styleUrls: ['./addcompany.component.scss']
})
export class AddcompanyComponent implements OnInit {

  productType = '1';
  loginType = '1';
  authType = '1';
  loginData = [];
  statesData = null;
  statename = null;
  stateId = null;
  statedatabind = null;
  partnerId=null;
  partnerData=[];

  newCustomer = {
    mobileno: '',
    pan: '',
    name: '',
    username: '',
    address: '',
    password: '',
    panId: '',
    panIdImage: '',
    uidFront: '',
    uidFrontImage: '',
    uidBack: '',
    uidBackImage: '',
    language_id: '2',
    pincode: '',
  }
  languages = null;
  showPassword = false;
  constructor(public common:CommonService,
    public api:ApiService,
    public activeModal:NgbActiveModal,
    public modalSService:NgbModal,
    public user: UserService) {
      this.getPartnerData();
      this.displayLoginType();
      this.fetchLanguages();
      this.GetState();
     }

  ngOnInit() {
  }

  closeModal(res) {
    this.activeModal.close();
  }

  getPartnerData(){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getElogistPartner.json')
      .subscribe(res => {
        this.common.loading--;
        if(res['code'] ===0){this.common.showError(res['msg']);return false;}
        if (!res['data']) return;
        this.partnerData = res['data'];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getElogistCompany(event){
    console.log("Elogist Partner:",event);
    this.partnerId=event.id;
  }

  displayLoginType() {
    if (this.authType == '1') {
      this.loginData = [
        { id: 1, name: 'Otp' },
        { id: 2, name: 'QR Code' }
      ]
    }
  }

  GetState() {
    this.common.loading++;
    this.api.postBooster('Suggestion/GetState','')
      .subscribe(res => {
        this.common.loading--;
        console.log('Res:', res['data']);
        this.statesData = res['data'];
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
        this.common.showError();
      });

  }

  fetchLanguages() {
    const subURL = 'Language/fetchSmsLaguageTypes.json';
    const params = '';
    this.common.loading++;
    this.api.getTranstruck(subURL + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['responsecode'] == 1 && res['data'].length) {
          this.languages = res['data'];
        } else {
          this.common.showToast(res['responsemessage']);
        }
      }, err => {
        console.log(err);
        this.common.loading--;
        this.common.showError();
      })
  }

  handleFileSelection(event, type?) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then((res: any) => {
        this.common.loading--;
        let file = event.target.files[0];
        console.log("Type", file.type);
        if (file.type == "image/jpeg" || file.type == "image/jpg" ||
          file.type == "image/png") {
          this.common.showToast("SuccessFull File Selected");
        }
        else {
          this.common.showError("valid Format Are : jpeg,png,jpg");
          return false;
        }
        this.newCustomer[type] = res.split('base64,')[1];
        console.log("this.newFastag[type]", this.newCustomer[type]);
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }

  stateData(event) {
    this.statename = this.statedatabind.name;
    this.stateId = this.statedatabind.id;
  }

  addFO() {

    if (this.authType == '2') {
      this.loginType = '';
    }
    if (this.productType == '1') {
      if (this.statename == '' || this.statename == null) {
        this.common.showError('please select state');
        return;
      } else if (this.newCustomer.name == '' || this.newCustomer.name == null) {
        this.common.showError('please fill customer name.');
        return;
      } else if (this.newCustomer.mobileno == '' || this.newCustomer.mobileno == null) {
        this.common.showError('please fill mobile number.');
        return;
      } else if (this.newCustomer.pan == '' || this.newCustomer.pan == null) {
        this.common.showError('please fill PAN ');
        return;
      } else if (this.newCustomer.address == '' || this.newCustomer.address == null) {
        this.common.showError('please fill address');
        return;
      } else if (this.newCustomer.panId == '' || this.newCustomer.panId == null) {
        this.common.showError('please select pan image');
        return;
      } else if (this.newCustomer.uidFront == '' || this.newCustomer.uidFront == null) {
        this.common.showError('please select address proof (front)');
        return;
      } else if (this.newCustomer.uidBack == '' || this.newCustomer.uidBack == null) {
        this.common.showError('please select address proof (back)');
        return;
      }

    } else if (this.productType == '2') {
      if (this.statename == '' || this.statename == null) {
        this.common.showError('please select state');
        return;
      } else if (this.newCustomer.name == '' || this.newCustomer.name == null) {
        this.common.showError('please fill company name');
        return;
      } else if (this.newCustomer.address == '' || this.newCustomer.address == null) {
        this.common.showError('please fill address');
      } else if (this.authType == '1') {
        if (this.newCustomer.mobileno == '' || this.newCustomer.mobileno == null) {
          this.common.showError('please fill mobile number');
          return;
        }
      } else if (this.authType == '2') {
        if (this.newCustomer.username == '' || this.newCustomer.username == null) {
          this.common.showError('please fill username');
          return;
        } else if (this.newCustomer.password == '' || this.newCustomer.password == null) {
          this.common.showError('please fill password');
          return;
        }
      }
    }
    const params = {
      mobileno: this.newCustomer.mobileno,
      idproof: this.newCustomer.panId,
      addressproof_front: this.newCustomer.uidFront,
      addressproof_back: this.newCustomer.uidBack,
      pan: this.newCustomer.pan,
      name: this.newCustomer.name,
      lat: 0,
      long: 0,
      state: this.statename,
      stateId: this.stateId,
      password: this.newCustomer.password,
      pincode: 1,
      partner_id: this.partnerId,
      language_id: this.newCustomer.language_id,
      aduserid: this.user._details.id,
      userName: this.newCustomer.username,
      address: this.newCustomer.address,
      authType: this.authType,
      loginType: this.loginType
    };
    console.log(params);
    const subURL = 'AddFouser/setNewFoDetails.json?';
    this.common.loading++;
    this.api.postTranstruck(subURL, params)
      .subscribe(res => {
        if (res['success']) {
          this.common.showToast(res['msg']);
          this.common.loading--;
          // this.getFoDetails();
        } else {
          this.common.loading--;
          this.common.showError(res['msg'])
        }
      }, err => {
        console.log(err);
        this.common.loading--;
        this.common.showError();
      });
  }

}
