import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { ScheduleTask } from '../../classes/schedule-task';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';

@Component({
  selector: 'ngx-task-scheduled',
  templateUrl: './task-scheduled.component.html',
  styleUrls: ['./task-scheduled.component.scss']
})
export class TaskScheduledComponent implements OnInit {
  activeTab = '';
  primaryId = null;
  escalationId = null;
  reportingId = null;
  scheduledTask = new ScheduleTask('', '', '', '', 1, 1, '', '');
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
  dailyParam = [];
  weeklyParam = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
  ];
  monthlyParam = [];

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

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal) {
    this.createScheduleParams();
  }

  ngOnInit() { }

  createScheduleParams() {
    for (let dd = 0; dd < 24; dd++) {
      let tempD = { id: dd, name: dd };
      this.dailyParam.push(tempD);
    }
    for (let mm = 1; mm <= 31; mm++) {
      let tempM = { id: mm, name: mm };
      this.monthlyParam.push(tempM);
    }
  }

  onChangeLogicType() {
    if (this.scheduledTask.logicType == 3) {
      this.scheduledTask.scheduleParam = 1;
    } else {
      this.scheduledTask.scheduleParam = 0;
    }

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

  saveUser() {
    // console.log(this.scheduledTask.description, this.scheduledTask.primaryUser,
    //   this.scheduledTask.escalationUser, this.scheduledTask.reportingUser, this.scheduledTask.logicType,
    //   this.scheduledTask.scheduleParam, this.scheduledTask.days, this.scheduledTask.hours);

    if (this.scheduledTask.description == '') {
      return this.common.showError("Description is missing")
    }
    else if (this.scheduledTask.primaryUser == '') {
      return this.common.showError("Primary User  is missing")
    }
    else if (this.scheduledTask.escalationUser == '') {
      return this.common.showError("Escalation User  is missing")
    }
    else if (this.scheduledTask.reportingUser == '') {
      return this.common.showError("Reporting User  is missing")
    }
    else if (this.scheduledTask.logicType == '') {
      return this.common.showError("Logic Type  is missing")
    }
    else if (this.scheduledTask.scheduleParam == '') {
      return this.common.showError("Schedule Param  is missing")
    }
    else if (this.scheduledTask.days == '') {
      return this.common.showError("Day is missing")
    }
    else if (this.scheduledTask.hours == '') {
      return this.common.showError("Hour is missing")
    }
    else {
      const params = {
        description: this.scheduledTask.description,
        primaryUser: this.primaryId,
        escalationUser: this.escalationId,
        reportingUser: this.reportingId,
        logicType: this.scheduledTask.logicType,
        scheduleParam: this.scheduledTask.scheduleParam,
        days: this.scheduledTask.days,
        hours: this.scheduledTask.hours
      }
      this.common.loading++;
      this.api.post('AdminTask/createScheduleTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        this.scheduledTask = new ScheduleTask('', '', '', '', 1, 1, '', '');
        this.common.showToast('Task Created Successfully..!');
        this.getScheduledTask();
        this.activeTab = 'ScheduledTaskMaster';
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }
  }

  getScheduledTask() {
    this.common.loading++;
    this.api.get("AdminTask/getScheduledTask").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableAllTask();
      this.scheduledTaskList = res['data'] || [];
      this.setTableSchedule();
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getAllTask(type) {
    this.common.loading++;
    let params = {//all task for admin
      type: type
    }
    this.api.post("AdminTask/getTaskByType", params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableAllTask();
      this.resetTableAllScheduleTask();
      this.resetTableUnacknowledgedNormalTask();
      this.resetTableUnacknowledgedScheduledTask();
      if (type == -1) {
        this.allTaskList = res['data'] || [];
        this.setTableAllTask();
      } else if (type == -2) {
        this.allScheduleTaskList = res['data'] || [];
        this.setTableAllScheduleTask();
      } else if (type == -3) {
        this.unacknowledgedNormalTaskList = res['data'] || [];
        this.setTableUnacknowledgedNormalTask();
      } else if (type == -4) {
        this.unacknowledgedScheduledTaskList = res['data'] || [];
        this.setTableUnacknowledgedScheduledTask();
      }
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  resetTableMasterSchedule() {
    this.tableSchedule.data = {
      headings: {},
      columns: []
    };
  }
  resetTableAllTask() {
    this.tableAllTask.data = {
      headings: {},
      columns: []
    };
  }
  resetTableAllScheduleTask() {
    this.tableAllScheduleTask.data = {
      headings: {},
      columns: []
    };
  }
  resetTableUnacknowledgedNormalTask() {
    this.tableUnacknowledgedNormalTask.data = {
      headings: {},
      columns: []
    };
  }
  resetTableUnacknowledgedScheduledTask() {
    this.tableUnacknowledgedScheduledTask.data = {
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
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
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
            // icons: this.actionIcons(pending)
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

  setTableAllTask() {
    this.tableAllTask.data = {
      headings: this.generateHeadingsAllTask(),
      columns: this.getTableColumnsAllTask()
    };
    return true;
  }
  generateHeadingsAllTask() {
    let headings = {};
    for (var key in this.allTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAllTask() {
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
            icons: this.actionIcons(ticket, -1)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
        let bg_color = this.common.taskBgColor.pending;
        if (ticket._status == -1) {
          bg_color = this.common.taskBgColor.reject;
        } else if (ticket._status == 2) {
          bg_color = this.common.taskBgColor.ack;
        } else if (ticket._status == 5) {
          bg_color = this.common.taskBgColor.complete;
        }
        column['style'] = { 'background': bg_color };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  setTableAllScheduleTask() {
    this.tableAllScheduleTask.data = {
      headings: this.generateHeadingsAllScheduleTask(),
      columns: this.getTableColumnsAllScheduleTask()
    };
    return true;
  }
  generateHeadingsAllScheduleTask() {
    let headings = {};
    for (var key in this.allScheduleTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAllScheduleTask() {
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
            icons: this.actionIcons(ticket, -2)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
        let bg_color = this.common.taskBgColor.pending;
        if (ticket._status == -1) {
          bg_color = this.common.taskBgColor.reject;
        } else if (ticket._status == 2) {
          bg_color = this.common.taskBgColor.ack;
        } else if (ticket._status == 5) {
          bg_color = this.common.taskBgColor.complete;
        }
        column['style'] = { 'background': bg_color };
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }

  // start unack normal task
  setTableUnacknowledgedNormalTask() {
    this.tableUnacknowledgedNormalTask.data = {
      headings: this.generateHeadingsUnacknowledgedNormalTask(),
      columns: this.getTableColumnsUnacknowledgedNormalTask()
    };
    return true;
  }
  generateHeadingsUnacknowledgedNormalTask() {
    let headings = {};
    for (var key in this.unacknowledgedNormalTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsUnacknowledgedNormalTask() {
    let columns = [];
    this.unacknowledgedNormalTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsUnacknowledgedNormalTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, -2)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end unack normal task

  // start unack scheduled task
  setTableUnacknowledgedScheduledTask() {
    this.tableUnacknowledgedScheduledTask.data = {
      headings: this.generateHeadingsUnacknowledgedScheduledTask(),
      columns: this.getTableColumnsUnacknowledgedScheduledTask()
    };
    return true;
  }
  generateHeadingsUnacknowledgedScheduledTask() {
    let headings = {};
    for (var key in this.unacknowledgedScheduledTaskList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsUnacknowledgedScheduledTask() {
    let columns = [];
    this.unacknowledgedScheduledTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsUnacknowledgedScheduledTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, -2)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end unack scheduled task

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  ticketMessage(ticket, type) {
    console.log("type:", type);
    let ticketEditData = {
      ticketId: ticket._tktid,
      statusId: ticket._status
    }
    this.common.params = { ticketEditData, title: "Ticket Comment", button: "Save" };
    const activeModal = this.modalService.open(TaskMessageComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => { });
  }

  actionIcons(ticket, type) {
    let icons = [
      { class: "fas fa-comments", action: this.ticketMessage.bind(this, ticket, type) },
    ];
    if (ticket._unreadcount > 0) {
      icons = [
        { class: "fas fa-comments new-comment", action: this.ticketMessage.bind(this, ticket, type) },
      ];
    }
    return icons;
  }

}