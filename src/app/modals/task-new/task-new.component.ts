import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NormalTask } from '../../classes/normal-task';
import { UserService } from '../../Service/user/user.service';
import { TaskMessageComponent } from '../task-message/task-message.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'ngx-task-new',
  templateUrl: './task-new.component.html',
  styleUrls: ['./task-new.component.scss']
})
export class TaskNewComponent implements OnInit {
  currentDate = this.common.getDate();
  normalTask = new NormalTask('', this.common.getDate(2), '', false, null, [], null, false, new Date(), '',false);
  title = "New Task";
  btn = 'Save';
  assigner = {id:null,name:null}
  userId = null;
  projectName = null;
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
  updateLastDateForm = {
    taskId: null,
    date: null,
    ticketId: null,
    dateOld: null,
    reason: null
  }
  returnNewDate = null;
  editType = 0;//0=new,1=child-task,2=new with param,3=edit-project
  userGroupList = [];
  userWithGroup = [];
  bGConditions = [
    {
      key: 'groupId',
      class: 'highlight-blue',
      isExist: true
    }
  ];
  updateTaskForm = {
    taskId: null,
    ticketId: null,
    ticketType: null,
    project: { id: null,name: null},
    projectOldName: null
  };

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {
    let currentLast = this.common.getDate(2);
    currentLast.setHours(23);
    currentLast.setMinutes(59);
    this.normalTask.date = currentLast;
    // console.log(aaaaaa,'date from task new component')


    if (this.common.params != null) {
      console.log(this.common.params, 'groupList from task-new component');
      this.userList = this.common.params.userList.map(x => { return { id: x.id, name: x.name, groupId: null, groupuser: null } });
      this.userGroupList = this.common.params.groupList;
      if (this.userGroupList) {
        this.userWithGroup = this.userGroupList.concat(this.userList);
      } else {
        this.userWithGroup = this.userList.concat(this.userGroupList);
      }
      console.log(this.userWithGroup, 'user data')
      if (this.common.params.parentTaskId && !this.common.params.editType) {
        this.normalTask.parentTaskId = this.common.params.parentTaskId;
        this.parentTaskDesc = this.common.params.parentTaskDesc;
        this.getTaskMapping(this.normalTask.parentTaskId);

      } else if (this.common.params.parentTaskId && this.common.params.editType == 1) {
        this.title = "Update Task Assign Date";
        this.editType = this.common.params.editType;
        this.updateLastDateForm.taskId = this.common.params.parentTaskId;
        this.updateLastDateForm.date = new Date(this.common.params.editData._expdate);
        this.updateLastDateForm.dateOld = this.common.params.editData._expdate;
        this.updateLastDateForm.ticketId = this.common.params.editData._tktid;
      } else if (this.common.params.editType == 2) {
        // console.log("🚀 ~ file: task-new.component.ts ~ line 90 ~ TaskNewComponent ~ this.normalTask.projectId", this.normalTask.projectId)
        if(this.common.params.project._id){
          this.isProject = '1';
          this.projectName = this.common.params.project.project_desc;
          this.normalTask.projectId = this.common.params.project._id;
        }
      } else if (this.common.params.editType == 3) {
        this.title = "Update Task Project";
        this.editType = this.common.params.editType;
        this.updateTaskForm.taskId = this.common.params.parentTaskId;
        this.updateTaskForm.ticketId = this.common.params.ticketId;
        this.updateTaskForm.ticketType = this.common.params.ticketType;
        this.updateTaskForm.project.id = (this.common.params.project.id) ? this.common.params.project.id : null;
        this.updateTaskForm.project.name = (this.common.params.project.id) ? this.common.params.project.name : null;
        this.updateTaskForm.projectOldName = (this.common.params.project.id) ? this.common.params.project.name : null;
      }
    }

    this.userList.map(user => { 
      if(user.id === userService._details.id){
        this.assigner = {id:user.id,name:user.name}
      }});
    // {id:userService._details.id,name:userService._details.name}
    this.getProjectList()
  }

  ngOnInit() { }
  getProjectList() {
    this.api.get("AdminTask/serachProject.json").subscribe(res => {
      if (res['code'] > 0) {
        this.projectList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  closeModal(response) {
    this.activeModal.close({ response: response, returnNewDate: this.returnNewDate });
  }

  selectedNormalUser(event) {
    this.userId = event.id;
    this.normalTask.userName = event.name;
    this.getUserPresence(this.userId);
  }

  selectedProject(event) {
    this.normalTask.projectId = event.id;
  }

  saveTask(isChat = null) {
    // console.log("normalTask:", this.normalTask);
    if (!this.normalTask.projectId && (this.normalTask.userName == '' || !this.userId)) {
      return this.common.showError("User is missing");
    }
    // else if (!this.normalTask.projectId && !this.userId) {
    //   return this.common.showError("Please assign a user");
    // }
    else if (this.normalTask.subject == '') {
      return this.common.showError("subject is missing");
    }
    else if (!this.normalTask.isFuture && !this.normalTask.date) {
      return this.common.showError("Expected date is missing");
    }
    else if (!this.normalTask.isFuture && this.normalTask.date < this.common.getDate()) {
      return this.common.showError("Expected date must be future date");
    }
    else if (!this.normalTask.isFuture && this.normalTask.date > this.common.getDate(90)) {
      return this.common.showError("Expected date must be within 90 days");
    }
    else if (this.normalTask.isFuture && !this.normalTask.futureDate) {
      return this.common.showError("Please select future assign date");
    }
    else if (this.normalTask.isFuture && this.normalTask.futureDate > this.normalTask.date) {
      return this.common.showError("Last Date must be greater than future assign date");
    }else if(this.assigner.id === this.userId){
      return this.common.showError('Assiner and Assignee can not be same');
    }else if(![this.assigner.id,this.userId].includes(this.userService._details.id)){
      return this.common.showError('You must be either in assign-by or assign-to.');
    }
    else {
      let CCUsers = [];
      this.normalTask.ccUsers.forEach(x => {
        if (x.groupId != null) {
          x.groupuser.forEach(x2 => {
            CCUsers.push({ user_id: x2._id });
          })
        } else {
          CCUsers.push({ user_id: x.id });
        }
      });

      const params = {
        assigner:this.assigner.id,
        userId: this.userId,
        date: this.common.dateFormatter(this.normalTask.date),
        subject: this.normalTask.subject,
        task: this.normalTask.task,
        isUrgent: this.normalTask.isUrgent,
        projectId: this.normalTask.projectId,
        ccUsers: JSON.stringify(CCUsers),
        parentTaskId: this.normalTask.parentTaskId,
        isFuture: this.normalTask.isFuture,
        futureDate: this.common.dateFormatter(this.normalTask.futureDate),
        isQueued: this.normalTask.isQueue
      }
      // return console.log(params);
      this.common.loading++;
      this.api.post('AdminTask/createNormalTask', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          // this.common.showToast(res['data'][0].y_msg);
          if (res['data'][0]['y_id'] > 0) {
            this.resetTask();
            this.closeModal(true);
            this.common.showToast(res['data'][0].y_msg);
            if (isChat == 1) {
              let ticketEditData = {
                ticketData: null,
                ticketId: res['data'][0]['y_tktid'],
                statusId: 0,
                lastSeenId: null,
                taskId: null,
                taskType: 101,
                tabType: -101,
              };
              let subTitle = params.subject + ":<br>" + params.task;
              this.ticketMessage(ticketEditData, subTitle);
            }

          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }

  }

  resetTask() {
    this.normalTask = new NormalTask('', this.common.getDate(2), '', false, null, [], null, false, new Date(), '',false);
  }

  // start task mapping list
  getTaskMapping(taskId) {
    let params = {
      task_id: taskId,
    };
    this.tableTaskMapping = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    this.api.post('AdminTask/getTaskMapping.json', params).subscribe(res => {
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

  // start: update assign date
  updateAssignDate() {
    if (this.updateLastDateForm.date == '' || !this.updateLastDateForm.date) {
      return this.common.showError("Date is missing");
    } else if (this.updateLastDateForm.date < this.common.getDate()) {
      return this.common.showError("Expected date must be future date");
    } else if (this.updateLastDateForm.date > this.common.getDate(90)) {
      return this.common.showError("Expected date must be within 90 days");
    } else {
      const params = {
        date: this.common.dateFormatter(this.updateLastDateForm.date),
        taskId: this.updateLastDateForm.taskId,
        ticketId: this.updateLastDateForm.ticketId,
        dateOld: this.common.dateFormatter(this.updateLastDateForm.dateOld),
        reason: this.updateLastDateForm.reason
      }
      // console.log("params:", params); return false;
      this.common.loading++;
      this.api.post('AdminTask/updateAssignDate', params).subscribe(res => {  //this api use in task-message page also
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.returnNewDate = params.date;
          this.resetTask();
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['msg']);
            this.closeModal(true);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }

  }
  // end: update assign date

  ticketMessage(ticketEditData, subTitle) {
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.userList,
      groupList: this.userGroupList,
    };
    const activeModal = this.modalService.open(TaskMessageComponent, {
      size: "xl",
      container: "nb-layout",
      backdrop: "static",
    });
  }

  getUserPresence(empId) {
    this.common.loading++;
    this.api.get("Admin/getUserPresence.json?empId=" + empId).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let userPresence = (res['data'] && res['data'].length) ? res['data'] : null;
        this.adduserConfirm(userPresence)
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  adduserConfirm(userPresence) {
    if (!userPresence) {
      this.common.params = {
        title: 'User Presence',
        description: '<b>The user has not started the shift for today.<br> Are you sure to add this user ?<b>'
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (!data.response) {
          this.userId = null;
          this.normalTask.userName = '';
        }
      });
    }
  }

  updateTaskProject() {
    if (!this.updateTaskForm.taskId || !this.updateTaskForm.ticketId) {
      this.common.showError("Invalid Request");
      return false;
    }
      const params = {
        taskId: this.updateTaskForm.taskId,
        ticketId: this.updateTaskForm.ticketId,
        ticketType: this.updateTaskForm.ticketType,
        projectId: this.updateTaskForm.project.id,
        projectName: this.updateTaskForm.project.name,
        projectOld: (this.updateTaskForm.projectOldName) ? this.updateTaskForm.projectOldName : null
      }
      // console.log("params:", params); return false;
      this.common.loading++;
      this.api.post('AdminTask/updateTaskProject', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.resetTask();
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['msg']);
            this.closeModal(true);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

}
