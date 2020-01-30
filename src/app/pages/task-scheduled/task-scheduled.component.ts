import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { ScheduleTask } from '../../classes/schedule-task'

@Component({
  selector: 'ngx-task-scheduled',
  templateUrl: './task-scheduled.component.html',
  styleUrls: ['./task-scheduled.component.scss']
})
export class TaskScheduledComponent implements OnInit {
  activeTab = 'ScheduledTaskMaster';
  primaryId = null;
  escalationId = null;
  reportingId = null;
  scheduledTask = new ScheduleTask('', '', '', '', null, null, '', '');
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
  constructor(public common: CommonService, public api: ApiService) {
    this.getScheduledTask();
  }

  ngOnInit() { }

  selectedPrimarUser(event) {
    console.log(event);
    this.scheduledTask.primaryUser = event.name;
    this.primaryId = event.id;
  }
  selectedEscalationUser(event) {
    console.log(event);
    this.scheduledTask.escalationUser = event.name;
    this.escalationId = event.id;
  }
  selectedReportingUser(event) {
    console.log(event);
    this.scheduledTask.reportingUser = event.name;
    this.reportingId = event.id;
  }

  saveUser() {
    console.log(this.scheduledTask.description, this.scheduledTask.primaryUser,
      this.scheduledTask.escalationUser, this.scheduledTask.reportingUser, this.scheduledTask.logicType,
      this.scheduledTask.scheduleParam, this.scheduledTask.days, this.scheduledTask.hours);

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
        this.scheduledTask = new ScheduleTask('', '', '', '', null, null, '', '');
        this.common.showToast('Task Created Successfully..!')
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
      console.log(this.scheduledTaskList);
      this.setTableSchedule();
      console.log(this.tableSchedule);
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getAllTask() {
    this.common.loading++;
    let params = {//all task for admin
      type: -1
    }
    this.api.post("AdminTask/getTaskByType", params).subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableAllTask();
      this.allTaskList = res['data'] || [];
      console.log(this.allTaskList);
      this.setTableAllTask();
      console.log(this.tableAllTask);
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
    console.log(headings);
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
          column[key] = { value: ticket[key], class: 'black', action: '' };
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
    console.log(headings);
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
            // icons: this.actionIcons(pending)
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

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }


}