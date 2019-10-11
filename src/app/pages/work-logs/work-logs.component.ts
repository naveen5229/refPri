import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorkLogComponent } from '../../modals/work-log/work-log.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { ignoreElements } from 'rxjs/operators';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-work-logs',
  templateUrl: './work-logs.component.html',
  styleUrls: ['./work-logs.component.scss']
})
export class WorkLogsComponent implements OnInit {

  workLogs = [];
  reviewWorkLogs=[];
  completeWorkLogs=[];
  remark='';
  activeTab = 'Pending WorkLogs';
  taskStatus=null;

  constructor(public modalService: NgbModal,
    public api: ApiService,
    public common: CommonService) {
    //this.getWorkLogs();
    this.getWorkLogs1();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh(){
    this.getWorkLogs1();
  }


  addWorkLogs(workLogs?) {
    this.common.params={
      workLogs:workLogs
    }
    
   // workLogs && (this.common.params['workLogs'] = workLogs);
    const activeModal = this.modalService.open(WorkLogComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data) {
        this.getWorkLogs1();
      }
    });
  }

  // getWorkLogs() {
  //   this.common.loading++;
  //   this.api.get("WorkLogs/getAllWorkLogs")
  //     .subscribe(res => {
  //       this.common.loading--;
  //       console.log("res", res['data'])
  //       this.workLogs = res['data'];
  //       this.formateWorkingTime();
  //       console.log("data", this.workLogs);
  //     }, err => {
  //       this.common.loading--;
  //       this.common.showError();
  //       console.log('Error: ', err);
  //     });
  // }

  getWorkLogs1() {
    this.common.loading++;
    this.api.get("WorkLogs/getworkLogsWrtStatus")
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data'])
        this.workLogs = res['data']['completed'];
        this.reviewWorkLogs=res['data']['pending_reviewed'];
        this.completeWorkLogs=res['data']['reviewed'];
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
      let hour:any = Math.floor((workLogs['total_minutes'] / 60));
      console.log("min",min,hour);
      if (min <= 9) min = "0" + min;
      if (hour <= 9) hour = "0" + hour;
      workLogs['total_minutes'] = hour + ":" + min;
    });
    this.reviewWorkLogs.map(reviewWorkLogs => {
      let min:any = reviewWorkLogs['total_minutes'] % 60;
      let hour:any = (reviewWorkLogs['total_minutes'] / 60).toFixed(0);
      if (min <= 9) min = "0" + min;
      if (hour <= 9) hour = "0" + hour;
      reviewWorkLogs['total_minutes'] = hour + ":" + min;
    });
    this.completeWorkLogs.map(completeWorkLog => {
      let min:any = completeWorkLog['total_minutes'] % 60;
      let hour:any = (completeWorkLog['total_minutes'] / 60).toFixed(0);
      if (min <= 9) min = "0" + min;
      if (hour <= 9) hour = "0" + hour;
      completeWorkLog['total_minutes'] = hour + ":" + min;
    });
  }

  deleteWorkLog(workLog, rowIndex) {

    this.common.params = {
      title: 'Confirm Model',
      description: 'are you sure you want to delete this worklogs?',
      btn2: "No",
      btn1: 'Yes'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {
        let params = {
          id: workLog.id
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
    })
    
  }

  changeWorkLogStatus(workLog){
    if(this.taskStatus==null){
      this.common.showError("please enter Review Status");
    }else if(this.remark ==''){
      this.common.showError("Please Enter review remark");
    }else{
      this.common.loading++;
      let params={
        status:this.taskStatus,
        remark:this.remark,
        workLogId:workLog.id
      }
      this.api.post("WorkLogs/updateWorkLogsStatus",params)
        .subscribe(res => {
          this.common.loading--;
          console.log("res", res['data']);
          this.getWorkLogs1();
        },
          err => {
            this.common.loading--;
            this.common.showError();
            console.log('Error: ', err);
          });
    }
  }


}
