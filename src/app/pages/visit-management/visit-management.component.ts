import { MapService } from './../../Service/map/map.service';
import { allUsers, } from './../employee-monitoring/data';
import { CommonService } from './../../Service/common/common.service';
import { expenses, allvisits, expenseDetail } from './data';
import { group } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit,ViewChild } from '@angular/core';
import { from, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'ngx-visit-management',
  templateUrl: './visit-management.component.html',
  styleUrls: ['./visit-management.component.scss']
})
export class VisitManagementComponent implements OnInit {
 startDate = new Date();
 endDate = new Date();
 category:any;
 allUsers:any[] = [];
 allVisits:any[] = [];
 listView:boolean = true;
 detailView:boolean = false;
 ExpenseDate:any;
 userdetail:any;
 expensdetail:any;
 expenseTypeVal:any;
 status:any;
 detailImageZoom:boolean = false;
 expenseImage:string = '';
 map: any;

expenseIndex:number = -1;
detailDataIndex:number = -1;
// map variables
  markerInfoWindow: any;
  markers = [];


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
    //  ajax: this.getexpenses(),
    //  columns: [{
    //    title: 'Type',
    //     data: 'type'
    //   }, {
    //     title: 'Category',
    //     data: 'category'
    //   }, {
    //     title: 'Status',
    //     data: 'Status'
    //   }],
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

ngAfterViewInit() {
    this.dtTrigger.next();
    this.getexpenses();
    this.dtTrigger1.next();
    this.getAllvisits();

  }

 ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
     this.dtTrigger1.unsubscribe();
  }


 renderTable1() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger1.next();
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




  constructor(public common:CommonService, public mapService:MapService) {

  }



filterColumn(){
this.dtTrigger.next();
this.renderTable();
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



getAllvisits(){
  let allvisitData = from(allvisits);
  allvisitData.subscribe((item:any)=>{
 this.allVisits = item;
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


Userdetail(index:number){
let expensedata = from(expenseDetail);
expensedata.subscribe((item:any)=>{
this.expensdetail = item[index];
})

console.log('this.expensdetail',this.expensdetail);

this.detailView = true;
this.listView = false;

}


approveExpense(){

}


rejectexpense(){

}

renderAllTables(): void {
this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
// Destroy the table first
dtInstance.destroy();
// Call the dtTrigger to rerender again
this.dtTrigger.next();
  });}


backnavigate(){
this.listView = true;
this.detailView = false;
setTimeout(() => {
  // window.scrollBy(0, 500);
  // this.renderAllTables();
}, 200);

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

}

detailImageZoomHandler(){
this.detailImageZoom = false;
}


  setMarkers() {
    if (!this.markerInfoWindow)
      this.markerInfoWindow = new google.maps.InfoWindow({ content: '' });

    this.markers.map(marker => marker.setMap(null));
    let reports = this.expensdetail.filter(report => report.lat);
    this.markers = this.mapService.createMarkers(reports, false, false)
      .map((marker, index) => {
        let report = reports[index];
        console.log('report: ', report);
        marker.setTitle(report.name);
        this.setMarkerEvents(marker, report);
        return { id: report.userId, marker: marker };
      });


  }


  setMarkerEvents(marker, report) {
    marker.addListener('click', () => {
       this.markerInfoWindow.open(this.map, marker);
    });
  }


  ngOnInit() {
  this.getCategoris();
  this.getexpenses();
  this.getAllvisits();

  }
}
