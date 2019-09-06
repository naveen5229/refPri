import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-task-assign-user',
  templateUrl: './task-assign-user.component.html',
  styleUrls: ['./task-assign-user.component.scss']
})
export class TaskAssignUserComponent implements OnInit {
  task = {
    mName:'',
    module: null,
    title: '',
    description: '',
    assigner: null,
    assignerId:null,
    assigned: null,
    assignedId:null,
    Date: new Date()
  }
  moduleName=[];
  assignedLists =[];
  assigneeLists =[]

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService) { 
      console.log("task list",this.common.params)
      if(this.common.params != null){
        this.task.mName=this.common.params.ModuleName
       this.task.module=this.common.params.module_id,
       this.task.title=this.common.params.title,
       this.task.description=this.common.params.Description,
       this.task.assigner=this.common.params.AssigneeName,
       this.task.assigned=this.common.params.AssignerName
       this.task.assignedId=this.common.params.
       this.task.assignerId
    }
  
    this.getModuleList();
    this.assignerList();
    this.assignedList()
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({response:response});
  }

  getModuleList(){
    this.common.loading++;

    this.api.get('Suggestion/getModulesList')
    .subscribe(res => {
      this.common.loading--;
      console.log("list",res);
      this.moduleName = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  changeRefernceType(event) {
    console.log("item", event)
    this.task.module = event.id;
   this.task.mName=event.name
  }

  assignerList(){
    this.common.loading++;

    this.api.get('Suggestion/getEmployeeList')
    .subscribe(res => {
      this.common.loading--;
      console.log("list",res);
      this.assigneeLists = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  changeAssined(event) {
    console.log("item", event)
    this.task.assigned = event.name;
    this.task.assignedId=event.id;
  }

 


  assignedList(){
    this.common.loading++;

    this.api.get('Suggestion/getEmployeeList')
    .subscribe(res => {
      this.common.loading--;
      console.log("list",res);
      this.assignedLists = res['data'];
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  changeAssignee(event) {
    console.log("item1", event)
    this.task.assigner = event.name;
    this.task.assignerId=event.id

  }

 saveUser() {
  console.log("id of",this.task.assignerId)
  console.log("id of 4",this.task.assignedId)
  console.log("id of 4",this.task.module)


    if(this.task.module== null){
      return this.common.showError("Module name is missing")
    }
    else if(this.task.assignerId==null){
      return this.common.showError("Assigner name is missing")

    }
    else if(this.task.assignedId==null){
      return this.common.showError("Assigned name is missing")

    }
    const params = {
      moduleId: this.task.module,
      title: this.task.title,
      description: this.task.description,
      assigneeEmpId: this.task.assignerId,
      assignedEmpId: this.task.assignedId,
      assignTime: this.task.Date,
      status:0
    }
    this.common.loading++;
    this.api.post('Task/addTask', params).subscribe(res => {
      this.common.loading--;
      this.common.showToast(res['msg'])
      this.closeModal(true);
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
}
