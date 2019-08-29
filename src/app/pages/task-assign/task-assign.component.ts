import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskAssignUserComponent } from '../../modals/task-assign-user/task-assign-user.component';

@Component({
  selector: 'ngx-task-assign',
  templateUrl: './task-assign.component.html',
  styleUrls: ['./task-assign.component.scss']
})

export class TaskAssignComponent implements OnInit {
  taskList = [];
  task ={
    module: null, 
    title: '',
    description: '',
    assigner :null,
    assigned : null,
    Date : new Date()
  }
 

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService:NgbModal,
  ){
            this.getTaks()
  }

  ngOnInit() {
  }

  // saveUser() {
  //   const params = {
  //     module_id: this.task.module,
  //     title: this.task.title,
  //     description: this.task.description,
  //     assignee_emp_id: this.task.assigner,
  //     assigned_emp_id: this.task.assigned,
  //     assign_time: this.task.Date
  //   }
  //   this.common.loading++;
  //   this.api.post('Task/addTask', params).subscribe(res => {
  //     this.common.loading--;
  //     this.getTaks()
  //     this.common.showToast(res['msg'])
  //   },
  //     err => {
  //       this.common.loading--;

  //       this.common.showError();
  //       console.log('Error: ', err);
  //     });
  // }

  getTaks() {
    this.common.loading++;

    this.api.get("Task/getAllTask").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])

      this.taskList = res['data'] || [];
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  editTask(task) {
    // this.task.module = task.module_name;
    // this.task.title = task.title
    // this.task.description = task.description
    // this.task.assigner = task.assignee_name
    // this.task.assigned = task.assigned_name4
    this.common.params=task;
    const activeModal=  this.modalService.open(TaskAssignUserComponent,{ size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
    if (data.response) {
      this.getTaks()      }  
  });
  }

  deleteTask(task) {
    console.log("task", task)
    const params = {
      taskId: task.task_id
    }
    console.log("id", params)

    this.common.loading++;
    this.api.post('Task/deleteTask', params).subscribe(res => {
      this.common.loading--;
      this.getTaks()
      this.common.showToast(res['msg'])
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }
  assignTask(){
    this.common.params=null;
  const activeModal=  this.modalService.open(TaskAssignUserComponent,{ size: 'lg', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
      if (data.response) {
        this.getTaks()      }  
    });
  }
}
