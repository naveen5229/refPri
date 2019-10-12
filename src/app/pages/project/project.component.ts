import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

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
    public api:ApiService,
    public modalService: NgbModal,
    ) {
    this.getProject();
    this.common.refresh = this.refresh.bind(this);

  }

  ngOnInit() {
  }

 refresh(){
  this.getProject();

 }

 

  saveProject() {
  if(this.project=='')
 {
     return this.common.showError("Select any project");
   }
   else if(this.projectId==null){
    const params = {
       name: this.project,
    }
    console.log("params",params)
    this.common.loading++;
    this.api.post('Projects/addProject', params).subscribe(res => {
    this.common.loading--;
    this.project='';
    this.getProject();
      this.common.showToast("Project Created")  
    },
    err => {
      this.common.showError();
    console.log('Error: ', err);
    });
  }
  else{
  let params={
    name: this.project,
    rowId:this.projectId
  }
 console.log("paramsssssssss",params)
  this.common.loading++;
  this.api.post('Projects/updateProject', params).subscribe(res => {
  this.common.loading--;
 
    this.common.showToast(res['msg'])
   this.getProject() 
   this.project='';
  },
  err => {
    this.common.loading--;

    this.common.showError();
  console.log('Error: ', err);
  });
}
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
      this.common.params = {
        title: 'Delete Task',
        description: 'Are you sure you want to delete this project?',
        btn2: "No",
        btn1: 'Yes'
      };
      const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        console.log('res', data);
        if (data.response) {
      let params = {
        row_id:projectId
      }
      this.common.loading++;
      this.api.post('Projects/deleteProject', params)
        .subscribe(res => {
          this.common.loading--;
          console.log("res", res);
          if (res['success']) {
            this.common.showToast("Successfully deleted existing project");
            this.projects.splice(rowIndex,1);
          }
        }, err => {
          this.common.loading--;
          console.log(err);
          this.common.showError();
        });

      }
    });
  }
  editProject(list){
    this.project= list.name
    this.projectId=list.id

  }
}