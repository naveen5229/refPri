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
    name:null,
    projectName:''
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

  // projectList(){
  //   this.api.get("Suggestion/getProjectList")
  //   .subscribe(
  //     res => {
  //       this.projectName = res['data']
  //       console.log("autosugg", this.projectName);

  //     }
  //   )
  // }

  // getList(event) {
  //   this.modules.projectId = event.target.value;
  //   console.log("event", this.modules.projectId);
  // }

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
    if(this.modules.projectId==null){
     return  this.common.showError("Project name is missing")
    }
    else if(this.modules.name == null){
     return  this.common.showError("Module name is missing")
    }
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

    editModule(modulesData){
      this.modules.projectName=modulesData.project_name

      this.modules.projectId=modulesData.project_id
      this.modules.name=modulesData.name
    }

    deleteModule(userId, rowIndex) {
      let params = {
        module_id: userId
      }
      console.log("user",params)
      this.common.loading++;
      this.api.post('Modules/deleteModule', params)
        .subscribe(res => {
          this.common.loading--;
          console.log("res", res);
          if (res['success']) {
            this.common.showToast(res['msg']);
            this.getModule()
          //  this.module.splice(rowIndex, 1);
          }
        }, err => {
          this.common.loading--;
          console.log(err);
          this.common.showError();
        });
  
    }
}
