import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  project='';
  projects=[];
  
  projectId=null
  constructor(public common:CommonService,
    public api:ApiService) {
    this.getProject();
  }

  ngOnInit() {
  }



 

  saveProject() {
   console.log("pppppppppppppppppppp",this.project)
  if(this.project=='')
 {
     return this.common.showError("Select any project");
   }
    const params = {
       name: this.project,
    }
    console.log("params",params)
    this.common.loading++;
    this.api.post('Projects/addProject', params).subscribe(res => {
    this.common.loading--;
    this.project='';
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

    deleteProject(projectId,rowIndex){
      let params = {
        row_id:projectId
      }
      this.common.loading++;
      this.api.post('Projects/deleteProject', params)
        .subscribe(res => {
          this.common.loading--;
          console.log("res", res);
          if (res['success']) {
            this.common.showToast(res['msg']);
            this.projects.splice(rowIndex,1);
          }
        }, err => {
          this.common.loading--;
          console.log(err);
          this.common.showError();
        });
    }

}
