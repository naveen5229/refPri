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
  users = {
    email: null,
    mobile: null,
    employee: null,
  }
  id=null;
  btn="Add"
  user = [];

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

  constructor(public common: CommonService,
    public api: ApiService) {
    
    this.getUser()
  }

  ngOnInit() {
  }

  saveUser() {
    if (this.users.employee == null) {
      return this.common.showError("Employee name is missing")
    } 
    else if (this.users.mobile == null) {
      return this.common.showError("Employee mobile no. is missing")
    }
    else if (this.department == '0') {
      return this.common.showError("Choose any Department")
    }
    else if(this.id!=null){
     return  this.editUser();
    }
    else if(this.id==null){
      
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
    }else{
      const params={
        emailid: this.users.email,
        mobileno: this.users.mobile,
        name: this.users.employee,
        dept_type: this.department,
        updateUserid:this.id
      }
       this.common.loading++;
       this.api.post('Users/updateuser', params)
         .subscribe(res => {
           this.common.loading--;
           console.log("res", res);
           if (res['success']) {
             this.common.showToast(res['msg']);
           }
         }, err => {
           this.common.loading--;
           console.log(err);
           this.common.showError();
         }); 

    }
  }

  getUser() {
    this.common.loading++;

    this.api.get("Users/getAllUsers").subscribe(res => {
      this.common.loading--;

      this.user = res['data'] || [];



    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  deleteUser(userId, rowIndex) {
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
          this.user.splice(rowIndex, 1);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });

  }
  editUser(user?){
    console.log("user",user);
      this.users.email=user.emailid,
   this.users.mobile=user.mobileno,
   this.users.employee=user.name,
   this.department=user.dept_type
   this.id=user.id
     this.btn="Update"
  
    
  }
}


