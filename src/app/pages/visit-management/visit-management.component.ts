import { Component, OnInit,ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageViewComponent } from './../../modals/image-view/image-view.component';
import { TableService } from './../../Service/Table/table.service';
import { DatePipe } from '@angular/common';
import { from, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { RouteMapperComponent } from '../../modals/route-mapper/route-mapper.component';
import { CommonService } from './../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { MapService } from './../../Service/map/map.service';
import { UserService } from "../../Service/user/user.service";
// import { expenses, expenseDetail } from './data';
declare var google: any;
import * as _ from 'lodash';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { LocationEntityComponent } from '../../modals/location-entity/location-entity.component';
import { UnmappedVisitComponent } from '../../modals/unmapped-visit/unmapped-visit.component';

@Component({
  selector: 'ngx-visit-management',
  templateUrl: './visit-management.component.html',
  styleUrls: ['./visit-management.component.scss']
})
export class VisitManagementComponent implements OnInit, OnDestroy, AfterViewInit {
  currentDate = this.common.getDate();
  startDate = new Date();
  endDate = new Date();
  category:any;
  allUsers:any[] = [];
  allVisits:any[] = [];
  isDetailView:boolean = false;
  ExpenseDate:any;
  userdetail:any;
  expenseTypeVal:any;
  status:any;
  detailimageSrc:any;
  detailImageZoom:boolean = false;
  expenseImage:string = '';
  alluserselect:boolean = false;
  expenseIndex:number = -1;
  detailDataIndex:number = -1;
  @ViewChild(DataTableDirective, {static: false})
  dtElement: any;
  // dtOptions: DataTables.Settings = {};
  dtOptions =  this.table.options(10,9,'USER EXPENSES');
  dtTrigger: Subject<any> = new Subject<any>();
  updatedExpenses = [];
  expenseSearch = {
    admin : { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name }
  };

  selectedExpense;
  onsiteImages = [];
  expenseList = [];

  // start:map
  switchButton = 'Live';
  map;
  poly;
  markers = [];
  values = [];
  imageArrayonMap = [];
  final = [];
  closebuttonForModel = false;
  travelDistanceData = [];
  requestData = {
    type: null,
    lat: 22.719568,
    long: 75.857727,
    zoom: 4.5
  };
  wayPoints = null;
  multiMarkerInfoWindow: any;
  // end: map

  detaildate:any;

  constructor(public modalService: NgbModal,
    public common:CommonService,
    public mapService: MapService, public api: ApiService,public userService: UserService,private datePipe:DatePipe, public table:TableService) {
    this.common.refresh = this.refreshPage.bind(this);
    this.getAllAdmin();
    // this.showAdminWiseWagesList();
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.showAdminWiseWagesList();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  initializeMap(){
    this.map = null;
    var latlng = new google.maps.LatLng(26.901052, 75.790624);
    var opt =
    {
      center: latlng,
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // map initialization
    this.map = new google.maps.Map(document.getElementById("map"), opt);
    // polyline initializtion
    var polyOptions = {
      strokeColor: '#99999',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      icons: [{
        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
        offset: '100%',
        repeat: '40px'
      }]
    }
    this.poly = new google.maps.Polyline(polyOptions);
    this.poly.setMap(this.map);
    console.log('poly', this.poly);
    // return;
    var path = this.poly.getPath();
  }

listhandler(index:number){
this.detailDataIndex = index;
this.detailImageZoom = true;
let currentImageClass =  `.detail-images.index-${index}`;
let currentImage =  document.querySelectorAll(currentImageClass);
currentImage[0].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
}




detailImageHandler(index:number){
this.detailDataIndex = index;
this.searchLatLong(this.onsiteImages[index]);
this.detailDataIndex = index;
this.detailImageZoom = true;
// let currentImageClass =  `.location-list .list-item-${index}`;
// let currentItem =  document.querySelectorAll(currentImageClass);
// currentItem[0].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});

}


  refreshPage(){
    if(this.isDetailView){
      this.viewExpenseDetail(this.selectedExpense);
    }else{
      this.startDate = new Date();
      this.endDate = new Date();
      this.expenseSearch.admin = { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name }
      this.getAllAdmin();
      this.showAdminWiseWagesList();
      // this.isDetailView = false;
      this.allVisits = [];
      this.allUsers = [];

      this.selectedExpense = null;
      this.onsiteImages = [];
      this.expenseList = [];
      this.alluserselect = false;
    }
  }

  getAllAdmin() {
    let apiName = "Admin/getAllAdmin.json";
    if(this.userService._details['isSuperUser']){
      this.allUsers = [{
        "id": null,
        "name": "All",
        "mobileno": null,
        "department_name": null
      }];
    }else{
      // this.allUsers = [];
      this.allUsers = [{
        "id": this.userService.loggedInUser.id,
        "name": this.userService.loggedInUser.name,
        "mobileno": null,
        "department_name": null
      }];
      apiName = "Admin/getAllReporter?userId="+this.userService.loggedInUser.id;
    }
    this.common.loading++;
    this.api.get(apiName)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        let allUsers = res['data'] || [];

        allUsers.map(x=>{
          this.allUsers.push({
            "id": x.id,
            "name": x.name,
            "mobileno": x.mobileno,
            "department_name": x.department_name
          });
        })
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  };

  selectedUser(event:any){
    if(!event.id){
      this.endDate = this.startDate;
    }
    this.expenseSearch.admin = { id: event.id, name: event.name };
  }

  selectedUserOnDetail(event:any){
    this.selectedExpense._user_id = event.id;
    this.selectedExpense.name = event.name;
    this.viewExpenseDetail(this.selectedExpense);
  }

  resetData(){
    this.startDate = new Date();
    this.endDate = new Date();
    this.expenseSearch.admin = { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name };
    this.showAdminWiseWagesList();
    this.isDetailView = false;
    this.allVisits = [];
    this.selectedExpense = null;
    this.onsiteImages = [];
    this.expenseList = [];
  }

  isAllCheckboxDisable = false;
  showAdminWiseWagesList() {
    this.isAllCheckboxDisable = false;
    let adminId = this.expenseSearch.admin.id;
    // if (!adminId) {
    //   this.common.showError('Please select User');
    //   return;
    // }
    if (!adminId) {
      this.endDate = this.startDate;
    }
    if (this.startDate > this.endDate) {
      this.common.showError('End Date should be grater than Start Date')
      return;
    }
    let param = `userId=${adminId}&startDate=${this.common.dateFormatter1(this.startDate)}&endDate=${this.common.dateFormatter1(this.endDate)}`;
    this.common.loading++;
    this.allVisits = [];
    this.api.get('Admin/getOnSiteExpensesByUserNew?' + param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.allVisits = res['data'] || [];
          // this.renderTable();
          this.updateExpenseArray();
          if(this.allVisits && (this.allVisits.find(x=>x.is_disable) || this.allVisits.find(x=>x._user_id==this.userService.loggedInUser.id))){
            this.isAllCheckboxDisable = true;
          }
          this.renderTable();
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  updateExpenseArray() {
    this.updatedExpenses = [];
    this.updatedExpenses = this.allVisits.map(data => {
      data['checked'] = false;
      return {
        user_id: data._user_id,
        date: data.sqdate,
        user_amount: data.travel_amount,
        system_amount: data.system_expense,
        other_amount: data.other_amount,
        total_amount: data.total_expense,
      }
    });
    console.log('arrayManaged', this.updatedExpenses)
  }

  selectAllUser(event:any){
    this.alluserselect  = !this.alluserselect;
    event.stopPropagation();
    console.log('all check',this.alluserselect);
    this.allVisits.map((item:any)=>{
      item.checked = this.alluserselect;
    })
  }

  selectUser(index:number){
    this.allVisits[index].checked = !this.allVisits[index].checked;
    if(this.allVisits && this.allVisits.find(x=>!x.checked)){
      this.alluserselect = false;
    }else{
      this.alluserselect = (!this.allVisits) ? false : true;
    }
    console.log('this.allVisits',this.allVisits);
  }

  saveVerifiedExpense() {
    console.log('adminWiseList', this.updatedExpenses);
    if(!(this.allVisits && this.allVisits.find(x=>x.checked))){
      this.common.showError("Please select atleast one row");
      return false;
    }
    let isSelfVisit = false;
    let expenseList = [];
    if(this.allVisits && this.allVisits.length){
      this.allVisits.forEach((element,key) => {
        if(element.checked){
          expenseList.push(
            JSON.parse(JSON.stringify(this.updatedExpenses[key]))
          );

          if(element._user_id==this.userService.loggedInUser.id){
            isSelfVisit = true;
          }
        }
      });
    }
    if(isSelfVisit){
      this.common.showError("You can't change your own visit");
      return false;
    }
    // console.log("saveVerifiedExpense:",expenseList);return false;
    this.common.loading++;
    let params = {
      expenses: JSON.stringify(expenseList),
      status: 1
    }
    this.api.post(`Admin/saveOnSiteExpenseByAdmin`, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0]['y_msg']);
          this.showAdminWiseWagesList();
        }
      }else{
        this.common.showError(res['msg']);
      }
    },err=>{
      this.common.loading--;
      this.common.showError();
    })
  }

  saveVerifiedExpenseSingleWithConfirm(status,item) {
    let msg = "<b>All the visit images will be rejected that are attached with same date.<br>Are you sure to reject anyway?<b>";
    if(status==1){
      msg = "<b>This Approval will result in all the details(Visit Images & expenses) to be approved and it can not be edited after that.<br>Are you sure to approve anyway?<b>";
    }
    // else{

    // }
      this.common.params = {
        title: (status==1) ? "Approve Visit" : "Reject Visit",
        description: msg,
        isRemark: false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
      activeModal.result.then((data) => {
        if (data.response) {
          this.saveVerifiedExpenseSingle(status,item);
        }
      });
    // }else{
    //   this.saveVerifiedExpenseSingle(status,item);
    // }
  }

  saveVerifiedExpenseSingle(status,item) {
    console.log('status,: ', status,);
    console.log('adminWiseList', this.updatedExpenses);
    if(item._user_id==this.userService.loggedInUser.id){
      this.common.showError("You can't change your own visit");
      return false;
    }
    if (status==-1){
      item.total_amount = 0;
    }
    let expenseList = [item];
    // console.log("saveVerifiedExpenseSingle:",expenseList);return false;
    this.common.loading++;
    let params = {
      expenses: JSON.stringify(expenseList),
      status:status
    }
    this.api.post(`Admin/saveOnSiteExpenseByAdmin`, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0]['y_msg']);
          this.showAdminWiseWagesList();
        }
      }else{
        this.common.showError(res['msg']);
      }
    },err=>{
      this.common.loading--;
      this.common.showError();
    })
  }

  viewExpenseDetail(item){
  let menusidebar = document.getElementsByClassName('menu-sidebar');
  menusidebar[0].classList.remove('expanded');
  menusidebar[0].classList.add('compacted');

    this.selectedExpense = item;
    this.isDetailView = true;
    this.detaildate = this.datePipe.transform(new Date(this.selectedExpense.sqdate),'dd-MM-yyyy');
    this.getOnSiteImagesByUser();
    setTimeout(() => {
      this.initializeMap();
    }, 200);
    this.getTravelDistance();
    this.getExpenseWrtUserDate();
  }

  getOnSiteImagesByUser() {
    this.onsiteImages = [];
    let adminId = this.selectedExpense._user_id;
    // if (!adminId) {
    //   this.common.showError('Please select User');
    //   return;
    // }
    if (!this.selectedExpense.sqdate) {
      this.common.showError('Date is missing');
      return;
    }
    let param = `userId=${adminId}&startDate=${this.common.dateFormatter(this.selectedExpense.sqdate)}&endDate=${this.common.dateFormatter(this.selectedExpense.sqdate)}`;
    this.common.loading++;
    this.api.get('Admin/getOnSiteImagesByUserNew?' + param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.onsiteImages = res['data'] || [];
          if(this.onsiteImages && this.onsiteImages.length){
            this.detailDataIndex = 0;
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getExpenseWrtUserDate() {
    this.expenseList = [];
    let param = `userId=${this.selectedExpense._user_id}&startDate=${this.common.dateFormatter(this.selectedExpense.sqdate)}&endDate=${this.common.dateFormatter(this.selectedExpense.sqdate)}`;
    this.common.loading++;
    this.api.get('Admin/getExpenseWrtUserDate?' + param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.expenseList = res['data'] || [];
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  updateOnsiteExpenseStatus(expense=null){
    let param = {
      "expenseInfo": (expense) ? [expense] : this.expenseList
    };
    // console.log("updateOnsiteExpenseStatus:",param); return false;
    this.common.loading++;
    this.api.post('Admin/updateOnsiteExpenseAmountMulti', param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
          (expense) ? null : this.getExpenseWrtUserDate();
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  updateOnsiteImageStatusWithConfirm(status,item) {
    if(status==-1){
      this.common.params = {
        title: "Reject Visit Image",
        description:
          "<b>Rejecting this visit, will reject all the attached expenses. <br>Are you sure to reject anyway?<b>",
        isRemark: false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
      activeModal.result.then((data) => {
        if (data.response) {
          this.updateOnsiteImageStatus(status,item);
        }
      });
    }else{
      this.updateOnsiteImageStatus(status,item);
    }
  }

  updateOnsiteImageStatus(status,item){
    if (!item._id) {
      this.common.showError('image is missing');
      return false;
    }
    let param = {
      "id":item._id,
      "status":status
    };
    this.common.loading++;
    this.api.post('Admin/updateOnsiteImageStatus', param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
          item._status = status;
          if(status==-1){
            this.getExpenseWrtUserDate();
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  renderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.clear();
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  dateextractor(number:number){
    // let today = new Date()
    let currentDate = this.common.getDate();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    if(number==1 && new Date(this.selectedExpense.sqdate)>= currentDate){
      this.common.showError("Future date no allowed");return false;
    }else{
      let otherdate = new Date(this.selectedExpense.sqdate);
      console.log('selectedExpense date: ', new Date(this.selectedExpense.sqdate));
      otherdate.setDate(otherdate.getDate() + number);
      this.detaildate = this.datePipe.transform(otherdate,'dd-MM-yyyy');
      let detaildate2 = this.datePipe.transform(otherdate,'yyyy-MM-dd');
      console.log('this.detaildate: ', this.detaildate);
      this.selectedExpense.sqdate = detaildate2;
      this.viewExpenseDetail(this.selectedExpense);
      // return this.detaildate;
    }
  }

  openLink(index:number,type) {
    let images:any = [];
    this.onsiteImages.map(data => {
      images.push({name:type,image:data._url});
    });

    const activeModal = this.modalService.open(ImageViewComponent, { size: 'lg', container: 'nb-layout' });
    activeModal.componentInstance.index = index;
    activeModal.componentInstance.imageList = { images, title: 'Image',index:index };
  }


  backnavigate(){
    this.isDetailView = false;
    this.showAdminWiseWagesList();
  }

  expenseInfo = [];
  openExpenseInfoModal(item,event) {
    event.preventDefault();
    event.stopPropagation();
    this.expenseInfo = [];
    if(item && item._onside_img && item._onside_img.length){
      item._onside_img.forEach(element => {
        if(element.exp_img && element.exp_img.length){
          element.exp_img.forEach(element2 => {
            this.expenseInfo.push(element2);
          });
        }
      });
    }

  }



// start: map --------------------------------------------------
  getTravelDistance() {
    if (!this.selectedExpense._user_id) {
      this.common.showError('Select User')
    } else {

      const params = '&installerId=' + this.selectedExpense._user_id + '&fromDate=' + this.common.dateFormatter(this.selectedExpense.sqdate) + '&toDate=' + this.common.dateFormatter(this.selectedExpense.sqdate);
      this.common.loading++;
      this.api.get("Location/getLatLongBtwTime.json?" + params)
        .subscribe(res => {
          this.common.loading--;
          if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
          let travelDistanceLatLng = res['data'] || [];

          if (travelDistanceLatLng[0]['wayPoints'] && travelDistanceLatLng[0]['wayPoints'].length > 0) {
            travelDistanceLatLng[0]['wayPoints'].forEach((element, index) => {
              element.label = index + 1;
            });
          }

          if (travelDistanceLatLng[1]['wayPointsLive'] && travelDistanceLatLng[1]['wayPointsLive'].length > 0) {
            travelDistanceLatLng[1]['wayPointsLive'].forEach((element, index) => {
              element.label = index + 1;
            });
          }
          this.travelDistanceData = travelDistanceLatLng || [];
          console.log("🚀 ~ file: calulate-travel-distance.component.ts ~ line 132 ~ CalulateTravelDistanceComponent ~ getTravelDistance ~ this.travelDistanceData", this.travelDistanceData)
          if (!this.travelDistanceData) {
            this.common.showError('No Data Found');
          } else {
            this.calcRoadDistance(this.travelDistanceData[0]);
          }

        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log(err);
        });
    }
  }

  calcRoadDistance(partnerVal) {
    console.log("TravelDistanceComponent -> calcRoadDistance -> partnerVal", partnerVal);
    this.storeTable(partnerVal);
    // this.removeProximate(partnerVal['wayPointdata']);
    this.plotMarker(partnerVal['wayPoints']);
    // this.plotPath(partnerVal['wayPointdata']);
    setTimeout(() => {
      this.plotPath(partnerVal['wayPointdata']);
    }, 3000);
  }
  storeTable(partnerVal) {
    let final = [];
    final.push({
      "km": Math.round(partnerVal.dis / 1000),
      "startDate": this.common.changeDateformat2(partnerVal.wayPoints[0].location_fetch_time),
      "endDate": this.common.changeDateformat2(partnerVal.wayPoints[partnerVal.wayPoints.length - 1].location_fetch_time)
    });
    this.buildTable(final);
  }

  mycallback(response) {
    var row = [];
    var element;
    var distance;
    row = response.rows;
    element = row[0].elements;
    distance = element[0].distance;
    return distance.value;
  }

  buildTable(values) {
    this.final = values;
  }

  haversine(lat1, long1, lat2, long2, range) {
    var R = 6371000;
    var phi_1 = this.toRad(lat1);
    var phi_2 = this.toRad(lat2);
    let delta_phi = this.toRad((lat2 - lat1));
    let delta_lambda = this.toRad((long2 - long1));
    let a = Math.sin(delta_phi / 2.0) * Math.sin(delta_phi / 2.0) +
      Math.cos(phi_1) * Math.cos(phi_2) *
      Math.sin(delta_lambda / 2.0) * Math.sin(delta_lambda / 2.0);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let km = (R * c) / 1000.0;

    if (km > range) {
      return true;
    }
    else
      return false;
  }

  toRad(value) {
    return (value * Math.PI) / 180;
  }

  infowindow = new google.maps.InfoWindow();
  plotMarker(values) {
    this.infowindow.opened = false;

    this.markers.map(marker => marker.setMap(null));
    this.markers = [];
    let count1 = 1;
    let groups = _.groupBy(values, loc => { return loc.lat + '_' + loc.long });
    console.log('groups:', groups);
    let count = 1;
    Object.keys(groups).map((key, i) => {
      const group = groups[key];
      let length = group.length
      let marker = null;

      this.onsiteImages.forEach(img => {
        if(group[0].lat == img._lat&& group[0].long ==img._long){
          group[0]["markerCreated"]=true;
          marker = new google.maps.Marker({
            position: { lat: group[0].lat, lng: group[0].long },
            // label: length > 1 ? group[0].label + '-' + group[length - 1].label : group[0].label.toString(),
            icon:"http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|" + count1 + "|" + "808080" + "|ffffff",
            map: this.map
          });
          count1++;
        }


      });
      if( !group[0]["markerCreated"] && (i==0 ||i==Object.keys(groups).length-1 )){
        let color = i==0?"00FF00":i==Object.keys(groups).length-1?"FF0000":"FFFF00";
        let point =  i==0?"S":i==Object.keys(groups).length-1?"D":"W";
        marker = new google.maps.Marker({
          position: { lat: group[0].lat, lng: group[0].long },
          icon:"http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|" + point + "|" + color + "|000000",
          map: this.map
        });
      }
      else if(!group[0]["markerCreated"]){
          marker = new google.maps.Marker({
            position: { lat: group[0].lat, lng: group[0].long },
            // label: length > 1 ? group[0].label + '-' + group[length - 1].label : group[0].label.toString(),
            icon:{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: i==0?"#00FF00":i==Object.keys(groups).length-1?"#FF0000":"#FFFF00" ,
              fillOpacity: 0.8,
              strokeWeight: 1
            },
            map: this.map
          });
      }


      count += length;

      google.maps.event.addListener(marker, "click", (event) => {
        if (this.infowindow) {
          this.infowindow.close();
          this.infowindow.opened = false;
        }
        if (this.multiMarkerInfoWindow) this.multiMarkerInfoWindow.setMap(null);
        if (group.length > 1) {
          if (!this.multiMarkerInfoWindow) {
            this.multiMarkerInfoWindow = new google.maps.InfoWindow({});
          }
          this.multiMarkerInfoWindow.setContent(this.setMultiMarkerContent(group));
          this.multiMarkerInfoWindow.open(this.map, marker);
        } else {

          console.log(event.latLng.lat())
          let lat = event.latLng.lat();
          let lng = event.latLng.lng();
          this.getImages(this.selectedExpense._user_id, lat, lng, group[0].time);
        }
      });

      this.markers.push(marker);
    })
  }

  changeColorUsingLatlng (item,evtype = 1){
    this.markers.forEach(marker => {
      if(item._lat==marker.position.lat() && item._long==marker.position.lng() ){
        if(evtype==1){
      console.log(marker.icon);
        marker['oldIcon'] = marker.icon;
        let label = marker.icon ? ""+marker.icon.split("|")[1] :"";
        console.log("label=",label);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setIcon( "http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|"+ label+"|0000ff|000000");
      }else  if(evtype==2){
        marker.setIcon( marker['oldIcon']);
        marker.setAnimation(null);
      }
    }
    });
  }


  setMultiMarkerContent(points) {
    let div = document.createElement('div');
    let style = `margin-right: 10px;
      width: 20px;
      height: 20px;
      background: red;
      display: inline-block;
      text-align: center;
      line-height: 20px;
      border-radius: 19px;
      cursor: pointer;
      font-weight: bold;`;

    points.map((point, i) => {
      let ele = document.createElement('span');
      ele.innerHTML = `<span style="${style}">${point.label}</span>`;
      ele.onclick = () => this.getImages(this.selectedExpense._user_id, point.lat, point.long, point.time)
      // ele.onclick = () => this.getImages(47, 19.2530844, 73.0154552, '2020-12-01T14:46:10.111754')
      div.appendChild(ele);
    });
    return div;
  }

  plotPath(values) {
    this.infowindow.opened = false;
    let thiss = this;
    var path = this.poly.getPath();
    console.log("plot");
    console.log(thiss.imageArrayonMap, 'images')

    this.poly.setMap(this.map);
    path.clear();
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < values.length; i++) {

      let loc = new google.maps.LatLng(values[i].lat, values[i].long);
      path.push(loc);
      bounds.extend(loc);
    }
    this.map.setCenter(bounds.getCenter()); //or use custom center
    this.map.fitBounds(bounds);
  }

  getImages(id, lat, lng, time) {
    this.onsiteImages.forEach((element,key) => {
      if(element._lat==lat && element._long==lng){
        this.detailDataIndex = key;
      }
    });
  }

  searchLatLong(item){
    // this.showImages(item._lat, item._long);
  }

  showImages(lat, lng) {
    // let loc2 = new google.maps.LatLng(lat, lng);
    // new google.maps.Marker({
    //   position: loc2,
    //   icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    //   map: this.map
    // });
    // let marker = new google.maps.Marker({
    //   position: { lat: group[0].lat, lng: group[0].long },
    //   label: length > 1 ? group[0].label + '-' + group[length - 1].label : group[0].label.toString(),
    //   map: this.map
    // });
    if (this.infowindow) {
      this.infowindow.close();
      this.infowindow.opened = false;
    }

    this.infowindow = new google.maps.InfoWindow({
      content: 'Selected Image',
      pixelOffset: new google.maps.Size(0, -32)
    });
    let loc = new google.maps.LatLng(lat, lng);
    this.infowindow.setPosition(loc);
    this.infowindow.open(this.map);
  }

  clearMap() {
    // this.resetData();
    this.final = [];
    var path = this.poly.getPath();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
    path.clear();
  }

  viewRoute() {
    let startdate = new Date(this.selectedExpense.sqdate);
    let enddate = new Date(this.selectedExpense.sqdate);
    startdate.setHours(0);
    startdate.setMinutes(0);
    startdate.setSeconds(0);
    enddate.setHours(23);
    enddate.setMinutes(59);
    enddate.setSeconds(59);
    let report = {
      startDate: startdate,
      endDate: enddate,
      userId: this.selectedExpense._user_id
    }
    this.common.params = report;
    this.modalService.open(RouteMapperComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    // this.common.handleModalSize('class', 'modal-lg', '1200');

  }


  switchLatLngHandler() {
    switch (this.switchButton) {
      case 'Live':
        const seprateLiveObject = this.travelDistanceData[1];
        const manuplateLive = { dis: seprateLiveObject.disLive, wayPointdata: seprateLiveObject.wayPointdataLive, wayPoints: seprateLiveObject.wayPointsLive };
        console.log('Passed', manuplateLive);
        this.calcRoadDistance(manuplateLive);
        this.switchButton = 'Recorded';
        break;
      case 'Recorded':
        console.log('Passed', this.travelDistanceData[0]);
        this.calcRoadDistance(this.travelDistanceData[0]);
        this.switchButton = 'Live';
        break;
    }
  }
// end: map ------------------------------------------------------


// mapping modal open -----------------------------
openMappingModal(itemImage){
  console.log("itemImage",itemImage);
  this.common.params = {imageId:itemImage._id,lat:itemImage._lat,lng:itemImage._long};
  const activeModal = this.modalService.open(LocationEntityComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
  activeModal.result.then(data => {
    if (data.response) {
      this.getOnSiteImagesByUser();
    }
});
}

  openUnmappedVisitModal() {
    const activeModal = this.modalService.open(UnmappedVisitComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.componentInstance.allUsers = { allUsers: this.allUsers, title: 'Visit-Report' };
    activeModal.result.then(data => {});
  }
}
