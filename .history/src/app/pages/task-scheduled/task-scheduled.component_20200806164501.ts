import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
import { TaskScheduleNewComponent } from '../../modals/task-schedule-new/task-schedule-new.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { UserService } from '../../Service/user/user.service';
import { TaskScheduleMasterComponent } from '../../modals/task-schedule-master/task-schedule-master.component';

@Component({
  selector: 'ngx-task-scheduled',
  templateUrl: './task-scheduled.component.html',
  styleUrls: ['./task-scheduled.component.scss']
})
export class TaskScheduledComponent implements OnInit {
  activeTab = '';
  activeTabNormal = '';
  activeTabScheduled = '';
  primaryId = null;
  escalationId = null;
  reportingId = null;
  scheduledTask = {
    taskId: null,
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
    // logicType: 1,
    // scheduleParam: 1,
    days: "",
    hours: "",
    isActive: true,
    department: {
      id: '',
      name: ''
    },
    ccUsers: []
  };
  scheduledTaskList = [];
  tableSchedule = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  allTaskList = [];
  tableAllTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  allScheduleTaskList = [];
  tableAllScheduleTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  ackNormalTaskList = [];
  tableAckNormalTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  ackScheduleTaskList = [];
  tableAckScheduleTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  userReportList = [];
  tableUserReportList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  scheduledUserReportList = [];
  tableScheduledUserReportList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  unacknowledgedNormalTaskList = [];
  unacknowledgedScheduledTaskList = [];
  tableUnacknowledgedNormalTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  tableUnacknowledgedScheduledTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  adminList = [];
  searchTask = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }
  departmentList = [];

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getAllAdmin();
    this.getDepartmentList();
  }

  ngOnInit() { }
  resetSearchTask() {
    this.searchTask = {
      startDate: <any>this.common.getDate(-2),
      endDate: <any>this.common.getDate()
    }
  }
  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        let adminList = res["data"] || [];
          this.adminList = adminList.map((x) => {
            return { id: x.id, name: x.name + " - " + x.department_name };
          });
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.departmentList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  selectedPrimarUser(event) {
    this.scheduledTask.primaryUser = event.name;
    this.primaryId = event.id;
  }
  selectedEscalationUser(event) {
    this.scheduledTask.escalationUser = event.name;
    this.escalationId = event.id;
  }
  selectedReportingUser(event) {
    this.scheduledTask.reportingUser = event.name;
    this.reportingId = event.id;
  }

  ccUsertemp = [];
  saveScheduleTask() {
    console.log("scheduledTask:", this.scheduledTask);
    if (this.scheduledTask.description == '') {
      return this.common.showError("Description is missing")
    } else if (this.scheduledTask.primaryUser.id == '') {
      return this.common.showError("Primary User is missing")
    } else if (this.scheduledTask.escalationUser.id == '') {
      return this.common.showError("Escalation User is missing")
    } else if (this.scheduledTask.reportingUser.id == '') {
      return this.common.showError("Reporting User is missing")
    } else {
      let ccUsers = (this.scheduledTask.ccUsers) ? this.scheduledTask.ccUsers.map(user => { return { id: user.id } }) : null;

      const params = {
        taskId: this.scheduledTask.taskId,
        description: this.scheduledTask.description,
        primaryUser: this.scheduledTask.primaryUser.id,
        escalationUser: this.scheduledTask.escalationUser.id,
        reportingUser: this.scheduledTask.reportingUser.id,
        // logicType: this.scheduledTask.logicType,
        // scheduleParam: this.scheduledTask.scheduleParam,
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
            // this.resetScheduleTask();
            this.closeSchedukedTaskMasterModal({ id: res['data'][0]['y_id'] });
            this.getScheduledTask();
            this.activeTab = 'ScheduledTaskMaster';
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
      // logicType: 1,
      // scheduleParam: 1,
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

  closeSchedukedTaskMasterModal(response) {
    this.resetScheduleTask();
    document.getElementById("schedukedTaskMasterModal").style.display = "none";
    if (response && response.id) {
      let task = { _id: response.id };
      this.addScheduleTaskparam(task, -1);
    }
  }

  openSchedukedTaskMasterModal() {
    // document.getElementById("schedukedTaskMasterModal").style.display = "block";
    this.common.params = null;
    this.common.params = { data: null, adminList: this.adminList, departmentList: this.departmentList, title: "Add Schedule task", button: "Save" };
    const activeModal = this.modalService.open(TaskScheduleMasterComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getScheduledTask();
        this.activeTab = 'scheduleMaster';
      }
    });
  }

  getScheduledTask() {
    this.common.loading++;
    this.api.get("AdminTask/getScheduledTask").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetSmartTableData();
      this.scheduledTaskList = res['data'] || [];
      this.setTableSchedule();
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getUserReport(type = null) {
    this.common.loading++;
    let params = "";
    if (type == 1) {
      params = "?type=" + type;
    }
    this.api.get("AdminTask/userReport" + params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetSmartTableData();
      if (type == 1) {
        this.scheduledUserReportList = res['data'] || [];
        this.setTableScheduledUserReportList();
      } else {
        this.userReportList = res['data'] || [];
        this.setTableUserReportList();
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }
  getAllTask(type, startDate = null, endDate = null) {
    this.common.loading++;
    let params = {//all task for admin
      type: type,
      startDate: startDate,
      endDate: endDate
    }
    this.api.post("AdminTask/getTaskByType", params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data']);
      this.resetSmartTableData();
      if (type == -1) {
        this.allTaskList = res['data'] || [];
        this.setTableAllTask(type);
      } else if (type == -2) {
        this.allScheduleTaskList = res['data'] || [];
        this.setTableAllScheduleTask(type);
      } else if (type == -3) {
        this.unacknowledgedNormalTaskList = res['data'] || [];
        this.setTableUnacknowledgedNormalTask(type);
      } else if (type == -33) {
        this.ackNormalTaskList = res['data'] || [];
        this.setTableAckNormalTask(type);
      } else if (type == -4) {
        this.unacknowledgedScheduledTaskList = res['data'] || [];
        this.setTableUnacknowledgedScheduledTask(type);
      } else if (type == -44) {
        this.ackScheduleTaskList = res['data'] || [];
        this.setTableAckScheduledTask(type);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  resetSmartTableData() {
    this.tableSchedule.data = {
      headings: {},
      columns: []
    };
    this.tableAllTask.data = {
      headings: {},
      columns: []
    };
    this.tableAllScheduleTask.data = {
      headings: {},
      columns: []
    };
    this.tableUnacknowledgedNormalTask.data = {
      headings: {},
      columns: []
    };
    this.tableUnacknowledgedScheduledTask.data = {
      headings: {},
      columns: []
    };
    this.tableAckNormalTask.data = {
      headings: {},
      columns: []
    };
    this.tableAckScheduleTask.data = {
      headings: {},
      columns: []
    };
    this.tableUserReportList.data = {
      headings: {},
      columns: []
    };
    this.tableScheduledUserReportList.data = {
      headings: {},
      columns: []
    };
  }

  setTableSchedule() {
    this.tableSchedule.data = {
      headings: this.generateHeadingsSchedule(),
      columns: this.getTableColumnsSchedule()
    };
    return true;
  }

  generateHeadingsSchedule() {
    let headings = {};
    for (var key in this.scheduledTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsSchedule() {
    // console.log(this.generateHeadingsSchedule());
    let columns = [];
    this.scheduledTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsSchedule()) {
        if (key == "admin_name") {
          column[key] = { value: ticket[key], class: 'admin', isHTML: true, action: '' }
        }
        else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIconsMaster(ticket)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else if (key == 'isactive') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (ticket[key]) ? [{ class: "fa fa-check text-success", action: null, title: "isactive" }] : '',
            action: null,
            class: "text-center",
          };
        } else {
          column[key] = { value: (key == 'due_time') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }

  setTableAllTask(type) {
    this.tableAllTask.data = {
      headings: this.generateHeadingsAllTask(),
      columns: this.getTableColumnsAllTask(type)
    };
    return true;
  }
  generateHeadingsAllTask() {
    let headings = {};
    for (var key in this.allTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAllTask(type) {
    // console.log(this.generateHeadingsAllTask());
    let columns = [];
    this.allTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAllTask()) {
        if (key == "admin_name") {
          column[key] = { value: ticket[key], class: 'admin', isHTML: true, action: '' }
        }
        else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else if (key == 'high_priority') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (ticket[key]) ? [{ class: "fa fa-check text-success", action: null, title: "high-priority" }] : '',
            action: null,
            class: "text-center"
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  setTableAllScheduleTask(type) {
    this.tableAllScheduleTask.data = {
      headings: this.generateHeadingsAllScheduleTask(),
      columns: this.getTableColumnsAllScheduleTask(type)
    };
    return true;
  }

  generateHeadingsAllScheduleTask() {
    let headings = {};
    for (var key in this.allScheduleTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAllScheduleTask(type) {
    let columns = [];
    this.allScheduleTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAllScheduleTask()) {
        if (key == "admin_name") {
          column[key] = { value: ticket[key], class: 'admin', isHTML: true, action: '' }
        }
        else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }

  // start unack normal task
  setTableUnacknowledgedNormalTask(type) {
    this.tableUnacknowledgedNormalTask.data = {
      headings: this.generateHeadingsUnacknowledgedNormalTask(),
      columns: this.getTableColumnsUnacknowledgedNormalTask(type)
    };
    return true;
  }
  generateHeadingsUnacknowledgedNormalTask() {
    let headings = {};
    for (var key in this.unacknowledgedNormalTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsUnacknowledgedNormalTask(type) {
    let columns = [];
    this.unacknowledgedNormalTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsUnacknowledgedNormalTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else if (key == 'expdate' && ticket['time_left'] <= 0) {
          column[key] = { value: ticket[key], class: 'black font-weight-bold', action: '' };
        } else if (key == 'high_priority') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (ticket[key]) ? [{ class: "fa fa-check text-success", action: null, title: "high-priority" }] : '',
            action: null,
            class: "text-center"
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end unack normal task

  // start unack scheduled task
  setTableUnacknowledgedScheduledTask(type) {
    this.tableUnacknowledgedScheduledTask.data = {
      headings: this.generateHeadingsUnacknowledgedScheduledTask(),
      columns: this.getTableColumnsUnacknowledgedScheduledTask(type)
    };
    return true;
  }

  generateHeadingsUnacknowledgedScheduledTask() {
    let headings = {};
    for (var key in this.unacknowledgedScheduledTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsUnacknowledgedScheduledTask(type) {
    let columns = [];
    this.unacknowledgedScheduledTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsUnacknowledgedScheduledTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: (key == 'time_left' && ticket['time_left'] <= 0) ? 'black font-weight-bold' : 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end unack scheduled task
  // start ack normal task
  setTableAckNormalTask(type) {
    this.tableAckNormalTask.data = {
      headings: this.generateHeadingsAckNormalTask(),
      columns: this.getTableColumnsAckNormalTask(type)
    };
    return true;
  }
  generateHeadingsAckNormalTask() {
    let headings = {};
    for (var key in this.ackNormalTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAckNormalTask(type) {
    let columns = [];
    this.ackNormalTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAckNormalTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else if (key == 'expdate' && ticket['time_left'] <= 0) {
          column[key] = { value: ticket[key], class: 'black font-weight-bold', action: '', type: 'date' };
        } else if (key == 'high_priority') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (ticket[key]) ? [{ class: "fa fa-check text-success", action: null, title: "high-priority" }] : '',
            action: null,
            class: "text-center"
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '', type: (key == 'expdate') ? 'date' : null };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end ack normal task
  // start ack scheduled task
  setTableAckScheduledTask(type) {
    this.tableAckScheduleTask.data = {
      headings: this.generateHeadingsAckScheduledTask(),
      columns: this.getTableColumnsAckScheduledTask(type)
    };
    return true;
  }
  generateHeadingsAckScheduledTask() {
    let headings = {};
    for (var key in this.ackScheduleTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAckScheduledTask(type) {
    let columns = [];
    this.ackScheduleTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAckScheduledTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'subject' || key == 'task_subject') {
          column[key] = { value: ticket[key], class: 'black', action: '', isTitle: true, title: ticket['_task_desc'] };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: (key == 'time_left' && ticket['time_left'] <= 0) ? 'black font-weight-bold' : 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end ack scheduled task

  // start user report list
  setTableUserReportList() {
    this.tableUserReportList.data = {
      headings: this.generateHeadingsTableUserReportList(),
      columns: this.getTableColumnsTableUserReportList()
    };
    return true;
  }
  generateHeadingsTableUserReportList() {
    let headings = {};
    for (var key in this.userReportList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsTableUserReportList() {
    let columns = [];
    this.userReportList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsTableUserReportList()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, type)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
        // column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end user report list

  // start: scheduled user report list
  setTableScheduledUserReportList() {
    this.tableScheduledUserReportList.data = {
      headings: this.generateHeadingsTableScheduledUserReportList(),
      columns: this.getTableColumnsTableScheduledUserReportList()
    };
    return true;
  }
  generateHeadingsTableScheduledUserReportList() {
    let headings = {};
    for (var key in this.scheduledUserReportList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsTableScheduledUserReportList() {
    let columns = [];
    this.scheduledUserReportList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsTableScheduledUserReportList()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, type)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end: scheduled user report list

  ticketMessage(ticket, type) {
    // console.log("type:", type);
    let ticketEditData = {
      ticketData: ticket,
      ticketId: ticket._tktid,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      taskId: (ticket._tktype == 101 || ticket._tktype == 102) ? ticket._refid : null,
      taskType: ticket._tktype,
      tabType: type
    }
    let subTitle = ticket.task_subject + ":<br>" + ticket._task_desc;
    // this.common.params = { ticketEditData, title: "Ticket Comment", button: "Save", subTitle: (ticket._tktype == 103) ? ticket.sc_task_desc : ticket.task_desc };
    this.common.params = { ticketEditData, title: "Ticket Comment", button: "Save", subTitle: subTitle };
    const activeModal = this.modalService.open(TaskMessageComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getAllTask(type);
    });
  }

  actionIcons(ticket, type) {
    let icons = [
      { class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type), txt: '' },
    ];
    if (ticket._unreadcount > 0) {
      icons = [
        { class: "fas fa-comments new-comment", action: this.ticketMessage.bind(this, ticket, type), txt: ticket._unreadcount },
      ];
    } else if (ticket._unreadcount == -1) {
      icons = [
        { class: "fas fa-comments no-comment", action: this.ticketMessage.bind(this, ticket, type), txt: '' },
      ];
    }
    if ((ticket._status == 5 || ticket._status == -1)) {
      if (type == -2 && ticket._aduserid == this.userService._details.id) {
        icons.push({ class: "fa fa-retweet", action: this.reactiveTicket.bind(this, ticket, type), txt: '' });
      }
    } else {
      if (ticket._isremind == 1) {
        icons.push({ class: "fa fa-bell isRemind", action: this.checkReminderSeen.bind(this, ticket, type), txt: '' });
      } else if (ticket._isremind == 2) {
        icons.push({ class: "fa fa-bell reminderAdded", action: this.showReminderPopup.bind(this, ticket, type), txt: '' });
      } else {
        icons.push({ class: "fa fa-bell", action: this.showReminderPopup.bind(this, ticket, type), txt: '' });
      }
    }
    return icons;
  }

  actionIconsMaster(task) {
    let icons = [
      { class: "fa fa-edit", action: this.editScheduleTask.bind(this, task) },
      { class: "fa fa-calendar-alt", action: this.addScheduleTaskparam.bind(this, task) },
    ];
    return icons;
  }

  editScheduleTask(task) {
    // console.log("edit editScheduleTask:", task);
    // let seconds = task.due_time;
    // let days = Math.floor(seconds / (3600 * 24));
    // seconds -= days * 3600 * 24;
    // let hrs = Math.floor(seconds / 3600);

    // // let ccUserTemp = task._cc_user;
    // // console.log("ccUserTemp:", ccUserTemp);
    // let getAdminSelected = [];
    // if (task._cc_user && task._cc_user.length) {
    //   task._cc_user.forEach(ev => {
    //     let findAdmin = this.adminList.find(x => { return x.id == ev.id });
    //     if (findAdmin) {
    //       getAdminSelected.push({ id: findAdmin.id, name: findAdmin.name });
    //     }
    //   });
    // }
    // console.log("getAdminSelected:", getAdminSelected);

    // this.scheduledTask = {
    //   taskId: task._id,
    //   description: task.description,
    //   primaryUser: {
    //     id: task._pri_user_id,
    //     name: task.pri_user
    //   },
    //   escalationUser: {
    //     id: task._esc_user_id,
    //     name: task.esc_user
    //   },
    //   reportingUser: {
    //     id: task._reporting_user_id,
    //     name: task.rep_user
    //   },
    //   // logicType: task._logic_type,
    //   // scheduleParam: task._schedule_param,
    //   days: JSON.stringify(days),
    //   hours: JSON.stringify(hrs),
    //   isActive: task._is_active,
    //   department: {
    //     id: (task._department_id) ? task._department_id : null,
    //     name: (task._department_id) ? task.department : null
    //   },
    //   ccUsers: (getAdminSelected.length) ? getAdminSelected : []

    // };

    // console.log("edit scheduledTask:", this.scheduledTask);
    // this.openSchedukedTaskMasterModal();
    this.common.params = null;
    this.common.params = { data: task, adminList: this.adminList, departmentList: this.departmentList, title: "Add Schedule task", button: "Save" };
    const activeModal = this.modalService.open(TaskScheduleMasterComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getScheduledTask();
        this.activeTab = 'scheduleMaster';
      }
    });
  }

  searchAllCompletedTask(type) {
    console.log("searchTask:", this.searchTask);
    if (this.searchTask.startDate && this.searchTask.endDate) {
      let startDate = this.common.dateFormatter(this.searchTask.startDate);
      let endDate = this.common.dateFormatter(this.searchTask.endDate);
      if (type == 'scheduled') {
        this.getAllTask(-2, startDate, endDate);
      } else {
        this.getAllTask(-1, startDate, endDate);
      }
    } else {
      this.common.showError("Select start date and end date");
    }
  }

  addScheduleTaskparam(task, type) {
    console.log("type:", type);
    this.common.params = { taskId: task._id, title: "Schedule task action", button: "Save" };
    const activeModal = this.modalService.open(TaskScheduleNewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => { });
  }


  showReminderPopup(ticket, type) {
    this.common.params = { ticketId: ticket._tktid, title: "Add Reminder", btn: "Set Reminder" };
    const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getAllTask(type);
      }
    });
  }

  checkReminderSeen(ticket, type) {
    let params = {
      ticket_id: ticket._tktid
    };
    this.common.loading++;
    this.api.post('AdminTask/checkReminderSeen', params)
      .subscribe(res => {
        this.common.loading--;
        this.common.showToast(res['msg']);
        this.getAllTask(type);
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
  }

  reactiveTicket(ticket, type) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: 0,
        statusOld: ticket._status,
        remark: null,
        taskId: ticket._refid,
        ticketType: ticket._tktype
      }
      this.common.params = {
        title: 'Reactive Ticket',
        description: `<b>&nbsp;` + 'Are You Sure To Reactive This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('AdminTask/updateTicketStatus', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] > 0) {
              this.common.showToast(res['msg']);
              this.getAllTask(type);
            }
            else {
              this.common.showError(res['data']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log('Error: ', err);
          });
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

}