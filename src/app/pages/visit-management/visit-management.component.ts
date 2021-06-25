import { MapService } from './../../Service/map/map.service';
// import { allUsers, } from './../employee-monitoring/data';
import { CommonService } from './../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { expenses, expenseDetail } from './data';
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
 allUsers:any[] = [{
  "id": null,
  "name": "All",
  "mobileno": null,
  "department_name": null
}];
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


alluserselect:boolean = false;

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
  
  updatedExpenses = [];
  expenseSearch = {
    admin : { id: null, name: 'All' }
  }

  constructor(public common:CommonService, public mapService:MapService, public api: ApiService) {
    this.common.refresh = this.refreshPage.bind(this);
    this.getAllAdmin();
  }

ngAfterViewInit() {
    this.dtTrigger.next();
    this.getexpenses();
    this.dtTrigger1.next();
    // this.getAllvisits();
  }

 ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
     this.dtTrigger1.unsubscribe();
  }

  refreshPage(){
    this.getAllAdmin();
    this.listView = true;
    this.allVisits = [];
    this.allUsers = [{
      "id": null,
      "name": "All",
      "mobileno": null,
      "department_name": null
    }];
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
          this.updateExpenseArray();
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

  onsiteImages = [];
  getOnSiteImagesByUser() {
    let adminId = this.selectedExpense._user_id;
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
    this.api.get('Admin/getOnSiteImagesByUser?' + param)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.onsiteImages = res['data'] || [];
        } else {
          this.common.showError(res['msg']);
        }
      }, (err) => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  expenseList = [];
  getExpenseWrtImage(imageId) {
    if (!imageId) {
      this.common.showError('Invalid request');
      return;
    }
    let param = `imageId=${imageId}`;
    this.common.loading++;
    this.allVisits = [];
    this.api.get('Admin/getExpenseWrtImage?' + param)
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

getexpenses(){
  let expense = from(expenses);
  console.log('expense : ', expense);
  expense.subscribe((item:any)=>{
  this.expenseData = item;
  // this.renderTable();
  });
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

// getVisitManagement(){
//   this.allUsers = allUsers;
// }

selectedExpense;
viewExpenseDetail(item){
  let expensedata = from(expenseDetail);
  // expensedata.subscribe((item:any)=>{
  this.expensdetail = item;
  // })
  this.selectedExpense = item;
  console.log('this.expensdetail',this.expensdetail);
  this.detailView = true;
  this.listView = false;

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
  this.allVisits[index].checked = true;
  if(this.allVisits && this.allVisits.find(x=>!x.checked)){
    this.alluserselect = false;
  }else{
    this.alluserselect = (!this.allVisits) ? false : true;
  }
  console.log('this.allVisits',this.allVisits);
}

updateOnsiteImageStatusByUser(status,userId){
  if (!userId) {
    this.common.showError('Please select User');
    return false;
  }
  if (this.startDate > this.endDate) {
    this.common.showError('End Date should be grater than Start Date');
    return false;
  }
  let param = `userId=${userId}&status=${status}&startDate=${this.common.dateFormatter1(this.startDate)}&endDate=${this.common.dateFormatter1(this.endDate)}`;
  this.common.loading++;
  this.api.get('Admin/updateOnsiteImageStatusByUser?' + param)
    .subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.allVisits = res['data'] || [];
        this.updateExpenseArray();
      } else {
        this.common.showError(res['msg']);
      }
    }, (err) => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
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
  // this.getAllvisits();

  }
}
