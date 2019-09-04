import { Component, OnInit, NgModule } from '@angular/core';
import { NbCardModule } from '@nebular/theme';
import { getMaxListeners } from 'cluster';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'capitalizeFirst'
})

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
    },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
  }

  getUser() {
    this.common.loading++;

    this.api.get("Users/getAllUsers").subscribe(res =>{
      this.common.loading--;
    
     this.user=res['data'] || [];
    

 
        },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
    }

    deleteUser(userId,rowIndex){
      let params = {
        user_id: userId
      }
      this.common.loading++;
      this.api.post('Users/deleteUser', params)
        .subscribe(res => {
          this.common.loading--;
          console.log("res", res);
          if (res['success']) {
            this.common.showToast(res['msg']);
            this.user.splice(rowIndex,1);
          }
        }, err => {
          this.common.loading--;
          console.log(err);
          this.common.showError();
        });

    }

  }
