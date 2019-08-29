import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  project=null;
  projects=[];
  // projects = [{
  //   project: 'partner',

  // },
  // {
  //   project: 'customer-dashboard',

  // },
  // {
  //   project: 'dashboard-admin',

  // },
  // {
  //   project: 'Walle8',

  // }
  // ]
  projectName=[];
  projectId=null
  constructor(public common:CommonService,
    public api:ApiService) {
    this.getProject();
  }

  ngOnInit() {
  }



 

  saveProject() {
    const params = {
      name: this.project,
    }
    this.common.loading++;
    this.api.post('Projects/addProject', params).subscribe(res => {
    this.common.loading--;
    this.getProject();
      this.common.showToast(res['msg'])  
    },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
  }


  getProject(){
    this.common.loading++;

    this.api.get("Projects/getAllProject").subscribe(res =>{
      this.common.loading--;

      this.projects=res['data'] || [];
    },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
    }
  

}
