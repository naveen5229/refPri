import { Component, OnInit, NgModule } from '@angular/core';
import { NbCardModule } from '@nebular/theme';
import { getMaxListeners } from 'cluster';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  department = '0';
  users={
  email :null,
  mobile : null,
  employee: null,
  }
  user=[];
  
  // users = [{
  //   employee: 'Rithik',
  //   mobile: 9414586325,
  //   email: 'k@get.com',
  //   department: 'IT'
  // },
  // {
  //   employee: 'Pratik',
  //   mobile: 9414586425,
  //   email: 'm@gmail.com',
  //   department: 'Management'
  // },
  // {
  //   employee: 'Vishal',
  //   mobile: 9414586325,
  //   email: 't@gmail.com',
  //   department: 'Support'
  // },
  // {
  //   employee: 'Goutam',
  //   mobile: 9414576335,
  //   email: 'k@gmail.com',
  //   department: 'HR'
  // }
  // ]
  
  constructor(public common:CommonService,
    public api:ApiService) {
    this.getUser()
    }

  ngOnInit() {
  }

  saveUser() {
    const params = {
      emailid: this.users.email,
      mobileno: this.users.mobile,
      name: this.users.employee,
      dept_type: this.department
    }
    this.common.loading++;
    this.api.post('Users/addUser', params).subscribe(res => {
    this.common.loading--;
    this.getUser()
      this.common.showToast(res['msg'])
    
    err => {
      this.common.showError();
    console.log('Error: ', err);
    }});
  }

  getUser() {
    this.api.get("Users/getAllUsers").subscribe(res =>{
      if(res['data'].dept_type  == '1' || 1 ){
        res['data'].dept_type="IT"
      }
      else if(res['data'].dept_type == '2' || 2){
        res['data'].dept_type="Support";
      }
        else if(res['data'].dept_type == '3' || 3){
          res['data'].dept_type="Account"
        }
          else if(res['data'].dept_type == '4' || 4){
            res['data'].dept_type="Hr"
          }
    
      this.user=res['data'] || [];
    
      this.common.showToast(res['msg']);
    err => {
      this.common.showError();
    console.log('Error: ', err);
    }});
    }

  }
