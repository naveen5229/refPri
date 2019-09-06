import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskAssignUserComponent } from '../../modals/task-assign-user/task-assign-user.component';
import { TaskStatusCheckComponent } from '../../modals/task-status-check/task-status-check.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-task-assign',
  templateUrl: './task-assign.component.html',
  styleUrls: ['./task-assign.component.scss']
})

export class TaskAssignComponent implements OnInit {
  taskList = [];
  task = {
    module: null,
    title: '',
    description: '',
    assigner: null,
    assigned: null,
    Date: new Date()
  }
  review = [];
  activeTab = 'Assign Task';
  complateTask = [];
  assigned = [];
  changeReview = [];
  taskStatus = "a";
  pendingReview = [];
  remark = null;

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
  ) {
    this.getTask();
    // this.getCompleteTask();
    // this.assignByMe()
  }

  ngOnInit() {
  }

  saveUser() {
    const params = {
      module_id: this.task.module,
      title: this.task.title,
      description: this.task.description,
      assignee_emp_id: this.task.assigner,
      assigned_emp_id: this.task.assigned,
      assign_time: this.task.Date
    }
    this.common.loading++;
    this.api.post('Task/addTask', params).subscribe(res => {
      this.common.loading--;
      this.getTask()
      this.common.showToast(res['msg'])
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getTask() {
    this.common.loading++;

    this.api.get("Task/getTaskWrtStatus").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])

      this.taskList = res['data']["AssignForMe"] || [];
      this.assigned = res['data']["AssignByMe"] || [];
      this.complateTask = res['data']["CompleteTask"] || [];
      this.review = res['data']["WaitingForReview"] || [];
      this.changeReview = res['data']["ReviewButChange"] || [];
      this.pendingReview = res['data']["WaitingList"] || [];
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  editTask(task) {
    // this.task.module = task.ModuleName;
    //  this.task.title = task.Title
    //  this.task.description = task.Description
    // this.task.assigner = task.AssigneeNamee
    // this.task.assigned = task.AssignerName
    this.common.params = task;
    const activeModal = this.modalService.open(TaskAssignUserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTask()
      }
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
      this.getTask()
      this.common.showToast(res['msg'])
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  assignTask() {
    this.common.params = null;
    const activeModal = this.modalService.open(TaskAssignUserComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTask()
      }
    });
  }

  statusComplete(task) {
    this.common.params = {
      title: 'Closing Stock',
      description: 'Are you sure you complete this task?',
      btn2: "No",
      btn1: 'Yes'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {


        console.log(task);
        const params = {
          status: 2,
          taskId: task.id
        }
        this.common.loading++;
        this.api.post('Task/updateTaskStatus', params).subscribe(res => {
          this.common.loading--;
          this.getTask()
          this.common.showToast(res['msg'])
        },
        );
      }
    })
    err => {
      this.common.loading--;

      this.common.showError();
      console.log('Error: ', err);
    };
  }

  waitingForReview(check) {
    this.common.params = {
      title: 'Closing Stock',
      description: 'Waiting for Review for  this task?',
      btn2: "No",
      btn1: 'Yes'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {
        console.log(check);
        const params = {
          status: 1,
          taskId: check.id
        }
        this.common.loading++;
        this.api.post('Task/updateTaskStatus', params).subscribe(res => {
          this.common.loading--;
          this.getTask()
          this.common.showToast(res['msg'])
        },
        );
      }
    })
    err => {
      this.common.loading--;

      this.common.showError();
      console.log('Error: ', err);
    };
  }

  reviewTask(review) {
    this.common.params = review
    this.modalService.open(TaskStatusCheckComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' })
  }

  statusChangeRemark(review) {
    console.log("review", review)
    if (this.taskStatus == "-1" || this.taskStatus == "-2") {
      if (this.remark == null) {

        return this.common.showError("Remark is null");
      }
    }
    this.changeStatus(review)
  }



  changeStatus(review) {
    const params = {
      status: this.taskStatus,
      taskId: review.id,
      remark: this.remark
    }
    this.common.loading++;
    this.api.post('Task/updateTaskStatus', params).subscribe(res => {
      this.common.loading--;
      this.getTask()
      this.common.showToast(res['msg'])
    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

}
