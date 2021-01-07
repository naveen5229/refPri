import { Component, OnInit, Directive } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddfouserComponent } from '../../modals/addfouser/addfouser.component';
import { LocationSelectionComponent } from '../../modals/location-selection/location-selection.component';

@Component({
  selector: 'ngx-customeronboarding',
  templateUrl: './customeronboarding.component.html',
  styleUrls: ['./customeronboarding.component.scss']
})
export class CustomeronboardingComponent implements OnInit {

  activeTab='foadminuser';
  keepGoing = true;
  searchString = '';

  foUser=null;
  FoData=[];
  departments=[];
  foDetailsData=[];
  officeDatas=[];
  officeDataForWifi=[];
  getWifiDataList=[];
  departmentName=null;
  depFoId=null;
  officeName=null;
  officeFoId=null;
  ssid=null;
  bssid=null;
  ip=null;
  officeListId=null;
  wifiFoId=null;
  officeData={
    location:null,
    lat:null,
    long:null
  }

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

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal) { 
      this.getFoData(null);
    }

  ngOnInit() {
  }

  resetvar(){
    if(this.activeTab=="department"){
      this.departmentName=null;
    } else if(this.activeTab=="wifi"){
      this.ssid=null;
    this.bssid=null;
    this.ip=null;
    } else if(this.activeTab=="office"){
      this.officeName=null;
    }
  }

  addFoAdminUser() {
    const activeModal = this.modalService.open(AddfouserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
 }

 foUsers(event){
    console.log("Elogist Company:",event);
    if(this.activeTab=='foadminuser'){
    this.getFoDetails(event.id);
    } else if(this.activeTab == 'department'){
      this.depFoId=event.id;
      this.getDepartments(event.id);
    } else if(this.activeTab == 'office'){
      this.officeFoId=event.id;
      this.getOffice(event.id);
    } else if(this.activeTab == 'wifi'){
      this.wifiFoId=event.id;
      this.getWifiList(event.id);
      this.getOfficeDataForWifi(event.id);
    }
  }


  getFoData(id){
    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getElogistCompany.json?elPartnerId='+id)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.FoData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  getFoDetails(id){
    this.table = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };

    this.common.loading++;
    this.api.getTranstruck('AxesUserMapping/getCompanyuser.json?elCompanyId='+id)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.foDetailsData = res['data'];
        this.foDetailsData.length ? this.setTable():this.resetTable();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }


  resetTable(){
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
    for (var key in this.foDetailsData[0]) {
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
    this.foDetailsData.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
          column[key] = { value: campaign[key], class: 'black', action: '' };
      }
      columns.push(column);
    })
    return columns;
  }

  getDepartments(id) {
    this.table1 = {
      data: {
        headings: {},
        columns: [],
      },
      settings: {
        hideHeader: true
      }
    };
    this.common.loading++;
    this.api.get("Admin/getDepartmentList?foid="+id, "I")
      .subscribe(res => {
        this.common.loading--;
        console.log("Data147:",res['data']);
        this.departments = res['data'] || [];
        this.departments.length ? this.setTable1():this.resetTable1();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  addDepartment(){
    let param={
      name:this.departmentName,
      foUserId:this.depFoId, 
      requestId:null
    }
    this.common.loading++;
    this.api.post("Admin/addDepartment",param, "I")
      .subscribe(res => {
        this.common.loading--;
        if(res['success']){
          this.common.showToast(res['msg']);
        }
        
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
    for (var key in this.departments[0]) {
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
    this.departments.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings1()) {
          column[key] = { value: campaign[key], class: 'black', action: '' };
      }
      columns.push(column);
    })
    return columns;
  }


  onChangeAuto(search) {
    this.officeData.lat = null;
    this.officeData.long = null;
    this.officeData.location = null;
    this.searchString = search;
    console.log('..........', search);
  }

  selectLocation(place) {
    console.log("palce", place);
    this.officeData.lat = place.lat;
    this.officeData.long = place.long;
    this.officeData.location = place.location || place.name;
  }


  takeAction(res) {
    setTimeout(() => {
      console.log("Here", this.keepGoing, this.searchString.length, this.searchString);

      if (this.keepGoing && this.searchString.length) {
        this.common.params = { placeholder: 'selectLocation', title: 'SelectLocation' };

        const activeModal = this.modalService.open(LocationSelectionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        this.keepGoing = false;
        activeModal.result.then(res => {
          if (res != null) {
            console.log('new-response----', res, res.location);
            this.keepGoing = true;
            if (res.location.lat) {
              this.officeData.location = res.location.address;
              (<HTMLInputElement>document.getElementById('location')).value = this.officeData.location;
              this.officeData.lat = res.location.lat;
              this.officeData.long = res.location.lng;
              this.keepGoing = true;
            }
          }
        })

      }
    }, 1000);
  }

addOffice(){
  let param={
    foUserId:this.officeFoId,
    name:this.officeName, 
    lat:this.officeData.lat,
    long:this.officeData.long,
    requestId:null
  }
  this.common.loading++;
    this.api.post("Admin/addOffice",param, "I")
      .subscribe(res => {
        this.common.loading--;
        if(res['success']){
          this.common.showToast(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
    }

    getOffice(id){
      this.table2 = {
        data: {
          headings: {},
          columns: [],
        },
        settings: {
          hideHeader: true
        }
      };
      this.common.loading++;
      this.api.get("Admin/getOfficeList?foUserId="+id, "I")
        .subscribe(res => {
          this.common.loading--;
          console.log("Data147:",res['data']);
          this.officeDatas = res['data'] || [];
          this.officeDatas.length ? this.setTable2():this.resetTable2();
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
      for (var key in this.officeDatas[0]) {
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
      this.officeDatas.map(campaign => {
        let column = {};
        for (let key in this.generateHeadings2()) {
            column[key] = { value: campaign[key], class: 'black', action: '' };
        }
        columns.push(column);
      })
      return columns;
    }

    getOfficeDataForWifi(id){
      this.officeDataForWifi=[];
      this.common.loading++;
      this.api.getTranstruck('Admin/getOfficeList?foUserId='+id,'I')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.officeDataForWifi = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
    }

    

    selectOffice(event){
      console.log("OfficeDataforWifi:",event);
      this.officeListId=event._id;
    }

    getWifiList(id){
      this.table3 = {
        data: {
          headings: {},
          columns: [],
        },
        settings: {
          hideHeader: true
        }
      };
      this.common.loading++;
      this.api.get("Admin/getWifisMasterList?foid="+id, "I")
        .subscribe(res => {
          this.common.loading--;
          console.log("Data147:",res['data']);
          this.getWifiDataList = res['data'] || [];
          this.getWifiDataList.length ? this.setTable3():this.resetTable3();
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
      for (var key in this.getWifiDataList[0]) {
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
      this.getWifiDataList.map(campaign => {
        let column = {};
        for (let key in this.generateHeadings3()) {
            column[key] = { value: campaign[key], class: 'black', action: '' };
        }
        columns.push(column);
      })
      return columns;
    }

    addwifi(){
      let param={
        foUserId:this.wifiFoId,
        ssid:this.ssid, 
        bssid:this.bssid,
        ip:this.ip,
        officeid:this.officeListId,
        requestId:null
      }
      console.log('param:',param)
      this.common.loading++;
        this.api.post("Admin/addWifiMaster",param, "I")
          .subscribe(res => {
            this.common.loading--;
            if(res['success']){
              this.common.showToast(res['msg']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log(err);
          });
    }
  
}
