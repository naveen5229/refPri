import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-task-assign',
  templateUrl: './task-assign.component.html',
  styleUrls: ['./task-assign.component.scss']
})

export class TaskAssignComponent implements OnInit {
 taskList=[];
 module=null;
 title=null
 description=null
 assigner=null
 assigned=null
  constructor(public common:CommonService,
    public api:ApiService) {
      this.getTaks()
     }

  ngOnInit() {
  }
  saveUser() {
    const params = {
      module_id:this.module,
title:this.title,
description:this.description,
assignee_emp_id:this.assigner,
assigned_emp_id:this.assigned,
assign_time: '2019-06-2'
    }
    this.common.loading++;
    this.api.post('Task/addTask', params).subscribe(res => {
    this.common.loading--;
    this.getTaks()
      this.common.showToast(res['msg'])
    },
    err => {
      this.common.loading--;

      this.common.showError();
    console.log('Error: ', err);
    });
  }

  getTaks(){
    this.common.loading++;
   
    this.api.get("Task/getAllTask").subscribe(res =>{
      this.common.loading--;
      console.log("data",res['data'])

      this.taskList=res['data'] || [];
    },
    err => {
            this.common.loading--;

      this.common.showError();
    console.log('Error: ', err);
    });
    }

editTask(){
  this.module=this.taskList['module_id'];
  // this.title,
  // this.description,
  // this.assigner,
  // this.assigned,
}

deleteTask(){
 const  params={
taskId:this.taskList[0].id
  }
  console.log("id",params)

this.common.loading++;
    this.api.post('Task/deleteTask', params).subscribe(res => {
    this.common.loading--;
    this.getTaks()
      this.common.showToast(res['msg'])
    },
    err => {
      this.common.loading--;

      this.common.showError();
    console.log('Error: ', err);
    });
  }
}
