import { DatePipe } from '@angular/common';
import { Component, OnInit,ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { RouteMapperComponent } from '../../modals/route-mapper/route-mapper.component';
import { CommonService } from './../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { MapService } from './../../Service/map/map.service';
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
  dtElement: DataTableDirective;
  // dtOptions: DataTables.Settings = {};
  dtOptions: any = {
    pagingType: 'full_numbers',
    pageLength: 5,
    lengthMenu: [5, 10, 25],
    processing: true,
   }
  dtTrigger: Subject<any> = new Subject<any>();
  
  updatedExpenses = [];
  expenseSearch = {
    admin : { id: null, name: 'All' }
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
    public common:CommonService, public mapService: MapService, public api: ApiService,private datePipe:DatePipe) {
    this.common.refresh = this.refreshPage.bind(this);
    this.getAllAdmin();
    this.detaildate = this.datePipe.transform(new Date(),'dd-MM-yyyy');
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    // this.dtTrigger.next();
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

  refreshPage(){
    this.getAllAdmin();
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
          this.dtTrigger.next();
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

  updateOnsiteImageStatusByUser(status,item){
    if (!item._user_id) {
      this.common.showError('Please select User');
      return false;
    }
    if (!item.sqdate) {
      this.common.showError('Date is missing');
      return false;
    }
    let param = {
      "userId":item._user_id,
      "status":status,
      "startDate":this.common.dateFormatter(item.sqdate),
      "endDate":this.common.dateFormatter(item.sqdate)
    };
    this.common.loading++;
    this.api.post('Admin/updateOnsiteImageStatusByUser', param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  saveVerifiedExpense() {
    console.log('adminWiseList', this.updatedExpenses);
    this.common.loading++;
    let params = {
      expenses: JSON.stringify(this.updatedExpenses),
    }
    this.api.post(`Admin/saveOnSiteExpenseByAdminNew`, params).subscribe(res => {
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
          this.onsiteImages.map((item:any)=>{
          item.status = 'default';
          });


          console.log('this.onsiteImages: ', this.onsiteImages);
          if(this.onsiteImages && this.onsiteImages.length){
            this.detailDataIndex = 0;
            // this.getExpenseWrtImage(this.onsiteImages[0]['_id']);
            // this.getExpenseWrtImage(1970);
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


//     getExpenseWrtUserDate() {
//  this.expenseList = [
// {
// description:'demo description 1',
// amount:21515151,
// },
// {
// description:'demo description 2',
// amount:21515151,
// },{
// description:'demo description 3',
// amount:21515151,
// },{
// description:'demo description 4',
// amount:21515151,
// },{
// description:'demo description 5',
// amount:21515151,
// },{
// description:'demo description 6',
// amount:21515151,
// },

// ]

//   }


  updateOnsiteExpenseStatus(){
    let param = {
      "expenseInfo": this.expenseList
    };
    this.common.loading++;
    this.api.post('Admin/updateOnsiteExpenseAmountMulti', param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
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
    this.detaildate = this.datePipe.transform(otherdate,'yyyy-MM-dd');
    console.log('this.detaildate: ', this.detaildate);
    this.selectedExpense.sqdate = this.detaildate;
    this.viewExpenseDetail(this.selectedExpense);
    return this.detaildate;
  }


  filterColumn(){
  this.dtTrigger.next();
  this.renderTable();
  }


nextdate(){
this.dateindex++;
this.dateextractor(this.dateindex)
}

prevdate(){
this.dateindex--;
this.dateextractor(this.dateindex)
}


rejectExpance(index:any,event:any){
event.stopPropagation();
this.onsiteImages[index].status = 'rejected';
}

approeExpense(index:any,event:any){
event.stopPropagation();
this.onsiteImages[index].status = 'approved';
}


  imageDialogue(selector:any,image:any){
 this.detailimageSrc = image;
 this.modalService.open(selector, {ariaLabelledBy: 'Expense Detail Image', size: 'lg' }).result.then((result) => {
    }, (reason) => {
    });

}

  // getAllvisits(){
  //   let allvisitData = from(allvisits);
  //   allvisitData.subscribe((item:any)=>{
  //   this.allVisits = item ||+ [];
  //   this.allVisits.map((item:any)=>{
  //   item.checked = false;
  //   })
  // //  this.renderTable1();
  //  })
  // }

  // getexpenses(){
  //   let expense = from(expenses);
  //   console.log('expense : ', expense);
  //   expense.subscribe((item:any)=>{
  //   this.expenseData = item;
  //   // this.renderTable();
  //   });
  // }

  selectedCategory(event:any){
  this.category = event.name;
  }

  SubmitExpenses(){
  console.log('expenseTypeVal',this.expenseTypeVal);
  let params = {
  expeenseType:this.expenseTypeVal,
  status:this.status,
  category:this.category,
  }
  console.log('params: ', params);
  }

  renderAllTables(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  backnavigate(){
    this.isDetailView = false;
    // this.dtTrigger.next();


    setTimeout(() => {
        // this.renderTable();
        // this.dtTrigger.next();
        this.dtTrigger.unsubscribe();
        this.showAdminWiseWagesList();
    }, 500);
  }

// start: map --------------------------------------------------
  getTravelDistance() {
    if (!this.selectedExpense._user_id) {
      this.common.showError('Select User')
    } else {

      const params = '&installerId=' + this.selectedExpense._user_id + '&fromDate=' + this.common.dateFormatter(this.startDate) + '&toDate=' + this.common.dateFormatter(this.endDate);
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


modifyInfo(index:number,selector:any){
 console.log('expenseList',this.expenseList[index]);
 this.listModifyvalue = this.expenseList[index].amount;
 this.modalService.open(selector, {ariaLabelledBy: 'Expense Amount Update', size: 'md',windowClass: 'update-amount-modal' }).result.then((result) => {
 this.expenseList[index].amount = this.listModifyvalue;
    }, (reason) => {
    });

    // this.listModifyvalue = '';

}

deleteinfo(index:number,selector:any){
this.expenseListitem = this.expenseList[index];
 this.modalService.open(selector, {ariaLabelledBy: 'Expense list item remove', size: 'md',windowClass: 'delete-expanse-modal' }).result.then((result) => {
 this.expenseList.splice(index, 1);
    }, (reason) => {
    });




}

updateList(index:number){

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
    console.log('time:', id, lat, lng, time);
    const params = `userId=${id}&lat=${lat}&long=${lng}&time=${time}`;
    this.api.get("Admin/getImageOnClick?" + params).subscribe((res: any) => {
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      this.imageArrayonMap = res.data || []
      console.log('images:', this.imageArrayonMap);
      this.showImages(lat, lng);
    }, err => {
      this.common.showError(err.msg)
    })
  }

  showImages(lat, lng) {
    let images = this.imageArrayonMap;
    let suffix = new Date().getTime();
    let activeSlide = 0;
    let html = `
      <div id="jrx-slider" style="height: 300px; position:relative;">
        <div id="pre-${suffix}" style="position: absolute;z-index: 999;color: #fff;font-size: 60px;top: 60px; cursor:pointer;">&lt;</div>
        <div>
          ${images.map((image, index) => {
      return `<div class="jrx-slide" style="display: ${!index ? 'block' : 'none'}; "><img src="${image._url}" style="width:100%; height: 100%;"></div>`
    }).join('')}
        </div>
        <div id="next-${suffix}" style="position: absolute;z-index: 999;color: #fff;font-size: 60px;top: 60px;right:0px; cursor:pointer;">&gt;</div>
      </div>
    `;

    this.infowindow = new google.maps.InfoWindow({
      content: html
    });

    if (images.length > 0) {
      let loc = new google.maps.LatLng(lat, lng);
      this.infowindow.setPosition(loc);
      // this.infowindow.open(this.map, this.installerMarker);
      this.infowindow.open(this.map);
    } else {
      return;
    }

    google.maps.event.addListener(this.infowindow, 'domready', () => {
      let ele = document.getElementById('jrx-slider').children[1];
      document.getElementById('pre-' + suffix).onclick = () => {
        if (activeSlide === 0) activeSlide = images.length - 1;
        else activeSlide--;

        for (let i = 0; i < images.length; i++) {
          ele.children[i]['style'].display = i === activeSlide ? 'block' : 'none';
        }
      }
      document.getElementById('next-' + suffix).onclick = () => {
        if (activeSlide === images.length - 1) activeSlide = 0;
        else activeSlide++;

        for (let i = 0; i < images.length; i++) {
          ele.children[i]['style'].display = i === activeSlide ? 'block' : 'none';
        }
      }
    });
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
