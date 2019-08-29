import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit {
   modules={
    projectId:null,
    name:null
   }
  projectName=[];
  // modules = [{
  //   project: 'walle8',
  //   name: 'goutam'

  // },
  // {
  //   project: 'customer-dashboard',
  //   name: 'lalit'

  // },
  // {
  //   project: 'dashboard-admin',
  //   name: 'vishal'
  // },
  // {
  //   project: 'Walle8',
  //   name: 'rithik'

  // }
  // ]
  constructor(public api:ApiService,
    public common:CommonService) {
    this.getModule();
    this.projectList();

  }

  ngOnInit() {
  }

  projectList(){
    this.common.loading++;

    this.api.get('Suggestion/getProjectList')
    .subscribe(res => {
      this.common.loading--;
      console.log("items",res);
      this.projectName = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  changeRefernceType(type) {
    console.log("type",type)
    this.modules.projectId=type.id
  }

  saveModule(){
    const params = {
      project_id: this.modules.projectId,
     name:this.modules.name

    }
    this.common.loading++;
    this.api.post('Modules/addModules', params).subscribe(res => {
    this.common.loading--;
      this.common.showToast(res['msg'])
     this.getModule() 
    },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
  }

  getModule() {
    this.api.get("Modules/getAllModules").subscribe(res =>{
  
      this.modules=res['data'] || [];
    },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
    }

  
}
