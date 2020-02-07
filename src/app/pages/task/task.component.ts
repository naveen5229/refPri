import { Component, OnInit, Directive } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NormalTask } from '../../classes/normal-task';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskStatusChangeComponent } from '../../modals/task-status-change/task-status-change.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
import { TaskNewComponent } from '../../modals/task-new/task-new.component';
import { AddProjectComponent } from '../../modals/add-project/add-project.component';

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
  // normalTask = new NormalTask('', new Date(), '', false);
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
  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal) {
    this.getTaskByType(101);
    this.getAllAdmin();
  }

  ngOnInit() { }

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
    this.common.params = { userList: this.adminList };
    const activeModal = this.modalService.open(TaskNewComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getTaskByType(-101);
        this.activeTab = 'TasksByMe';
      }
    });
  }

  // selectedNormalUser(event) {
  //   // console.log(event);
  //   this.userId = event.id;
  //   this.normalTask.userName = event.name;
  // }

  // saveUser() {
  //   // console.log(this.normalTask.userName, this.normalTask.date, this.normalTask.task, this.normalTask.isUrgent);
  //   if (this.normalTask.userName == '') {
  //     return this.common.showError("User Name is missing")
  //   }
  //   else if (this.normalTask.task == '') {
  //     return this.common.showError("Task  is missing")
  //   }
  //   else {
  //     const params = {
  //       userId: this.userId,
  //       date: this.common.dateFormatter(this.normalTask.date),
  //       task: this.normalTask.task,
  //       isUrgent: this.normalTask.isUrgent,
  //     }
  //     this.common.loading++;
  //     this.api.post('AdminTask/createNormalTask', params).subscribe(res => {
  //       console.log(res);
  //       this.common.loading--;
  //       this.normalTask = new NormalTask('', new Date(), '', false);
  //       this.getTaskByType(-101);
  //       this.activeTab = 'TasksByMe';
  //       this.common.showToast("Task Created Successfully..!")
  //     },
  //       err => {
  //         this.common.loading--;
  //         this.common.showError();
  //         console.log('Error: ', err);
  //       });
  //   }

  // }

  getTaskByType(type) {
    this.common.loading++;
    let params = {
      type: type
    }
    this.api.post("AdminTask/getTaskByType", params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableNormal();
      this.resetTableSchedule();
      this.resetTableAllCompleted();
      this.resetTableCCTask();
      this.resetTableProjectTask();
      if (type == 101) {
        this.normalTaskList = res['data'] || [];
        this.setTableNormal();
      } else if (type == -101) {
        this.scheduleMasterTaskList = res['data'] || [];
        this.setTableMasterSchedule();
      } else if (type == 103) {
        this.scheduledTaskList = res['data'] || [];
        this.setTableSchedule();
      } else if (type == -102) {
        this.allCompletedTaskList = res['data'] || [];
        this.setTableAllCompleted();
      } else if (type == -5) {
        this.ccTaskList = res['data'] || [];
        this.setTableCCTask();
      } else if (type == -6) {
        this.projectTaskList = res['data'] || [];
        this.setTableProjectTask();
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
  generateHeadingsNormal() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.normalTaskList[0]) {
      // console.log(key.charAt(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
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
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
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
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }

  setTableNormal() {
    this.tableNormal.data = {
      headings: this.generateHeadingsNormal(),
      columns: this.getTableColumnsNormal()
    };
    return true;
  }
  setTableMasterSchedule() {
    this.tableMasterSchedule.data = {
      headings: this.generateHeadingsMasterSchedule(),
      columns: this.getTableColumnsMasterSchedule()
    };
    return true;
  }
  setTableSchedule() {
    this.tableSchedule.data = {
      headings: this.generateHeadingsSchedule(),
      columns: this.getTableColumnsSchedule()
    };
    return true;
  }
  setTableAllCompleted() {
    this.tableAllCompleted.data = {
      headings: this.generateHeadingsAllCompleted(),
      columns: this.getTableColumnsAllCompleted()
    };
    return true;
  }

  generateHeadingsAllCompleted() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.allCompletedTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsAllCompleted() {
    let columns = [];
    this.allCompletedTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAllCompleted()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: (ticket._status == 5 || ticket._status == -1) ? '' : this.actionIcons(ticket, 103)
            icons: this.actionIcons(ticket, -102)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }

  getTableColumnsNormal() {
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
            // icons: (ticket._status == 5 || ticket._status == -1) ? '' : this.actionIcons(ticket, 101)
            icons: this.actionIcons(ticket, 101)
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
    return columns;

  }

  getTableColumnsMasterSchedule() {
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
            icons: this.actionIcons(ticket, -101)
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
    return columns;

  }

  getTableColumnsSchedule() {
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
            // icons: (ticket._status == 5 || ticket._status == -1) ? '' : this.actionIcons(ticket, 103)
            icons: this.actionIcons(ticket, 103)
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
    // console.log(columns);
    return columns;

  }

  // start cc task list
  setTableCCTask() {
    this.tableCCTask.data = {
      headings: this.generateHeadingsCCTask(),
      columns: this.getTableColumnsCCTask()
    };
    return true;
  }

  generateHeadingsCCTask() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.ccTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsCCTask() {
    let columns = [];
    this.ccTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsCCTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: (ticket._status == 5 || ticket._status == -1) ? '' : this.actionIcons(ticket, 103)
            icons: this.actionIcons(ticket, -5)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }
  // end cc task list

  // start project task list
  setTableProjectTask() {
    this.tableProjectTask.data = {
      headings: this.generateHeadingsProjectTask(),
      columns: this.getTableColumnsProjectTask()
    };
    return true;
  }

  generateHeadingsProjectTask() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.projectTaskList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsProjectTask() {
    let columns = [];
    this.projectTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsProjectTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(ticket, -6)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(ticket[key]) : ticket[key], class: 'black', action: '' };
        }
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
    }

    if (type == -101) {
      icons.push({ class: "fas fa-trash-alt", action: this.deleteTicket.bind(this, ticket, type), txt: '' });
    } else if (type == 101 || type == 103 || type == -102) {
      if ((ticket._status == 5 || ticket._status == -1)) {
      } else {
        icons.push({ class: "fa fa-edit", action: this.editTicket.bind(this, ticket, type), txt: '' });
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


}
