import { Component, OnInit, Directive } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NormalTask } from '../../classes/normal-task'
import { ScheduleTask } from '../../classes/schedule-task'


@Component({
  selector: 'ngx-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  activeTab = 'Normal Task';
  task_type = 1;
  userId = null;
  primaryId = null;
  escalationId = null;
  reportingId = null;
   normalTask = new NormalTask('', new Date(), '', false) ;
  scheduledTask = new ScheduleTask('', '', '', '', null, null, '', '');
  normalTaskList = [];
  scheduledTaskList = [];
  scheduleMasterTaskList = [];

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
  constructor( public common: CommonService, public api: ApiService) { 
                 this.getNormalTask();
               }

  ngOnInit() {
  }
  getTaskType() {
    console.log(this.task_type);
  }
  selectedNormalUser(event) {
    console.log(event);
    this.userId = event.id;
    this.normalTask.userName = event.name;
  }
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

  saveUser(buttonType) {
    if (buttonType == "normalTask") {
      console.log(this.normalTask.userName, this.normalTask.date, this.normalTask.task, this.normalTask.isUrgent);
      if (this.normalTask.userName == '') {
        return this.common.showError("User Name is missing")
      }
      
      else if (this.normalTask.task == '') {
        return this.common.showError("Task  is missing")
  
      }
      else {
  
      const params = {
        userId: this.userId,
        date: this.common.dateFormatter(this.normalTask.date),
        task: this.normalTask.task,
        isUrgent: this.normalTask.isUrgent,
      }
      this.common.loading++;
      this.api.post('Admin/createNormalTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        this.normalTask = new NormalTask('', new Date(), '', false);
        this.getNormalTask()
        this.common.showToast("Task Created Successfully..!")
      },
        err => {
          this.common.loading--;
  
          this.common.showError();
          console.log('Error: ', err);
        });
      }
    }
    else if (buttonType == "scheduledTask" ) {
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
      this.api.post('Admin/createScheduleTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        this.scheduledTask = new ScheduleTask('', '', '', '', null, null, '', '');        
        
        // this.getTask()
        this.common.showToast('Task Created Successfully..!')
      },
        err => {
          this.common.loading--;
  
          this.common.showError();
          console.log('Error: ', err);
        });
    }    
  }
  }

  getNormalTask() {
    this.common.loading++;
    this.api.get("Admin/getNormalTask").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableNormal();
      this.resetTableSchedule();
      this.normalTaskList = res['data'] || [];
      
      this.setTableNormal();
      
      //  this.endDate=new Date(this.common.dateFormatter(this.pendingReview[0]['review_time']));
      //  console.log("************",this.endDate)

    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getMasterScheduledTask() {
    this.common.loading++;
    this.api.get("Admin/getScheduledTaskForUser").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableNormal();
      this.resetTableSchedule();
      this.scheduleMasterTaskList = res['data'] || [];
      
      this.setTableMasterSchedule();

     
      
      //  this.endDate=new Date(this.common.dateFormatter(this.pendingReview[0]['review_time']));
      //  console.log("************",this.endDate)

    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getScheduledTask() {
    this.common.loading++;
    this.api.get("Admin/getScheduledTask").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      this.resetTableMasterSchedule();
      this.resetTableNormal();
      this.resetTableSchedule();
      this.scheduledTaskList = res['data'] || [];
      console.log(this.scheduledTaskList);
      
      this.setTableSchedule();
      console.log(this.tableSchedule);

     
      
      //  this.endDate=new Date(this.common.dateFormatter(this.pendingReview[0]['review_time']));
      //  console.log("************",this.endDate)

    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }


  resetTableMasterSchedule() {
    this.tableNormal.data = {
      headings: {},
      columns: []
    };
  }
  resetTableSchedule() {
    this.tableNormal.data = {
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
    console.log(headings);
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

  getTableColumnsNormal() {
    console.log(this.generateHeadingsNormal());
    let columns = [];
    this.normalTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsNormal()) {
        if(key =="admin_name")
        {
          column[key] ={value:ticket[key], class:'admin',isHTML:true, action: ''}
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
    return columns;

  }


  getTableColumnsMasterSchedule() {
    console.log(this.generateHeadingsMasterSchedule());
    let columns = [];
    this.scheduleMasterTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsMasterSchedule()) {
        if(key =="admin_name")
        {
          column[key] ={value:ticket[key], class:'admin',isHTML:true, action: ''}
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
    return columns;

  }

  getTableColumnsSchedule() {
    console.log(this.generateHeadingsSchedule());
    let columns = [];
    this.scheduledTaskList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsSchedule()) {
        if(key =="admin_name")
        {
          column[key] ={value:ticket[key], class:'admin',isHTML:true, action: ''}
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


}
