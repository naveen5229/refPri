import { TableService } from './../../Service/Table/table.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit,ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

@Component({
  selector: 'ngx-visit-management',
  templateUrl: './visit-management.component.html',
  styleUrls: ['./visit-management.component.scss']
})
export class VisitManagementComponent implements OnInit, OnDestroy, AfterViewInit {
 startDate = new Date();
 endDate = new Date();
 category:any;
 allUsers:any[] = [{
  "id": null,
  "name": "All",
  "mobileno": null,
  "department_name": null
  }];
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
  dtOptions =  this.table.options(10,7,'USER EXPENSES');
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

dateindex:number = -1;
detaildate:any;
listModifyvalue:any;
expenseListitem:any;

  constructor(public modalService: NgbModal,
    public common:CommonService, public mapService: MapService, public api: ApiService,public userService: UserService,private datePipe:DatePipe, public table:TableService) {
    this.common.refresh = this.refreshPage.bind(this);
    this.getAllAdmin();
    this.showAdminWiseWagesList();
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
this.detailImageZoom = true;
this.searchLatLong(this.onsiteImages[index]);
this.detailDataIndex = index;
this.detailImageZoom = true;
let currentImageClass =  `.location-list .list-item-${index}`;
let currentItem =  document.querySelectorAll(currentImageClass);
currentItem[0].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});


}


  refreshPage(){
    this.expenseSearch.admin = { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name }
    this.getAllAdmin();
    this.showAdminWiseWagesList();
    this.isDetailView = false;
    this.allVisits = [];
    this.allUsers = [{
      "id": null,
      "name": "All",
      "mobileno": null,
      "department_name": null
    }];

    this.selectedExpense = null;
    this.onsiteImages = [];
    this.expenseList = [];
  }

  getAllAdmin() {
    this.allUsers = [{
      "id": null,
      "name": "All",
      "mobileno": null,
      "department_name": null
    }];
    this.common.loading++;
    this.api.get('Admin/getAllAdmin.json')
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
  }

  selectedUser(event:any){
    if(!event.id){
      this.endDate = this.startDate;
    }
    this.expenseSearch.admin = { id: event.id, name: event.name };
  }

  showAdminWiseWagesList() {
    let adminId = this.expenseSearch.admin.id;
    // if (!adminId) {
    //   this.common.showError('Please select User');
    //   return;
    // }
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
        user_id: this.expenseSearch.admin.id,
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

  // updateOnsiteImageStatusByUser(status,item){
  //   if (!item._user_id) {
  //     this.common.showError('Please select User');
  //     return false;
  //   }
  //   if (!item.sqdate) {
  //     this.common.showError('Date is missing');
  //     return false;
  //   }
  //   let param = {
  //     "userId":item._user_id,
  //     "status":status,
  //     "startDate":this.common.dateFormatter(item.sqdate),
  //     "endDate":this.common.dateFormatter(item.sqdate)
  //   };
  //   this.common.loading++;
  //   this.api.post('Admin/updateOnsiteImageStatusByUser', param)
  //     .subscribe(res => {
  //       this.common.loading--;
  //       if (res['code'] == 1) {
  //         this.common.showToast(res['msg']);
  //       } else {
  //         this.common.showError(res['msg']);
  //       }
  //     }, (err) => {
  //       this.common.loading--;
  //       this.common.showError();
  //       console.log(err);
  //     });
  // }

  saveVerifiedExpense() {
    console.log('adminWiseList', this.updatedExpenses);
    if(!(this.allVisits && this.allVisits.find(x=>x.checked))){
      this.common.showError("Please select atleast one row");
      return false;
    }
    let expenseList = [];
    if(this.allVisits && this.allVisits.length){
      this.allVisits.forEach(element => {
        if(element.checked){
          expenseList.push(
            JSON.parse(JSON.stringify(element))
          );
        }
      });
    }
    // console.log("saveVerifiedExpense:",expenseList);return false;
    this.common.loading++;
    let params = {
      expenses: JSON.stringify(expenseList),
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
      this.common.showError();
    })
  }

  saveVerifiedExpenseSingle(status,item) {
    console.log('adminWiseList', this.updatedExpenses);
    if (status==-99){
      item.total_amount = 0;
    }
    let expenseList = [item];
    // console.log("saveVerifiedExpenseSingle:",expenseList);return false;
    this.common.loading++;
    let params = {
      expenses: JSON.stringify(expenseList),
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
      this.common.showError();
    })
  }

  viewExpenseDetail(item){
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
    this.api.get('Admin/getOnSiteImagesByUser?' + param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.onsiteImages = res['data'] || [];
          // this.onsiteImages.map((item:any)=>{
          //   item.status = 'default';
          // });
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
          (expense) ? expense.amount=0 : this.getExpenseWrtUserDate();
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
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
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  dateextractor(index:number){
    let today = new Date()
    let otherdate = new Date(today)
    otherdate.setDate(otherdate.getDate() + index);
    this.detaildate = this.datePipe.transform(otherdate,'dd-MM-yyyy');
    let detaildate2 = this.datePipe.transform(otherdate,'yyyy-MM-dd');
    console.log('this.detaildate: ', this.detaildate);
    this.selectedExpense.sqdate = detaildate2;
    this.viewExpenseDetail(this.selectedExpense);
    return this.detaildate;
  }

  nextdate(){
    let currentDate = this.common.getDate();
    currentDate.setHours(0);
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
    if(new Date(this.selectedExpense.sqdate)>= currentDate){
      this.common.showError("Future date no allowed");return false;
    }
    this.dateindex++;
    this.dateextractor(this.dateindex);
  }

  prevdate(){
    this.dateindex--;
    this.dateextractor(this.dateindex)
  }

  imageDialogue(selector:any,image:any){
    this.detailimageSrc = image;
    this.modalService.open(selector, {ariaLabelledBy: 'Expense Detail Image', size: 'lg' }).result.then((result) => {
      }, (reason) => {});
  }

  backnavigate(){
    this.isDetailView = false;
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

    let groups = _.groupBy(values, loc => { return loc.lat + '_' + loc.long });
    console.log('groups:', groups);
    let count = 1;
    Object.keys(groups).map((key, i) => {
      const group = groups[key];
      let length = group.length

      let marker = new google.maps.Marker({
        position: { lat: group[0].lat, lng: group[0].long },
        label: length > 1 ? group[0].label + '-' + group[length - 1].label : group[0].label.toString(),
        map: this.map
      });

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
    this.showImages(item._lat, item._long);
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
      content: 'Current Image',
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

  // resetData() {
  //   this.final = [];
  //   this.admin.id = null;
  //   this.startDate = new Date();
  //   this.endDate = new Date();
  // }

  viewRoute() {
    let report = {
      startDate: this.startDate,
      endDate: this.endDate,
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

}
