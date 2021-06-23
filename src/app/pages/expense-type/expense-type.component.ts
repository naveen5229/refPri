import { expenses } from './data';
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
  @ViewChild(DataTableDirective, { static: false })
  expenseType:any;
  status:any;
  dtElement: any;
  dtTrigger: any = new Subject();
  categories:any[] = [];
  expenseData:any[] = [];
  dtOptions: any = {
    pagingType: 'full_numbers',
    pageLength: 5,
    lengthMenu: [5, 10, 25],
    processing: true
  }

  startTime:any;
  endTime:any;

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
    });
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

  constructor() {

  }



 setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    let columns = [];
    this.expenseData.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }


  formatTitle(strval:any) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.expenseData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
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
let start = Date.now();

let startDate:any,enddate:any;

let startdate:any = new Date();
console.time();

let expense = from(expenses);
expense.subscribe((item:any)=>{
this.expenseData = item;
this.renderTable();
enddate = new Date();
console.timeEnd();
},
);


// this.endTime = enddate - startdate;
// console.log("Page load took " + (Date.now() - start) + "milliseconds");

}

selectedCategory(event:any){


}



SubmitExpenses(){
let params = {
expoenseType:this.expenseType,
status:this.status
}

}





  ngOnInit() {
  this.getCategoris();
  this.getexpenses();
  this.setTable();

  }

}
