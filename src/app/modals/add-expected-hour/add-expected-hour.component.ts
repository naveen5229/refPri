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
  timePickerModal = false;
  addForm = {
    refId: null,
    refType: null,
    expectedHour: new Date(),
    remark: null,
    requestId: null,
  }
  selectedTime = { hh: '4', mm: '0' };
  showHours = false;
  hours = [];
  minutes = [];
  customTargetTime = ['00:30', '01:00', '03:00', '05:00'];

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    for (let i = 1; i <= 24; i++) {
      this.hours.push(`${i}`);
    }
    for (let i = 0; i < 60; i++) {
      if (i % 5 == 0) {
        this.minutes.push(`${i}`);
      }
    }

    this.title = (this.common.params.title) ? this.common.params.title : this.title;
    this.addForm.refType = this.common.params.refType;
    this.addForm.refId = this.common.params.refId;
    this.addForm.requestId = (this.common.params.requestId > 0) ? this.common.params.requestId : null;
    this.timePickerModal = this.common.params.timePickFromModal;
    if (this.timePickerModal) {
      this.setExptTimeFromCustomSelection(this.selectedTime.hh, 'hr');
    } else {
      if (this.common.params.data.expected_hour) this.setExptTime(this.common.params.data.expected_hour, this.customTargetTime.indexOf(this.common.params.data.expected_hour));
    }

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

  openTimePickerModal() {
    this.showHours = true;
    document.getElementById('timePickerModalCustom').style.display = 'block';
  }

  closeTimePickerModal() {
    document.getElementById('timePickerModalCustom').style.display = 'none';
  }

  setExptTime(event, index) {
    this.activeTime = index;
    let time = event.split(':');
    let date = new Date();
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    this.addForm.expectedHour = date;
  }

  setExptTimeFromCustomSelection(value, type) {
    if (type === 'hr') {
      this.addForm.expectedHour.setHours(value);
      this.showHours = false;
    }
    if (type === 'min') {
      this.addForm.expectedHour.setMinutes(value);
      this.closeTimePickerModal();
    }
  }
}
