import { group } from 'console';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss']
})
export class ExpenseTypeComponent implements OnInit {
  expenseType:any;
  status:any;

  constructor() {

  }

SubmitExpenses(){
let params = {
expoenseType:this.expenseType,
status:this.status
}


}


  ngOnInit() {
  }

}
