import { group } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';

@Component({
  selector: 'ngx-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss']
})
export class ExpenseTypeComponent implements OnInit {
  expenseType:any;
  status:any;
  categories:any[] = [];



  constructor() {

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

  }

}
