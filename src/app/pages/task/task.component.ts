import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {

  activeTab = 'Normal Task';
  task_type = 1;
  normalTask = {
    userName: '',
    date: new Date(),
    task: '',
    isUrgent: false
  };
  scheduledTask = {
    description: '',
    primaryUser: '',
    escalationUser: '',
    reportingUser: '',
    logicType: null,
    scheduleParam: null,
    days: '',
    hours: ''
  };
  normalTaskList = [];
  scheduledTaskList = [];
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
    this.normalTask.userName = event.name;
  }
  selectedPrimarUser(event) {
    console.log(event);
    this.scheduledTask.primaryUser = event.name;
  }
  selectedEscalationUser(event) {
    console.log(event);
    this.scheduledTask.escalationUser = event.name;
  }
  selectedReportingUser(event) {
    console.log(event);
    this.scheduledTask.reportingUser = event.name;
  }

  saveUser(buttonType) {
    if (buttonType == "normalTask") {
      console.log(this.normalTask.userName, this.normalTask.date, this.normalTask.task, this.normalTask.isUrgent);

      const params = {
        userName: this.normalTask.userName,
        date: this.normalTask.date,
        task: this.normalTask.task,
        isUrgent: this.normalTask.isUrgent,
      }
      this.common.loading++;
      this.api.post('Admin/createNormalTask', params).subscribe(res => {
        this.common.loading--;
        // this.getTask()
        this.common.showToast(res['msg'])
      },
        err => {
          this.common.loading--;
  
          this.common.showError();
          console.log('Error: ', err);
        });
    }
    else if (buttonType == "scheduledTask" ) {
      console.log(this.scheduledTask.description, this.scheduledTask.primaryUser, 
        this.scheduledTask.escalationUser, this.scheduledTask.reportingUser, this.scheduledTask.logicType,
        this.scheduledTask.scheduleParam, this.scheduledTask.days, this.scheduledTask.hours);
      const params = {
        description: this.scheduledTask.description,
        primaryUser: this.scheduledTask.primaryUser,
        escalationUser: this.scheduledTask.escalationUser,
        reportingUser: this.scheduledTask.reportingUser,
        logicType: this.scheduledTask.logicType,
        scheduleParam: this.scheduledTask.scheduleParam,
        days: this.scheduledTask.days,
        hours: this.scheduledTask.hours
      }
      this.common.loading++;
      this.api.post('Admin/createScheduleTask', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        // this.getTask()
        this.common.showToast(res['msg'])
      },
        err => {
          this.common.loading--;
  
          this.common.showError();
          console.log('Error: ', err);
        });
    }    

  }

  getNormalTask() {
    this.common.loading++;
    this.api.get("Admin/getNormalTask").subscribe(res => {
      this.common.loading--;
      console.log("data", res['data'])
      // this.normalTaskList = res['data']["AssignForMe"] || [];
     
      
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
      // this.normalTaskList = res['data']["AssignForMe"] || [];
     
      
      //  this.endDate=new Date(this.common.dateFormatter(this.pendingReview[0]['review_time']));
      //  console.log("************",this.endDate)

    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
}
