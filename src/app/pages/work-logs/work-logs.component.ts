import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkLogComponent } from '../../modals/work-log/work-log.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { ignoreElements } from 'rxjs/operators';

@Component({
  selector: 'ngx-work-logs',
  templateUrl: './work-logs.component.html',
  styleUrls: ['./work-logs.component.scss']
})
export class WorkLogsComponent implements OnInit {

  workLogs = [];

  constructor(public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {
    this.getWorkLogs();
  }

  ngOnInit() {
  }

  addWorkLogs() {
    const activeModal = this.modalService.open(WorkLogComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getWorkLogs();
      }
    });
  }

  getWorkLogs() {
    this.common.loading++;
    this.api.get("WorkLogs/getAllWorkLogs")
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data'])
        this.workLogs = res['data'];
        this.formateWorkingTime();
        console.log("data", this.workLogs);
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  formateWorkingTime() {
    this.workLogs.map(workLogs => {
      let min:any = workLogs['total_minutes'] % 60;
      let hour:any = (workLogs['total_minutes'] / 60).toFixed(0);
      if (min <= 9) min = "0" + min;
      if (hour <= 9) hour = "0" + hour;
      workLogs['total_minutes'] = hour + ":" + min;
    });
  }

  deleteWorkLog(taskId, rowIndex) {
    let params = {
      taskId: taskId
    };
    console.log("TaskId", params);
    this.common.loading++;
    this.api.post('WorkLogs/deleteWorkLogs', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res);
        if (res['success']) {
          this.common.showToast(res['msg']);
          this.workLogs.splice(rowIndex, 1);
          // this.getWorkLogs();
        }
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

}
