import { Component, OnInit, Directive } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AxestrackMappingComponent } from '../../modals/axestrack-mapping/axestrack-mapping.component';
import { AddvehicleComponent } from '../../modals/addvehicle/addvehicle.component';
import { AddpartnerComponent } from '../../modals/addpartner/addpartner.component';
import { AddpartneruserComponent } from '../../modals/addpartneruser/addpartneruser.component';
import { AddcompanyComponent } from '../../modals/addcompany/addcompany.component';
import { AddfouserComponent } from '../../modals/addfouser/addfouser.component';
import { MobileNoComponent } from '../../modals/mobile-no/mobile-no.component';

@Component({
  selector: 'ngx-user-mapping',
  templateUrl: './user-mapping.component.html',
  styleUrls: ['./user-mapping.component.scss']
})
export class UserMappingComponent implements OnInit {

  activeTab='partnerMapping';
  vehicleMapping=[];
  companyData=[];
  partnerMapping=[];
  partnerUserMappings=[];
  companyMappings=[];
  companyUserMappings=[];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  table1 = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  table2 = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  table3 = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  table4 = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };


  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal) { 
      this.getPartnerMappingData();
      this.getCompanyMappingData(null);
    }

  ngOnInit() {
  }

  addFODetail(){
    const activeModal = this.modalService.open(AddcompanyComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  addFoAdminUser() {
     const activeModal = this.modalService.open(AddfouserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  

  // Partner Mapping Start
  getPartnerMappingData(){
   
    this.partnerMapping=[];
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getElogistPartner.json')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.partnerMapping = res['data'];
        this.partnerMapping.length ? this.setTable() : this.resetTable();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  resetTable() {
    this.table = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
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
    for (var key in this.partnerMapping[0]) {
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
    this.partnerMapping.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(campaign)
          };
        }else if(key =='mobileno'){
            column[key]={value:campaign['mobileno']?'show':'',class:'blue',action:this.showMobileNo.bind(this,campaign['mobileno']) }
        }else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  actionIcons(partner) {
    let icons=[];
    if(partner['ax_provider_id']=='' || partner['ax_provider_id'] == null){
     icons = [
       { class: "fa fa-plus green", action: this.partnerMap.bind(this, partner) },
    ];
    return icons;
  }
}

  partnerMap(partner){
    console.log(partner);
    this.common.params = { 'partner':partner,'title':'Partner Mapping' };
    const activeModal = this.modalService.open(AxestrackMappingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getPartnerMappingData();
      }
    });
  }

  // Partner Mapping End


  // Partner User Mapping Start------------------------------------------------------------------------------
  getElogistPartner(event){
    console.log("Elogist Partner:",event);
    this.partnerUserMapping(event.id)
  }

  partnerUserMapping(id){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getElogistPartadminuser.json?elPartnerId='+id)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.partnerUserMappings = res['data'];
        this.partnerUserMappings.length ? this.setTable1() : this.resetTable1();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  resetTable1(){
    this.table1 = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };
  }


  setTable1() {
    this.table1.data = {
      headings: this.generateHeadings1(),
      columns: this.getTableColumns1()
    };
    return true;
  }

  generateHeadings1() {
    let headings = {};
    for (var key in this.partnerUserMappings[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle1(key) };
      }
    }
    return headings;
  }

  formatTitle1(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  getTableColumns1() {
    let columns = [];
    this.partnerUserMappings.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings1()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons1(campaign)
          };
        }else if(key =='mobileno'){
          column[key]={value:campaign['mobileno']?'show':'',class:'blue',action:this.showMobileNo.bind(this,campaign['mobileno']) }
        }else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  actionIcons1(partner) {
    let icons=[];
    if(partner['ax_user_id']=='' || partner['ax_user_id'] == null){
     icons = [
       { class: "fa fa-plus green", action: this.partnerUserMap.bind(this, partner) },
    ];
    
  } else if(partner['ax_user_id']!='' || partner['ax_user_id']!=null){
    icons = [
      { class: "fa fa-minus-circle red", action: this.partnerUserUnMap.bind(this, partner) },
   ];
  }
  return icons;
}

partnerUserMap(partnerUser){
  console.log(partnerUser);
  
    
    if(partnerUser._ax_provider_id!=null){
    this.common.params = { 'partnerUser':partnerUser,'title':'Partner User Mapping' };
    const activeModal = this.modalService.open(AxestrackMappingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        // this.getPartnerMappingData();
      }
    });
  }else{
    this.common.showError("First Map Partner!");
  }
  
}

partnerUserUnMap(partnerUser){
  console.log(partnerUser);
  this.common.loading++;
    let param={
      elPartAdminId:partnerUser.id
    }
    this.api.postTranstruck('AxesUserMapping/unmapPartadminuserMapping.json',param)
      .subscribe(res => {
        this.common.loading--;
        if (res['success']){
          this.common.showToast(res['msg']);
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
}

// Partner User Mapping End----------------------------------------------------------------------------


//Company Mapping Start-----------------------------------------------------------------------

getElogistCompany(event){
  console.log("Elogist Partner:",event);
  this.companyMapping(event.id)
}

  companyMapping(id){
  this.common.loading++;
  this.api.getTranstruck('AxesUserMapping/getElogistCompany.json?elPartnerId='+id)
    .subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (!res['data']) return;
      this.companyMappings = res['data'];
      this.companyMappings.length ? this.setTable2() : this.resetTable2();
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
}

resetTable2(){
  this.table2 = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
}


setTable2() {
  this.table2.data = {
    headings: this.generateHeadings2(),
    columns: this.getTableColumns2()
  };
  return true;
}

generateHeadings2() {
  let headings = {};
  for (var key in this.companyMappings[0]) {
    if (key.charAt(0) != "_") {
      headings[key] = { title: key, placeholder: this.formatTitle2(key) };
    }
  }
  return headings;
}

formatTitle2(strval) {
  let pos = strval.indexOf('_');
  if (pos > 0) {
    return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
  } else {
    return strval.charAt(0).toUpperCase() + strval.substr(1);
  }
}

getTableColumns2() {
  let columns = [];
  this.companyMappings.map(campaign => {
    let column = {};
    for (let key in this.generateHeadings2()) {
      if (key == 'Action') {
        column[key] = {
          value: "",
          isHTML: false,
          action: null,
          icons: this.actionIcons2(campaign)
        };
      }else if(key =='mobileno'){
        column[key]={value:campaign['mobileno']?'show':'',class:'blue',action:this.showMobileNo.bind(this,campaign['mobileno']) }
      }else {
        column[key] = { value: campaign[key], class: 'black', action: '' };
      }
    }
    columns.push(column);
  })
  return columns;
}

actionIcons2(company) {
  let icons=[];
  if(company['ax_company_id']=='' || company['ax_company_id'] == null){
   icons = [
     { class: "fa fa-plus green", action: this.companyMap.bind(this, company) },
  ];
  } else if(company['ax_company_id']!='' || company['ax_company_id'] != null){
  icons = [
    { class: "fa fa-minus-circle red", action: this.companyUnMap.bind(this, company) },
 ];
}
return icons;
}

companyMap(company){
  console.log(company);
  if(company._ax_provider_id!=null){
  this.common.params = { 'company':company,'title':'Company Mapping' };
  const activeModal = this.modalService.open(AxestrackMappingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  activeModal.result.then(data => {
    if (data.response) {
      // this.getPartnerMappingData();
      }
    });
  }else{
    this.common.showError('First Map Partner!');
  }
  }

  companyUnMap(company){
    console.log(company);
    this.common.loading++;
      let param={
        elCompanyId:company.id
      }
      this.api.postTranstruck('AxesUserMapping/unmapCompanyMapping.json',param)
        .subscribe(res => {
          this.common.loading--;
          if (res['success']){
            this.common.showToast(res['msg']);
          }else{
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });
  }

  //Company Mapping End-----------------------------------------------------------------------



  //Company User Mapping Start-----------------------------------------------------------------------

  
  
  getElogistPartnerUser(event){
    console.log("Elogist Partner:",event);
    this.getCompanyMappingData(event.id);
  }

  getCompanyMappingData(id){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getElogistCompany.json?elPartnerId='+id)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.companyData = res['data'];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  

  getElogistCompanyUser(event){
    console.log("Elogist Company:",event);
    this.companyUserMapping(event.id);
  }

  

  // vehicleData(id){
  //   this.common.loading++;
  //   this.api.getTranstruck('AxesUserMapping/getCompanyVehicles.json?elCompanyId='+id)
  //     .subscribe(res => {
  //       this.common.loading--;
  //       console.log("api data", res);
  //       if (!res['data']) return;
  //       this.vehData = res['data'];
  //       this.companyUserMappings.length ? this.setTable3() : this.resetTable3();
  //     }, err => {
  //       this.common.loading--;
  //       console.log(err);
  //     });
  // }

  




  
    companyUserMapping(id){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getCompanyuser.json?elCompanyId='+id)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.companyUserMappings = res['data'];
        this.companyUserMappings.length ? this.setTable3() : this.resetTable3();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }
  
  resetTable3(){
    this.table3 = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };
  }
  
  
  setTable3() {
    this.table3.data = {
      headings: this.generateHeadings3(),
      columns: this.getTableColumns3()
    };
    return true;
  }
  
  generateHeadings3() {
    let headings = {};
    for (var key in this.companyUserMappings[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle3(key) };
      }
    }
    return headings;
  }
  
  formatTitle3(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }
  
  getTableColumns3() {
    let columns = [];
    this.companyUserMappings.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings3()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons3(campaign)
          };
        } else if(key =='mobileno'){
          column[key]={value:campaign['mobileno']?'show':'',class:'blue',action:this.showMobileNo.bind(this,campaign['mobileno']) }
        }else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }
  
  actionIcons3(companyUser) {
    let icons=[];
    if(companyUser['ax_user_id']=='' || companyUser['ax_user_id'] == null){
     icons = [
       { class: "fa fa-plus green", action: this.companyUserMap.bind(this, companyUser) },
    ];
    
  } else if(companyUser['ax_user_id']!='' || companyUser['ax_user_id'] != null){
    icons = [
      { class: "fa fa-minus-circle red", action: this.companyUserUnMap.bind(this, companyUser) },
   ];
  }
  return icons;
  }
  
  companyUserMap(companyUser){
    console.log(companyUser);
    if(companyUser._ax_company_id!=null){
    this.common.params = { 'companyUser':companyUser,'title':'Company User Mapping' };
    const activeModal = this.modalService.open(AxestrackMappingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        // this.getPartnerMappingData();
        }
      });
    }else{
      this.common.showError('First Map Company!');
    }
    }
    companyUserUnMap(companyUser){
      console.log(companyUser);
      this.common.loading++;
        let param={
          elCompanyUserId:companyUser.id
        }
        this.api.postTranstruck('AxesUserMapping/unmapCompanyUserMapping.json',param)
          .subscribe(res => {
            this.common.loading--;
            if (res['success']){
              this.common.showToast(res['msg']);
            }else{
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log(err);
          });
    }

    // searchCompanyUserList(){
    //   this.common.loading++;
    //   this.api.getTranstruck('AxesUserMapping/getelo.json')
    //     .subscribe(res => {
    //       this.common.loading--;
    //       console.log("api data", res);
    //       if (!res['data']) return;
    //       this.vehicleMapping = res['data'];
    //       this.vehicleMapping.length ? this.setTable4() : this.resetTable4();
    //     }, err => {
    //       this.common.loading--;
    //       console.log(err);
    //     });
    // }

    getElogistPartnerUserForVehicle(event){
      console.log("Elogist Partner for Vehicle:",event);
      this.vehicleMap(event.id);
    }
  
    vehicleMap(id){
      
      this.common.loading++;
      this.api.getTranstruck('AxesUserMapping/getCompanyVehicles.json?elCompanyId='+id)
        .subscribe(res => {
          this.common.loading--;
          if(res['code']===0) { this.common.showError(res['msg']); return false;};
          if (!res['data']) return;
          this.vehicleMapping = res['data'];
          this.vehicleMapping.length ? this.setTable4() : this.resetTable4();
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });
    }

    resetTable4(){
      this.table4 = {
        data: {
          headings: {},
          columns: [],
        },
        settings: {
          hideHeader: true
        }
      };
    }
    
    
    setTable4() {
      this.table4.data = {
        headings: this.generateHeadings4(),
        columns: this.getTableColumns4()
      };
      return true;
    }
    
    generateHeadings4() {
      let headings = {};
      for (var key in this.vehicleMapping[0]) {
        if (key.charAt(0) != "_") {
          headings[key] = { title: key, placeholder: this.formatTitle4(key) };
        }
      }
      return headings;
    }
    
    formatTitle4(strval) {
      let pos = strval.indexOf('_');
      if (pos > 0) {
        return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
      } else {
        return strval.charAt(0).toUpperCase() + strval.substr(1);
      }
    }
    
    getTableColumns4() {
      let columns = [];
      this.vehicleMapping.map(campaign => {
        let column = {};
        for (let key in this.generateHeadings4()) {
          if (key == 'Action') {
            column[key] = {
              value: "",
              isHTML: false,
              action: null,
              icons: this.actionIcons4(campaign)
            };
          } else {
            column[key] = { value: campaign[key], class: 'black', action: '' };
          }
        }
        columns.push(column);
      })
      return columns;
    }
    
    actionIcons4(vehicle) {
      let icons=[];
      if(vehicle['ax_veh_id']=='' || vehicle['ax_veh_id'] == null){
       icons = [
         { class: "fa fa-plus green", action: this.vehiclemappings.bind(this, vehicle) },
      ];
    } else if(vehicle['ax_veh_id']!='' || vehicle['ax_veh_id'] != null){
      icons = [
        { class: "fa fa-minus-circle red", action: this.vehicleUnMap.bind(this, vehicle) },
     ];
    }
    return icons;
    }

    vehiclemappings(vehicle){
      console.log(vehicle);
    if(vehicle._ax_company_id!=null){
    this.common.params = { 'vehicle':vehicle,'title':'Vehicle Mapping' };
    const activeModal = this.modalService.open(AxestrackMappingComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
         this.getCompanyMappingData(null);
        }
      });
    }else{
      this.common.showError('First Map Company!');
    }
    }

    vehicleUnMap(vehicle){
      console.log(vehicle);
      this.common.loading++;
        let param={
          elVehicleId:vehicle.id
        }
        this.api.postTranstruck('AxesUserMapping/unmapVehicleMapping.json',param)
          .subscribe(res => {
            this.common.loading--;
            if (res['success']){
              this.common.showToast(res['msg']);
            }else{
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError()
            console.log(err);
          });
    }

    addVehicle(){
    this.modalService.open(AddvehicleComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    }

    addPartner(){
      this.modalService.open(AddpartnerComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    }

    addPartnerUser(){
      this.modalService.open(AddpartneruserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    }

    showMobileNo(mobileno){
      this.common.params=mobileno;
      console.log("mobile no",this.common.params);
      const activeModal = this.modalService.open(MobileNoComponent, {
        size: "sm",
        container: "nb-layout"
      });
   }
  

}
