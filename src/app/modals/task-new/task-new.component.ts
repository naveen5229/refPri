import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NormalTask } from '../../classes/normal-task';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-task-new',
  templateUrl: './task-new.component.html',
  styleUrls: ['./task-new.component.scss']
})
export class TaskNewComponent implements OnInit {
  normalTask = new NormalTask('', new Date(), '', false, null, [], null);
  btn = 'Save';
  userId = null;
  isProject = "";
  projectList = [];
  userList = [];
  parentTaskDesc = "";
  taskMapping = [];
  tableTaskMapping = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.userList = this.common.params.userList;
      if (this.common.params.parentTaskId) {
        this.normalTask.parentTaskId = this.common.params.parentTaskId;
        this.parentTaskDesc = this.common.params.parentTaskDesc;
        console.log("normalTask:", this.normalTask);
        this.getTaskMapping(this.normalTask.parentTaskId);
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
    else if (!this.userId) {
      return this.common.showError("Please assign a user")
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
  }

  // start task mapping list
  getTaskMapping(taskId) {
    let params = {
      task_id: taskId,
    };
    console.log('Params: ', params);
    this.tableTaskMapping = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    this.api.post('AdminTask/getTaskMapping.json', params)
      .subscribe(res => {
        console.log(res);
        if (res['code'] > 0) {
          this.taskMapping = res['data'] || [];
          this.setTableTaskMapping();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        console.error(err);
        this.common.showError();
      });
  }

  setTableTaskMapping() {
    this.tableTaskMapping.data = {
      headings: this.generateHeadingsTaskMapping(),
      columns: this.getTableColumnsTaskMapping()
    };
    return true;
  }

  generateHeadingsTaskMapping() {
    let headings = {};
    for (var key in this.taskMapping[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }
  getTableColumnsTaskMapping() {
    let columns = [];
    this.taskMapping.map(task => {
      let column = {};
      for (let key in this.generateHeadingsTaskMapping()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(task)
          };
        } else {
          column[key] = { value: task[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }
  // end task mapping list

}
