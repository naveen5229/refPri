import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NormalTask } from '../../classes/normal-task';

@Component({
  selector: 'ngx-task-new',
  templateUrl: './task-new.component.html',
  styleUrls: ['./task-new.component.scss']
})
export class TaskNewComponent implements OnInit {
  normalTask = new NormalTask('', new Date(), '', false, null, [], null);
  // normalTask = {
  //   userName: "",
  //   date: new Date(),
  //   task:"",
  //   isUrgent: false,
  //   projectId: null,
  //   ccUsers: null,
  //   parentTaskId: null
  // };
  btn = 'Save';
  userId = null;
  isProject = "";
  projectList = [];
  userList = [];
  parentTaskDesc = "";

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.userList = this.common.params.userList;
      if (this.common.params.parentTaskId) {
        this.normalTask.parentTaskId = this.common.params.parentTaskId;
        this.parentTaskDesc = this.common.params.parentTaskDesc;
        console.log("normalTask:", this.normalTask);
      }
    }
    this.getProjectList()
  }

  ngOnInit() {
  }
  getProjectList() {
    this.api.get("AdminTask/serachProject.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.projectList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  selectedNormalUser(event) {
    // console.log(event);
    this.userId = event.id;
    this.normalTask.userName = event.name;
  }

  selectedProject(event) {
    console.log("selectedProject:", event);
    this.normalTask.projectId = event.id;
  }

  changeCCUsers(event) {
    console.log("changeCCUsers:", event);
    if (event && event.length) {
      this.normalTask.ccUsers = event.map(user => { return { user_id: user.id } });
      console.log("ccUsers", this.normalTask.ccUsers);
    } else {
      this.normalTask.ccUsers = [];
    }
  }

  saveTask() {
    if (this.normalTask.userName == '') {
      return this.common.showError("User Name is missing")
    }
    else if (this.normalTask.task == '') {
      return this.common.showError("Task is missing")
    }
    else {
      const params = {
        userId: this.userId,
        date: this.common.dateFormatter(this.normalTask.date),
        task: this.normalTask.task,
        isUrgent: this.normalTask.isUrgent,
        projectId: this.normalTask.projectId,
        ccUsers: JSON.stringify(this.normalTask.ccUsers),
        parentTaskId: this.normalTask.parentTaskId
      }
      this.common.loading++;
      this.api.post('AdminTask/createNormalTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          // this.normalTask = new NormalTask('', new Date(), '', false, null, null, null);
          this.resetTask();
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0].y_msg)
            this.closeModal(true);
          } else {
            this.common.showError(res['data'][0].y_msg)
          }
        } else {
          this.common.showError(res['msg']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }

  }

  resetTask() {
    this.normalTask = new NormalTask('', new Date(), '', false, null, [], null);
    // this.normalTask = {
    //   userName: "",
    //   date: new Date(),
    //   task:"",
    //   isUrgent: false,
    //   projectId: null,
    //   ccUsers: null,
    //   parentTaskId: null
    // };
  }
}
