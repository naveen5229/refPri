import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  //project=[];
  projects = [{
    project: 'partner',

  },
  {
    project: 'customer-dashboard',

  },
  {
    project: 'dashboard-admin',

  },
  {
    project: 'Walle8',

  }
  ]
  constructor() {
    this.getProject();
  }

  ngOnInit() {
  }


  saveProject() {
    // const params = {
    //   project: this.project,

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

  getProject() {
    // this.api.get("").subscribe(res =>{
    //   this.project[]=res['data'] || [];
    //   this.common.showToast(res['data'][0].y_msg)
    // 
    // err => {
    //   this.common.showError();
    // console.log('Error: ', err);
    // });
    //   })
    // }

  }

}
