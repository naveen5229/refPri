import { ɵNullViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-add-expected-hour',
  templateUrl: './add-expected-hour.component.html',
  styleUrls: ['./add-expected-hour.component.scss']
})
export class AddExpectedHourComponent implements OnInit {
  title = "Add Expected Hous";
  activeTime = null;
  addForm = {
    refId: null,
    refType: null,
    expectedHour: new Date(),
    remark: null,
    requestId: null,
  }
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = (this.common.params.title) ? this.common.params.title : this.title;
    this.addForm.refType = this.common.params.refType;
    this.addForm.refId = this.common.params.refId;
    this.addForm.requestId = (this.common.params.requestId > 0) ? this.common.params.requestId : null;
  }

  ngOnInit() { }

  closeModal(res, expectedHour = null) {
    this.activeModal.close({ response: res, expectedHour: expectedHour });
  }

  saveUserExpectedHour() {
    let params = {
      refId: this.addForm.refId,
      refType: this.addForm.refType,
      expectedHour: (this.addForm.expectedHour) ? this.common.timeFormatter(this.addForm.expectedHour) : null,
      remark: this.addForm.remark,
      requestId: this.addForm.requestId
    };
    if (!this.addForm.expectedHour) {
      this.common.showError('Expected Hour is missing');
      return false;
    }
    // return console.log('params', params);
    this.common.loading++;
    this.api.post('Admin/saveUserExpectedHour', params)
      .subscribe(res => {
        this.common.loading--;
        if (res["code"] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0]['y_msg']);
            this.closeModal(true, params.expectedHour);
          } else {
            this.common.showError(res['data'][0]['y_msg']);
          }
        } else {
          this.common.showError(res["msg"]);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
      });
  }

  setExptTime(event) {
    let time = event.split(':');
    let date = new Date();
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    this.addForm.expectedHour = date;
  }
}
