import { Component, OnInit, NgModule } from '@angular/core';
import { NbCardModule } from '@nebular/theme';
import { getMaxListeners } from 'cluster';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { Pipe, PipeTransform } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
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
    mobile: '',
    employee: null,
  }
  id=null;
  btn="Add"
  user = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
    ) { 
    this.getUser();
    this.common.refresh = this.refresh.bind(this);

  }

  ngOnInit() {
  }

  refresh() {
    this.getUser();

  }
  saveUser() {
    if (this.users.employee == null) {
      return this.common.showError("Employee name is missing")
    } 
    else if (this.users.mobile == '' ) {
      return this.common.showError("Employee mobile no. is missing")
    }
    else if(this.users.mobile.length!=10 ){
      console.log("inner console")
      return this.common.showError("Employee mobile no. is incorrect")

    } 
    
    else if (this.department == '0') {
      return this.common.showError("Choose any Department")
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
      this. users = {
        email: null,
        mobile: '',
        employee: null,
      };
      this.department = '0';
      if(res['success']==true){
      this.getUser()
      this.common.showToast("User Created")
      }else{
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
    }
    else{
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
           this.common.showToast(res['msg']);
           console.log("res", res);
           if (res['success']) {
            this. users = {
              email: null,
              mobile: '',
              employee: null,
            };
            this.id=null;

            this.department = '0';
            this.getUser();

           }
         }, err => {
           this.common.loading--;
           console.log(err);
           this.common.showError();
         }); 

    }
  }

  resetUser(){
    this. users = {
      email: null,
      mobile: '',
      employee: null,
    };
    this.id=null;

    this.department = '0';
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
    this.common.params = {
      title: 'Delete Task',
      description: 'Are you sure you want to delete this user?',
      btn2: "No",
      btn1: 'Yes'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {
    let params = {
      user_id: userId
    }
    this.common.loading++;
    this.api.post('Users/deleteUser', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res);
        if (res['success']) {
          this.common.showToast(" Sucessfully Delete the existing user");
          this.user.splice(rowIndex, 1);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });

    }
  });
}
  

  editUser(user){
    console.log("user",user);
    this.users.email=user.emailid,
   this.users.mobile=user.mobileno.toString(),
   this.users.employee=user.name,
   this.department=user.dept_type
   this.id=user.id
  
    
  }
}


