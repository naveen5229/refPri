import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
@Component({
  selector: 'ngx-add-activity-logs',
  templateUrl: './add-activity-logs.component.html',
  styleUrls: ['./add-activity-logs.component.scss']
})
export class AddActivityLogsComponent implements OnInit {
  activity = {
    desc: null,
    contact: null,
    outcome: null,
    date: new Date(),
    hour: new Date(),
    requestId: null,
    refId: null
  }
  isSubmit = false;
  maxdate = new Date();
  mindate = new Date();
  timeValidity = false;
  oldTime = new Date()

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.mindate.setDate(this.mindate.getDate() - 2)
    let time = [];
    if (this.common.params.isEdit) {
      time = this.common.params.isEdit.spend_hour.split(':');
      this.timeValidity = true;
      this.activity = {
        desc: this.common.params.isEdit.description,
        contact: this.common.params.isEdit.contact_person,
        outcome: this.common.params.isEdit.outcome,
        date: new Date(this.common.params.isEdit.addtime),
        hour: new Date(),
        requestId: this.common.params.isEdit._id,
        refId: (this.common.params.isEdit._refid>0) ? this.common.params.isEdit._refid : null
      }
    }

    this.activity.hour.setHours((time.length) ? parseInt(time[0]) : 0);
    this.activity.hour.setMinutes((time.length) ? parseInt(time[1]) : 0);
    this.activity.hour.setSeconds(0);
    this.oldTime.setHours(parseInt(time[0]));
    this.oldTime.setMinutes(parseInt(time[1]));
    this.oldTime.setSeconds(0);
  }

  ngOnInit() {
  }

  saveActivityLog() {
    // let params = {
    //   description: this.activity.desc,
    //   contactPerson: this.activity.contact,
    //   outcome: this.activity.outcome,
    //   date: this.common.dateFormatter(this.activity.date),
    //   spendHours: this.common.timeFormatter(this.activity.hour),
    //   requestId: this.activity.requestId
    // }

    let params = {
      refid: null,
      reftype: null,
      endTime: null,
      isHold: null,
      progressPer: null,
      requestId: this.activity.requestId,
      startTime: (this.activity.date) ? this.common.dateFormatter(this.activity.date) : null,
      outcome: this.activity.outcome,
      spendHours: this.common.timeFormatter(this.activity.hour),
      description: this.activity.desc,
      contactPerson: this.activity.contact,
    };
    if (this.activity.desc == null || this.activity.desc.trim() == "") {
      this.common.showError('Enter Description');
    } else if (!this.activity.refId && this.activity.contact == null || this.activity.contact.trim() == "" || !this.activity.refId && this.activity.contact.trim() == "") {
      this.common.showError('Enter Contact Person');
    } else if (!this.activity.refId && this.activity.outcome == null || this.activity.outcome.trim() == "" || !this.activity.refId && this.activity.outcome.trim() == "") {
      this.common.showError('Enter Outcome');
    } else if (this.timeValidity && this.activity.hour > this.oldTime) {
      this.common.showError('Spend Time Can Not Be Increased From The Last Saved Time');
      this.activity.hour = this.oldTime;
    } else if (this.activity.hour.getHours() == 0 && this.activity.hour.getMinutes() == 0){
           this.common.showError('Spend Time can not be zero');
     } else {
      // return console.log('params', params);
      this.common.loading++;
      this.api.post('Admin/saveActivityLogByRefId', params)
        .subscribe(res => {
          this.common.loading--;
          if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
          if (res["code"] > 0) {
            if (res['data'][0]['y_id'] > 0) {
              this.common.showToast(res['data'][0]['y_msg']);
              // this.common.showToast('Success');
              this.timeValidity = false;
              this.isSubmit = true;
              this.refreshForm();
            } else {
              this.common.showError(res['data'][0]['y_msg']);
            }
          } else {
            this.common.showError(res["msg"]);
          }
        }, err => {
          this.common.loading--;
          console.error(err);
          this.common.showError();
        });
    }
  }

  refreshForm() {
    this.activity = {
      desc: null,
      contact: null,
      outcome: null,
      date: this.activity.date,
      hour: new Date(),
      requestId: null,
      refId: null
    };
    this.activity.hour.setHours(0);
    this.activity.hour.setMinutes(0);
    this.activity.hour.setSeconds(0);
  }

  closeModal(response) {
    if (this.isSubmit) {
      this.activeModal.close(true);
    } else {
      this.activeModal.close(false);
    }
  }

}
