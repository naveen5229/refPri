import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-task-schedule-new',
  templateUrl: './task-schedule-new.component.html',
  styleUrls: ['./task-schedule-new.component.scss']
})
export class TaskScheduleNewComponent implements OnInit {
  scheduledTask = {
    taskId: null,
    logicType: 1,
    scheduleParam: 1,
    // days: "",
    // hours: "",
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
  scheduledTaskParamList = [];
  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.scheduledTask.taskId = this.common.params.taskId;
      this.getScheduledTaskParam();
    }
    this.createScheduleParams();
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

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
  saveTaskParam() {
    if (this.scheduledTask.logicType < 0) {
      return this.common.showError("Logic Type is missing")
    }
    else if (this.scheduledTask.scheduleParam < 0) {
      return this.common.showError("Schedule Param is missing")
    }
    // else if (this.scheduledTask.days == '') {
    //   return this.common.showError("Day is missing")
    // }
    // else if (this.scheduledTask.hours == '') {
    //   return this.common.showError("Hour is missing")
    // }
    else {
      const params = {
        taskId: this.scheduledTask.taskId,
        logicType: this.scheduledTask.logicType,
        scheduleParam: this.scheduledTask.scheduleParam,
        // days: this.scheduledTask.days,
        // hours: this.scheduledTask.hours
      }
      this.common.loading++;
      this.api.post('AdminTask/addScheduledTaskParam', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          // if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['msg'])
          this.scheduledTask.logicType = 1;
          this.scheduledTask.scheduleParam = 1;
          // this.scheduledTask.days = "";
          // this.scheduledTask.hours = "";
          this.getScheduledTaskParam();
          // } else {
          //   this.common.showError(res['data'][0].y_msg)
          // }
        } else {
          this.common.showError(res['msg']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }
  }

  getScheduledTaskParam() {
    let param = {
      taskId: this.scheduledTask.taskId
    }
    this.api.post("AdminTask/getScheduledTaskParam.json", param).subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.scheduledTaskParamList = res['data'] || [];
        this.setTableAckScheduledTask();
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  tableAckScheduleTaskParam = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  // start ack scheduled task
  setTableAckScheduledTask() {
    this.tableAckScheduleTaskParam.data = {
      headings: this.generateHeadingsAckScheduledTask(),
      columns: this.getTableColumnsAckScheduledTask()
    };
    return true;
  }
  generateHeadingsAckScheduledTask() {
    let headings = {};
    for (var key in this.scheduledTaskParamList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }

  getTableColumnsAckScheduledTask() {
    let columns = [];
    this.scheduledTaskParamList.map(task => {
      let column = {};
      for (let key in this.generateHeadingsAckScheduledTask()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(task)
          };
        } else {
          column[key] = { value: (key == 'time_left') ? this.common.findRemainingTime(task[key]) : task[key], class: 'black', action: '' };
        }

      }
      columns.push(column);
    });
    console.log(columns);
    return columns;
  }
  // end ack scheduled task

  actionIcons(task) {
    let icons = [
      { class: "fas fa-trash-alt", action: this.deleteScheduleTaskParam.bind(this, task) },
    ];
    return icons;
  }

  deleteScheduleTaskParam(task) {
    if (task._id) {
      let params = {
        taskActionId: task._id,
      }
      this.common.params = {
        title: 'Delete Task Param ',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('AdminTask/deleteTaskAction', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getScheduledTaskParam();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Task Action ID Not Available");
    }
  }

}
