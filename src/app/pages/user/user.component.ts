import { Component, OnInit, NgModule } from '@angular/core';
import { NbCardModule } from '@nebular/theme';
import { getMaxListeners } from 'cluster';

@Component({
  selector: 'ngx-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  department = 0;
  // users={
  // email :null,
  // mobile : null,
  // employee: null,
  // department= 0
  // }
  users = [{
    employee: 'Rithik',
    mobile: 9414586325,
    email: 'k@getMaxListeners.com',
    department: 'IT'
  },
  {
    employee: 'Pratik',
    mobile: 9414586425,
    email: 'm@gmail.com',
    department: 'Management'
  },
  {
    employee: 'Vishal',
    mobile: 9414586325,
    email: 't@gmail.com',
    department: 'Support'
  },
  {
    employee: 'Goutam',
    mobile: 9414576335,
    email: 'k@gmail.com',
    department: 'HR'
  }
  ]
  constructor() {
    this.getUser()
  }

  ngOnInit() {
  }

  saveUser() {
    // const params = {
    //   email: this.email,
    //   mobile: this.mobile,
    //   employee: this.employee,
    //   department: this.department
    // }
    // this.common.loading++;
    // this.api.post('', params).subscribe(res => {
    // this.common.loading--;
    // if (res['data'][0].y_id > 0) {
    //   this.common.showToast(res['data'][0].y_msg)
    // }
    // err => {
    //   this.common.showError();
    // console.log('Error: ', err);
    // });
  }

  getUser() {
    // this.api.get("").subscribe(res =>{
    //   this.user[]=res['data'] || [];
    //   this.common.showToast(res['data'][0].y_msg);
    // err => {
    //   this.common.showError();
    // console.log('Error: ', err);
    // });
    //   })
    // }

  }
}
