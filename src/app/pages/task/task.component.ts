import { Component, OnInit, Directive } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskStatusChangeComponent } from '../../modals/task-status-change/task-status-change.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
import { TaskNewComponent } from '../../modals/task-new/task-new.component';
import { AddProjectComponent } from '../../modals/add-project/add-project.component';
import { ReminderComponent } from '../../modals/reminder/reminder.component';

@Component({
  selector: 'ngx-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  activeTab = 'TasksForMe';
  task_type = 1;
  userId = null;
  primaryId = null;
  escalationId = null;
  reportingId = null;
  adminList = [];
  normalTaskList = [];
  scheduledTaskList = [];
  scheduleMasterTaskList = [];
  allCompletedTaskList = [];
  ccTaskList = [];
  projectTaskList = [];

  tableNormal = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  tableMasterSchedule = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  tableSchedule = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  tableAllCompleted = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  tableCCTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  tableProjectTask = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  searchTask = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }
  minDateTodo = this.common.getDate();
  taskTodoForm = {
    taskTodoId: null,
    desc: "",
    date: this.common.getDate(),
    isUrgent: false
  };

  taskTodoList = [];
  tableTaskTodoList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal) {
    this.getTaskByType(101);
    this.getAllAdmin();
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
        this.adminList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  showProjectPopup() {
    this.common.params = { userList: this.adminList };
    const activeModal = this.modalService.open(AddProjectComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
  showTaskPopup() {
    this.common.params = { userList: this.adminList, parentTaskId: null };
    const activeModal = this.modalService.open(TaskNewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTaskByType(-101);
        this.activeTab = 'TasksByMe';
      }
    });
  }

  getTaskByType(type, startDate = null, endDate = null) {
    this.common.loading++;
    let params = {
      type: type,
      startDate: startDate,
      endDate: endDate
    }
    this.api.post("AdminTask/getTaskByType", params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.reserSmartTableData();
      if (type == 101) {//normal task pending (task for me)
        this.normalTaskList = res['data'] || [];
        this.setTableNormal(type);
      } else if (type == -101) { //task by me
        this.scheduleMasterTaskList = res['data'] || [];
        this.setTableMasterSchedule(type);
      } else if (type == 103) {
        this.scheduledTaskList = res['data'] || [];
        this.setTableSchedule(type);
      } else if (type == -102) {
        this.allCompletedTaskList = res['data'] || [];
        this.setTableAllCompleted(type);
      } else if (type == -5) {
        this.ccTaskList = res['data'] || [];
        this.setTableCCTask(type);
      } else if (type == -6) {
        this.projectTaskList = res['data'] || [];
        this.setTableProjectTask(type);
      }
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  resetTableMasterSchedule() {
    this.tableMasterSchedule.data = {
      headings: {},
      columns: []
    };
  }
  resetTableSchedule() {
    this.tableSchedule.data = {
      headings: {},
      columns: []
    };
  }
  resetTableNormal() {
    this.tableNormal.data = {
      headings: {},
      columns: []
    };
  }
  resetTableAllCompleted() {
    this.tableAllCompleted.data = {
      headings: {},
      columns: []
    };
  }
  resetTableCCTask() {
    this.tableCCTask.data = {
      headings: {},
      columns: []
    };
  }
  resetTableProjectTask() {
    this.tableProjectTask.data = {
      headings: {},
      columns: []
    };
  }
  reserSmartTableData() {
    this.tableMasterSchedule.data = {
      headings: {},
      columns: []
    };
    this.tableSchedule.data = {
      headings: {},
      columns: []
    };
    this.tableNormal.data = {
      headings: {},
      columns: []
    };
    this.tableAllCompleted.data = {
      headings: {},
      columns: []
    };
    this.tableCCTask.data = {
      headings: {},
      columns: []
    };
    this.tableProjectTask.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadingsNormal() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.normalTaskList[0]) {
      // console.log(key.charAt(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }
  generateHeadingsMasterSchedule() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.scheduleMasterTaskList[0]) {
      // console.log(key.charAt(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }
  generateHeadingsSchedule() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.scheduledTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  setTableNormal(type) {
    this.tableNormal.data = {
      headings: this.generateHeadingsNormal(),
      columns: this.getTableColumnsNormal(type)
    };
    return true;
  }
  setTableMasterSchedule(type) {
    this.tableMasterSchedule.data = {
      headings: this.generateHeadingsMasterSchedule(),
      columns: this.getTableColumnsMasterSchedule(type)
    };
    return true;
  }
  setTableSchedule(type) {
    this.tableSchedule.data = {
      headings: this.generateHeadingsSchedule(),
      columns: this.getTableColumnsSchedule(type)
    };
    return true;
  }
  setTableAllCompleted(type) {
    this.tableAllCompleted.data = {
      headings: this.generateHeadingsAllCompleted(),
      columns: this.getTableColumnsAllCompleted(type)
    };
    return true;
  }

  generateHeadingsAllCompleted() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.allCompletedTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsAllCompleted(type) {
    let columns = [];
    this.allCompletedTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAllCompleted()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'time_left') {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: 'black', action: '' };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }

  getTableColumnsNormal(type) {
    let columns = [];
    this.normalTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsNormal()) {
        if (key == "admin_name") {
          column[key] = { value: ticket[key], class: 'admin', isHTML: true, action: '' }

        } else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'time_left') {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: 'black', action: '' };
        } else if (key == 'expdate' && ticket['time_left'] <= 0) {
          column[key] = { value: ticket[key], class: 'black font-weight-bold', action: '' };
        } else {
          column[key] = { value: ticket[key], class: (key == 'high_periority' && ticket[key]) ? 'black font-weight-bold' : 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    return columns;

  }

  getTableColumnsMasterSchedule(type) {
    let columns = [];
    this.scheduleMasterTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsMasterSchedule()) {
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
        } else if (key == 'time_left') {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: 'black', action: '' };
        } else if (key == 'expdate' && ticket['time_left'] <= 0) {
          column[key] = { value: ticket[key], class: 'black font-weight-bold', action: '' };
        } else {
          column[key] = { value: ticket[key], class: (key == 'high_periority' && ticket[key]) ? 'black font-weight-bold' : 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    return columns;

  }

  getTableColumnsSchedule(type) {
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
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'time_left') {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: 'black', action: '' };
        } else {
          column[key] = { value: ticket[key], class: (key == 'time_left' && ticket['time_left'] <= 0) ? 'black font-weight-bold' : 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }

  // start cc task list
  setTableCCTask(type) {
    this.tableCCTask.data = {
      headings: this.generateHeadingsCCTask(),
      columns: this.getTableColumnsCCTask(type)
    };
    return true;
  }

  generateHeadingsCCTask() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.ccTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsCCTask(type) {
    let columns = [];
    this.ccTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsCCTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'time_left') {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: 'black', action: '' };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }
  // end cc task list

  // start project task list
  setTableProjectTask(type) {
    this.tableProjectTask.data = {
      headings: this.generateHeadingsProjectTask(),
      columns: this.getTableColumnsProjectTask(type)
    };
    return true;
  }

  generateHeadingsProjectTask() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.projectTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsProjectTask(type) {
    let columns = [];
    this.projectTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsProjectTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, type)
          };
        } else if (key == 'time_left') {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: 'black', action: '' };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }
  // end project task list

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

    if (type == -101) {
      icons.push({ class: "fas fa-trash-alt", action: this.deleteTicket.bind(this, ticket, type), txt: '' });
    } else if (type == 101 || type == 103 || type == -102) {
      if ((ticket._status == 5 || ticket._status == -1)) {
        icons.push({ class: "fa fa-retweet", action: this.reactiveTicket.bind(this, ticket, type), txt: '' });
      } else {
        icons.push({ class: "fa fa-edit", action: this.editTicket.bind(this, ticket, type), txt: '' });
      }
    }
    if (type == 101 || type == -101) {
      icons.push({ class: "fa fa-link", action: this.createChildTicket.bind(this, ticket, type), txt: '' });
    }
    if ((ticket._status == 5 || ticket._status == -1)) {
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

  editTicket(ticket, type) {
    console.log("type:", type);
    let ticketEditData = {
      ticketId: ticket._tktid,
      statusId: ticket._status
    }
    this.common.params = { ticketEditData, title: "Change Ticket Status", button: "Edit" };
    const activeModal = this.modalService.open(TaskStatusChangeComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTaskByType(type);
      }
    });
  }

  deleteTicket(ticket, type) {
    if (ticket._refid) {
      let params = {
        taskId: ticket._refid,
      }
      this.common.params = {
        title: 'Delete Ticket ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('AdminTask/deleteTicket', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getTaskByType(type);
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  reactiveTicket(ticket, type) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: 0
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
              this.getTaskByType(type);
            }
            else {
              this.common.showError(res['data']);
            }
          },
            err => {
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

  ticketMessage(ticket, type) {
    console.log("type:", type);
    let ticketEditData = {
      ticketId: ticket._tktid,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      taskId: (ticket._tktype == 101 || ticket._tktype == 102) ? ticket._refid : null,
      taskType: ticket._tktype
    }
    this.common.params = { ticketEditData, title: "Ticket Comment", button: "Save" };
    const activeModal = this.modalService.open(TaskMessageComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => { });
  }

  createChildTicket(ticket, type) {
    this.common.params = { userList: this.adminList, parentTaskId: ticket._refid, parentTaskDesc: ticket.task_desc };
    const activeModal = this.modalService.open(TaskNewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTaskByType(-101);
        this.activeTab = 'TasksByMe';
      }
    });
  }

  searchAllCompletedTask() {
    console.log("searchTask:", this.searchTask);
    if (this.searchTask.startDate && this.searchTask.endDate) {
      let startDate = this.common.dateFormatter(this.searchTask.startDate);
      let endDate = this.common.dateFormatter(this.searchTask.endDate);
      this.getTaskByType(-102, startDate, endDate);
    } else {
      this.common.showError("Select start date and end date");
    }
  }

  showReminderPopup(ticket, type) {
    this.common.params = { ticketId: ticket._tktid, title: "Add Reminder", btn: "Set Reminder" };
    const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTaskByType(type);
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
        this.getTaskByType(type);
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
  }

  // start :todo list
  getTodoTaskList() {
    this.tableTaskTodoList.data = {
      headings: {},
      columns: []
    };
    this.api.get('AdminTask/getTodoTaskList.json')
      .subscribe(res => {
        console.log(res);
        if (res['code'] > 0) {
          this.taskTodoList = res['data'] || [];
          this.setTableTaskTodoList();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        console.error(err);
        this.common.showError();
      });
  }

  setTableTaskTodoList() {
    this.tableTaskTodoList.data = {
      headings: this.generateHeadingsTaskTodoList(),
      columns: this.getTableColumnsTaskTodoList()
    };
    return true;
  }

  generateHeadingsTaskTodoList() {
    let headings = {};
    for (var key in this.taskTodoList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsTaskTodoList() {
    let columns = [];
    this.taskTodoList.map(task => {
      let column = {};
      for (let key in this.generateHeadingsTaskTodoList()) {
        if (key == 'Completed' || key == 'completed') {
          column[key] = {
            value: task[key],
            action: this.updateTodoTask.bind(this, task),
            isCheckbox: true
          };
        } else {
          column[key] = { value: task[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  actionIconsToDo(task) {
    let icons = [
      { class: "fa fa-edit", action: this.updateTodoTask.bind(this, task), txt: '' },
    ];
    return icons;
  }

  updateTodoTask(task) {
    if (task._id) {
      let params = {
        todoTaskId: task._id,
        status: (task._status == 1) ? 0 : 1
      }
      this.common.loading++;
      this.api.post('AdminTask/updateTodoTask', params)
        .subscribe(res => {
          this.common.loading--;
          this.common.showToast(res['msg']);
          this.getTodoTaskList();
        }, err => {
          this.common.loading--;
          console.log('Error: ', err);
        });

    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  saveTaskTodo() {
    if (this.taskTodoForm.desc == '') {
      return this.common.showError("Description is missing")
    }
    else {
      const params = {
        date: (this.taskTodoForm.date) ? this.common.dateFormatter(this.taskTodoForm.date) : null,
        desc: this.taskTodoForm.desc,
        isUrgent: this.taskTodoForm.isUrgent,
        taskTodoId: this.taskTodoForm.taskTodoId
      }
      console.log("todo params:", params);
      this.common.loading++;
      this.api.post('AdminTask/addTodoTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['msg']);
            this.getTodoTaskList();
            this.taskTodoForm = {
              taskTodoId: null,
              desc: "",
              date: this.common.getDate(),
              isUrgent: false
            };
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
  //  end: todo list


}
