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
  selector: 'ngx-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss']
})
export class ExpenseTypeComponent implements OnInit {
 startDate = new Date();
 endDate = new Date();
 category:any;
 allUsers:any[] = [];
 allVisits:any[] = [];
 expensdetail:any;
 expenseTypeVal:any;
 status:any;
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


ngAfterViewInit() {
    this.dtTrigger.next();
    this.getexpenses();

  }

 ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
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

selectedUser(event:any){

}



  ngOnInit() {
  this.getCategoris();

  }

}
