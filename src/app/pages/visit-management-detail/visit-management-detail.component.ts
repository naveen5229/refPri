import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from './../../Service/Component/data.service';
import { ApiService } from './../../Service/Api/api.service';
import { MapService } from './../../Service/map/map.service';
import { allUsers, } from './../employee-monitoring/data';
import { CommonService } from './../../Service/common/common.service';
import { expenses, allvisits, expenseDetail } from '../visit-management/data';
import { group } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { from, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import * as _ from 'lodash';

@Component({
  selector: 'ngx-visit-management-detail',
  templateUrl: './visit-management-detail.component.html',
  styleUrls: ['./visit-management-detail.component.scss']
})
export class VisitManagementDetailComponent implements OnInit {

 category:any;
 allUsers:any[] = [];
 allVisits:any[] = [];
 ExpenseDate:any;
 userdetail:any;
 expenseTypeVal:any;
 status:any;
 detailImageZoom:boolean = false;
 expenseImage:string = '';
 map: any;
 mapdata:any[] = [];
 userdetailIndex:number = -1;
 infowindow = new google.maps.InfoWindow();
  installerMarker:any;
  wayPoints = null;
  multiMarkerInfoWindow: any;
  adminList:any[] = [];
  poly:any;
  start_end_mark = [];

  lat:any[] = [];
  lng:any[] = [];

alluserselect:boolean = false;
detailimageSrc:any;
expenseIndex:number = -1;
detailDataIndex:number = -1;
// map variables
  markerInfoWindow: any;
  markers = [];
  latlng:any = [];

@Input() expensdetail:any;

 @ViewChild(DataTableDirective, { static: false })


  dtElement: any;
  dtTrigger: any = new Subject();
  categories:any[] = [];
  expenseData:any[] = [];
  dtOptions: any = {
    pagingType: 'full_numbers',
    pageLength: 5,
    lengthMenu: [5, 10, 25],
    processing: true,
  }



  dtElement1: any;
  dtTrigger1: any = new Subject();
  dtOptions1: any = {
    pagingType: 'full_numbers',
    pageLength: 5,
    lengthMenu: [5, 10, 25],
    processing: true,
     ajax: this.getexpenses(),
   }



 SearchFilter = [
 'Type','category','Status'
 ]

  startTime:any;
  endTime:any;


  constructor(public common:CommonService, public mapService:MapService,public api:ApiService, public data:DataService,private modalService: NgbModal) {

  }



filterColumn(){
this.dtTrigger.next();
this.renderTable();
}


getmapdata(){
this.expensdetail.detail.map((item:any)=>{
 this.mapdata.push({
//  User:this.allVisits[this.userdetailIndex].userName,
 place:item.location.place,
 time: item.location.Time,
 lat:item.locationMark.lat,
 lng:item.locationMark.lng,
});
});



 this.mapdata.map(item=>{
this.latlng.push([
item.lat,
item.lng
]);

});

}


imageDialogue(selector:any,image:any){
 this.detailimageSrc = image;
 this.modalService.open(selector, {ariaLabelledBy: 'Expense Detail Image', size: 'lg' }).result.then((result) => {
    }, (reason) => {
    });

}



//  mapdata code

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
      // ele.onclick = () => this.getImages(this.admin.id, point.lat, point.long, point.time)
      // ele.onclick = () => this.getImages(47, 19.2530844, 73.0154552, '2020-12-01T14:46:10.111754')
      div.appendChild(ele);
    });
    return div;
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



  plotMarker(values) {
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
          // this.getImages(this.admin.id, lat, lng, group[0].time);
        }
      });

      this.markers.push(marker);
    })
  }



getCategoris(){
let catrgories = from ([[
{name:'Car'},
{name:'Bus'},
{name:'Hotel'},
{name:'Bike'},
{name:'Truck'},
{name:'Travel'},
]])

catrgories.subscribe((item:any)=>{
this.categories = item;
console.log('this.categories: ', this.categories);

})


}


rendermap(){
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

 getAdmin() {
    this.adminList = [];
    this.common.loading++;
    this.api.get('Admin/getAllAdmin.json')
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.adminList = res['data'] || [];
        console.log(this.adminList);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }




getAllvisits(){
  let allvisitData = from(allvisits);
  allvisitData.subscribe((item:any)=>{
  this.allVisits = item ||+ [];
  this.allVisits.map((item:any)=>{
  item.checked = false;
  })

//  this.renderTable1();

 })

}

getexpenses(){
let expense = from(expenses);
console.log('expense : ', expense);
expense.subscribe((item:any)=>{
this.expenseData = item;
// this.renderTable();
},
);




}

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

selectedUser(event:any){

}


getVisitManagement(){
this.allUsers = allUsers;
}



selectAllUser(event:any){
this.alluserselect  = !this.alluserselect;
event.stopPropagation();
this.allVisits.map((item:any)=>{
item.checked = this.alluserselect;
})
}



selectUser(index:number){
this.allVisits[index].checked = true;
setTimeout(() => {
this.alluserselect =  this.allVisits.every((item:any)=>{
return item.checked;
});
}, 100);
console.log('this.allVisits',this.allVisits);

}

approveExpense(){

}


rejectexpense(){

}




backnavigate(){
this.data.visitDetailView = false;
this.data.visitlistView = true;
}

expenseImageHandler(index:number){
this.expenseIndex = index;
}

expenselistHandler(index:number){
this.expenseIndex = index;
}

expenseImageView(index:number){
this.expenseImage = this.expensdetail.expense[index].image;
}


detailImagehandler(index:number){
this.detailDataIndex = index;
this.detailImageZoom = true;
}

detaillisthandler(index:any){
this.detailDataIndex = index;
this.detailImageZoom = true;

}

detailImageZoomHandler(){
this.detailImageZoom = false;
}



renderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
      // dtInstance.columns().every(function () {
      //   const that = this;
      //   $('input', this.footer()).on('keyup change', function () {
      //     if (that.search() !== this['value']) {
      //       that
      //         .search(this['value'])
      //         .draw();
      //     }
      //   });
      // });

    });

  }

  ngOnInit() {
  this.getCategoris();
  this.getexpenses();
  this.getAllvisits();
  this.getmapdata()


  }



  ngAfterViewInit() {
    this.dtTrigger.next();
    this.getexpenses();
    this.dtTrigger1.next();
    this.getAllvisits();
    // this.rendermap();




  }

 ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
     this.dtTrigger1.unsubscribe();
  }





}




// @Component({
// selector: 'visit-management-detail-image',
//   template: `
// <div mat-dialog-content>
// <div class="image-container">
// <img [src]="detailImage" class="img-fluid">
// </div>
// </div>
// <div mat-dialog-actions>
//   <button mat-button mat-dialog-close cdkFocusInitial> close </button>
// </div>

//   `,
//   styleUrls: ['./visit-management-detail.component.scss']
// })
// export class VisitDetailImageModal {
//   @Input() detailImage:any;
//   constructor(){

//  }


// }
