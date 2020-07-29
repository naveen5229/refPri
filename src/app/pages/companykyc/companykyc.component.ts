import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-companykyc',
  templateUrl: './companykyc.component.html',
  styleUrls: ['./companykyc.component.scss']
})
export class CompanykycComponent implements OnInit {

  partnerid=null;
  partnerData=[];
  
  data = [];
  data1=[];
  status=null;
  columns = [];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader:true
    }
  };

  value = null;
  constructor(public common:CommonService,
    public api:ApiService) {
      this.getPartnerData();
     }

  ngOnInit() {
  }

  getPartnerData(){
    this.common.loading++;
    this.api.get("Partners/getPartnerListWrtAxestrack.json",'I').subscribe(
      res => {
        this.common.loading--;
        console.log("datA", res);
        this.partnerData = res['data'];
      },err => {
        this.common.loading--;
        console.log(err);
      }
    );
  }

  getPartner(event){
    this.partnerid=event.id;
    this.status=0;
    this.getAllFoUserPendingKyc();
  }

  // selectPartner(event){
  //   this.partnerid=event.id;
    
  // }

  filterData(){
    this.data = this.data1.filter(filterData => filterData._status == this.status);
    this.setTable();
  }

  getAllFoUserPendingKyc() {
    this.common.loading++;
    this.api.get("CompanyKyc/getCompanyKycDetails.json?partnerId="+this.partnerid,'I').subscribe(
      res => {
        this.common.loading--;
        this.data = res['data'];
        this.data1 = this.data;
        this.data.length ? this.filterData() : '';
        this.data.length ? this.setTable() : this.resetTable();
        console.log("datA", res);
      },err => {
        this.common.loading--;
        console.log(err);
      }
    );
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
    for (var key in this.data[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }


  getTableColumns() {
    let columns = [];
    this.data.map(userKyc => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
           icons: this.actionIcons(userKyc)
          };
        }else if(key == 'rcproof'){
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
           icons: this.actionIcons1(userKyc)
          };
        }else if(key == 'addressproof'){
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
           icons: this.actionIcons2(userKyc)
          };
        }
         else {
          column[key] = { value: userKyc[key],class: 'black', action: '' };
        }
      }
      columns.push(column);
    });

    return columns;
  }

  

  

  
  
  actionIcons(request){
      if(request['_status']===0 &&(request['rcproof']!=null && request['addressproof']!=null)){
        let icons=[];
        console.log("requestStatus:",request['_status']);
      icons = [
        {
          txt:'Accept',
          class: " txtstyle",
          action: this.updateKycStatusAccept.bind(this, request),
        },
        {
          txt:'Reject',
          class: " txtstyle1",
          action: this.updateKycStatusReject.bind(this, request),
        }
      ];
      return icons;
  }
    
  
  }

  actionIcons1(req){
    if(req.rcproof!=null){
    let icons=[];
    icons=[
        {
          txt:'show',
          class: " show",
          action: this.showRc.bind(this, req),
        }
    ];
    return icons;
  }
  }

  actionIcons2(req){
    if(req.addressproof !=null){
    let icons=[];
    icons=[
        {
          txt:'show',
          class: "show",
          action: this.showAddressProof.bind(this, req)
        }
    ];
    return icons;
  }
  }

  updateKycStatusAccept(req){
    let params;
    params={
      id:req._rowid,
      status:1
    }
    this.common.loading++;
    this.api.post("CompanyKyc/updateKycStatus.json",params,'I').subscribe(
    res => {
      this.common.loading--;
      console.log("Update Kyc Status :", res);
      if(res['success']){
        this.common.showToast(res['msg']);
        this.getAllFoUserPendingKyc();
      }else{
        this.common.showError(res['msg']);
      }
    },err => {
      this.common.loading--;
      
      console.log(err);
    }
  );


    
  }

  updateKycStatusReject(req){
    let params;
    params={
      id:req._rowid,
      status:-1
    }
    this.common.loading++;
    this.api.post("CompanyKyc/updateKycStatus.json",params,'I').subscribe(
    res => {
      this.common.loading--;
      console.log("Update Kyc Status :", res);
      if(res['success']){
        this.common.showToast(res['msg']);
        this.getAllFoUserPendingKyc();
      }else{
        this.common.showError(res['msg']);
      }
    },err => {
      this.common.loading--;
      console.log(err);
    }
  );
  }

  showRc(req){
    window.open(req.rcproof);
  }

  showAddressProof(req){
    window.open(req.addressproof);
  }

}
