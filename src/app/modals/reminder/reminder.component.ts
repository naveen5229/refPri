import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-reminder',
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.scss']
})
export class ReminderComponent implements OnInit {
  btn = 'Set Reminder';
  title = "Add Reminder";
  ticketId = null;
  reminder = {
    date: '',
    time: ''
  };
  dates = [{
    name: 'Today',
    date: this.common.getDate(),
  }, {
    name: 'Tomorrow',
    date: this.common.getDate(1)
  }, {
    name: 'Tomorrow + 1',
    date: this.common.getDate(2)
  }];
  hours = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24]
  ];
  showHours = false;
  dateTime = new Date(); //for datetime popup
  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.btn = this.common.params.btn;
      this.ticketId = this.common.params.ticketId;
    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({
      response: response,
      data: this.reminder
    });
  }

  // start:
  async saveReminder(data) {
    if (!this.reminder.date) {
      this.common.showToast('Select A Date!');
      return;
    } else if (!this.reminder.time) {
      this.common.showToast('Select An hour!');
      return;
    }
    if (this.common.params.returnData) {
      this.closeModal(true);
      return;
    }

    const params = {
      ticket_id: this.ticketId,
      remindtime: this.common.dateFormatter(this.reminder.date).split(' ')[0] + ' ' + (this.reminder.time < '10' ? '0' + this.reminder.time : this.reminder.time) + ':00'
    };
    console.log('Params: ', params);
    this.common.loading++;
    this.api.post('AdminTask/setReminderTime.json', params)
      .subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.closeModal(true);
        }
        this.common.showToast(res['msg']);
      }, err => {
        console.error(err);
        this.common.showError();
        this.common.loading--;
      });
  }

  getDate() {
    // this.datePicker.show({
    // titleText: 'Select Time',
    // okText: 'Save',
    // todayText: "Today",
    // date: new Date(),
    // minDate: new Date(),
    // mode: 'datetime',
    // allowOldDates: false,
    // androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_DARK
    // }).then(
    // date => {
    // console.log('Got date: ', date);
    // this.reminder.date = this.common.dateFormatter(date);
    // this.showHours = true;
    // },
    // err => {
    // console.log('Error occurred while getting date: ', err);
    // this.common.showToast('Error occurred while getting date: ' + err);
    // }
    // );
  }

  onChangeDate(event) {
    if (event) {
      this.reminder.date = this.common.dateFormatter(event, "DDMMYYYY", false);
      let tempTime = this.common.timeFormatter(event);
      this.reminder.time = tempTime.split(":")[0];
      console.log("on change reminder:", this.reminder);
    }
  }
  onChangeHour() {
    let temp = this.common.dateFormatter(this.reminder.date, "DDMMYYYY", false) + " " + this.reminder.time + ":00";
    console.log("temp:", temp);
    let tempDate = new Date(temp);
    this.dateTime = tempDate;
    console.log("tempDate:", tempDate);
  }
  // end: 

}
