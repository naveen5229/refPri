import { Router } from '@angular/router';
import { DataService } from './../../Service/Component/data.service';
import { ApiService } from './../../Service/Api/api.service';
import { MapService } from './../../Service/map/map.service';
import { allUsers, } from './../employee-monitoring/data';
import { CommonService } from './../../Service/common/common.service';
import { expenses, allvisits, expenseDetail } from './data';
import { group } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Injector, NgModuleFactoryLoader, OnInit,SimpleChanges,ViewChild, ViewContainerRef } from '@angular/core';
import { from, Subject, Subscription } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import * as _ from 'lodash';

interface report {
 User:string,
 place:string,
 time: string,
 lat:string,
 lng:string,
};

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
 mapdata:any[] = [];
 userdetailIndex:number = -1;
  installerMarker:any;
  wayPoints = null;
  adminList:any[] = [];
  poly:any;

alluserselect:boolean = false;
expenseIndex:number = -1;
detailDataIndex:number = -1;
clickEventsubscription:Subscription;
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

ngAfterViewInit() {
    this.dtTrigger.next();
    this.getAllvisits();
  }

 ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
     this.dtTrigger1.unsubscribe();
  }



   renderTable() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
    });

  }


  constructor(public common:CommonService,
    public mapService:MapService,
    public api:ApiService,
    public data:DataService
  ) {
  this.data.visitlistView = true;
  this.clickEventsubscription =   this.data.getClickEvent().subscribe(()=>{
  // this.getAllvisits();
  // this.renderAllTables();
  // this.renderTable();
})

  }



filterColumn(){
this.dtTrigger.next();
this.renderTable();
}


getmapdata(){
this.expensdetail.detail.map((item:any)=>{
 this.mapdata.push({
 User:this.allVisits[this.userdetailIndex].userName,
 place:item.location.place,
 time: item.location.Time,
 lat:item.locationMark.lat,
 lng:item.locationMark.lng,
});

});


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


renderAllTables(): void {
this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
dtInstance.destroy();
this.dtTrigger.next();
  });
}




getAllvisits(){
  let allvisitData = from(allvisits);
  allvisitData.subscribe((item:any)=>{
  this.allVisits = item ||+ [];
  // this.renderTable();
  this.allVisits.map((item:any)=>{
  item.checked = false;
  })

 console.log('visit data',this.allVisits);



 })

}

getexpenses(){
let expense = from(expenses);
console.log('expense : ', expense);
expense.subscribe((item:any)=>{
this.expenseData = item;
// this.renderTable();
},
)
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
this.userdetailIndex = index;
this.data.visitlistView = false;
this.data.visitDetailView = true;
})

}


// loadDetailView(){
//  this.loader.load('/pages/visit-management')
//       .then(factory => {
//         const module = factory.create(this.injector);
//         var entryComponentType = module.injector.get('LAZY_ENTRY_COMPONENT')
//         var componentFactory = module.componentFactoryResolver.resolveComponentFactory(entryComponentType);
//         this.vcr.createComponent(componentFactory);
//       })
// }

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
}, 10);
console.log('this.allVisits',this.allVisits);

}

approveExpense(){

}


rejectexpense(){

}



ngOnChanges(changes: SimpleChanges): void {
console.log('SimpleChanges: ', changes);
}



  ngOnInit() {
  this.getCategoris();
  this.getexpenses();
  this.getAllvisits();


  }
}
