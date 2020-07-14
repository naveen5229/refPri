import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { TaskScheduleNewComponent } from '../task-schedule-new/task-schedule-new.component';

@Component({
  selector: 'ngx-task-schedule-master',
  templateUrl: './task-schedule-master.component.html',
  styleUrls: ['./task-schedule-master.component.scss']
})
export class TaskScheduleMasterComponent implements OnInit {
  title = "Scheduled Task Master";
  scheduledTask = {
    taskId: null,
    subject: "",
    description: "",
    primaryUser: {
      id: '',
      name: ''
    },
    escalationUser: {
      id: '',
      name: ''
    },
    reportingUser: {
      id: '',
      name: ''
    },
    days: "",
    hours: "",
    isActive: true,
    department: {
      id: '',
      name: ''
    },
    ccUsers: []
  };

  adminList = [];
  departmentList = [];

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {

    this.adminList = this.common.params.adminList;
    this.departmentList = this.common.params.departmentList;
    console.log("master param:", this.common.params);
    if (this.common.params != null && this.common.params.data != null) {
      let task = this.common.params.data;
      let seconds = task.due_time;
      let days = Math.floor(seconds / (3600 * 24));
      seconds -= days * 3600 * 24;
      let hrs = Math.floor(seconds / 3600);

      let getAdminSelected = [];
      if (task._cc_user && task._cc_user.length) {
        task._cc_user.forEach(ev => {
          let findAdmin = this.adminList.find(x => { return x.id == ev.id });
          if (findAdmin) {
            getAdminSelected.push({ id: findAdmin.id, name: findAdmin.name });
          }
        });
      }
      console.log("getAdminSelected:", getAdminSelected);
      this.scheduledTask = {
        taskId: task._id,
        subject: task.task_subject,
        description: task._task_desc,
        primaryUser: {
          id: task._pri_user_id,
          name: task.pri_user
        },
        escalationUser: {
          id: (task._esc_user_id) ? task._esc_user_id : null,
          name: (task._esc_user_id) ? task.esc_user : ""
        },
        reportingUser: {
          id: task._reporting_user_id,
          name: task.rep_user
        },
        days: JSON.stringify(days),
        hours: JSON.stringify(hrs),
        isActive: task._is_active,
        department: {
          id: (task._department_id) ? task._department_id : null,
          name: (task._department_id) ? task.department : null
        },
        ccUsers: (getAdminSelected.length) ? getAdminSelected : []
      };

      console.log("edit scheduledTask:", this.scheduledTask);
    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  saveScheduleTask() {
    console.log("scheduledTask:", this.scheduledTask);
    if (this.scheduledTask.subject == '') {
      return this.common.showError("Subject is missing");
    } else if (this.scheduledTask.primaryUser.id == '') {
      return this.common.showError("Primary User is missing");
    }
    // else if (this.scheduledTask.escalationUser.id == '') {
    //   return this.common.showError("Escalation User is missing")
    // } 
    else if (this.scheduledTask.reportingUser.id == '') {
      return this.common.showError("Reporting User is missing");
    } else {
      let ccUsers = (this.scheduledTask.ccUsers) ? this.scheduledTask.ccUsers.map(user => { return { id: user.id } }) : null;
      const params = {
        taskId: this.scheduledTask.taskId,
        subject: this.scheduledTask.subject,
        description: this.scheduledTask.description,
        primaryUser: this.scheduledTask.primaryUser.id,
        escalationUser: this.scheduledTask.escalationUser.id,
        reportingUser: this.scheduledTask.reportingUser.id,
        days: this.scheduledTask.days,
        hours: this.scheduledTask.hours,
        isActive: this.scheduledTask.isActive,
        departmentId: this.scheduledTask.department.id,
        ccUsers: ccUsers
      }
      // console.log("params:", params); return false;
      this.common.loading++;
      this.api.post('AdminTask/createScheduleTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0].y_msg)
            this.resetScheduleTask();
            this.closeModal(true);
            this.addScheduleTaskparam(res['data'][0]['y_id']);
          } else {
            this.common.showError(res['data'][0].y_msg)
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

  resetScheduleTask() {
    this.scheduledTask = {
      taskId: null,
      subject: "",
      description: "",
      primaryUser: {
        id: '',
        name: ''
      },
      escalationUser: {
        id: '',
        name: ''
      },
      reportingUser: {
        id: '',
        name: ''
      },
      days: "",
      hours: "",
      isActive: true,
      department: {
        id: '',
        name: ''
      },
      ccUsers: []
    };
  }

  addScheduleTaskparam(taskId) {
    this.common.params = { taskId: taskId, title: "Schedule task action", button: "Save" };
    const activeModal = this.modalService.open(TaskScheduleNewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => { });
  }

}
