import { MapService } from './../../Service/map/map.service';
import { allUsers, } from './../employee-monitoring/data';
import { CommonService } from './../../Service/common/common.service';
import { expenses, allvisits, expenseDetail } from './data';
import { group } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit,ViewChild } from '@angular/core';
import { from, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
@Component({
  selector: 'ngx-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss']
})
export class ExpenseTypeComponent implements OnInit {
 startDate = new Date();
 endDate = new Date();
 category:any = 'accommodation';
 allUsers:any[] = [];
 allVisits:any[] = [];
 expensdetail:any;
 expenseType:any;
 typestatus:any;
 id:any;
 @ViewChild(DataTableDirective, { static: false })
  dtElement: any;
  dtTrigger: any = new Subject();
  categories:any[] = [];
  expenseTypeList:any[] = [];
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
  title = "Add Expense Type";
  btn = "Save";

ngAfterViewInit() {
    this.dtTrigger.next();
    this.getExpenseTypeList();

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

  constructor(public common:CommonService, public mapService:MapService,
    public api: ApiService,
    public modalService: NgbModal) {

  }



filterColumn(){
this.dtTrigger.next();
this.renderTable();
}



// getCategoris(){
// let catrgories = from ([[
// {name:'Car'},
// {name:'Bus'},
// {name:'Hotel'},
// {name:'Bike'},
// {name:'Truck'},
// {name:'Travel'},
// ]])

// catrgories.subscribe((item:any)=>{
// this.categories = item;
// console.log('this.categories: ', this.categories);

// })


// }



getExpenseTypeList(){
  this.expenseTypeList = [];

  this.common.loading++;
  this.api.get('Expense/getExpenseTypeList.json')
    .subscribe(res => {
      this.common.loading--;
      if (res['code'] !=1) { this.common.showError(res['msg']); return false; };
      this.expenseTypeList = res['data'] || [];
      this.renderTable();
      console.log(this.expenseTypeList);
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
}

// selectedCategory(event:any){
// this.category = event.name;
// }



SubmitExpenses(){
  let params: any = {
    description: this.expenseType,
    expenseStatus: this.typestatus,
    expenseCategory: this.category,
    id: this.id,
  };
  console.log(params);
  this.common.loading++;
  this.api.post('Expense/SubmitExpenseType.json', params).subscribe(res => {
    this.common.loading--;
    if (res['code'] == 1) {
      this.common.showToast(res['msg']);
      this.getExpenseTypeList();
      this.resetType();
    } else {
      this.common.showError(res['msg']);
    }
  }, err => {
    this.common.loading--;
    this.common.showError();
    console.log("error:", err);
  }

  );

}

editExpenseType(item?:any) {
  this.resetType();
  console.log('item',item);
  this.id = item.id;
  this.expenseType = item.description;
    this.typestatus = (item.expense_status == 1)?"Active":"Inactive";
    this.category = item.expenses_category;
    this.title = "Update Expense Type";
    this.btn = 'Update';

}

 viewDetails(row?: any) {
   this.common.params = { details: [row], title: 'info' }
  console.log('row',row);
//   const activeModal = this.modalService.open(ViewDetailsComponent, { size: 'lg' });

 }

selectedUser(event:any){

}

resetType(){
  this.category = 'accommodation';
  this.expenseType = '';
  this.typestatus = null;
  this.id = null;
  this.btn = 'Save';
  this.title = "Add Expense Type";
}

deleteExpenseType(item?: any) {
  this.common.loading++;
  let params: any = {
    id: item.id,
  }

  this.api.post('Expense/deleteExpenseType.json', params)
    .subscribe((res: any) => {
      this.common.loading--;
      this.getExpenseTypeList();
      this.resetType();
      console.log('id',this.id);
    }, (err: any) => {
      console.error('Error: ', err);
      this.common.loading--;
    });
}

  ngOnInit() {
  // this.getCategoris();
  this.getExpenseTypeList();
  this.dtTrigger.next();
  }

}
