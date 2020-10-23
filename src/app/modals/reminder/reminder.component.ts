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
  title = "Reminder";
  ticketId = null;
  reminder = {
    date: '',
    time: '16'
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
  dateTime: any = "";//new Date(); //for datetime popup
  fromPage;

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.btn = this.common.params.btn;
      this.ticketId = this.common.params.ticketId;
      this.fromPage = this.common.params.fromPage;
      this.dateTime = (this.common.params.remindertime) ? new Date(this.common.params.remindertime) : null;
    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({
      response: response
    });
  }

  // start:
  async saveReminder() {
    if (!this.reminder.date) {
      this.common.showError('Select A Date!');
      return;
    } else if (!this.reminder.time) {
      this.common.showError('Select An hour!');
      return;
    } else if (this.dateTime < this.common.getDate()) {
      this.common.showError('Reminder time must be future time');
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
    let apiName;
    if (this.fromPage && this.fromPage == "ticket") {
      apiName = 'Ticket/setTicketReminderTime.json';
    } else if (this.fromPage && this.fromPage == "trans") {
      apiName = 'Processes/setLeadReminderTime.json';
    } else if (this.fromPage && this.fromPage == "canpaign") {
      apiName = 'Campaigns/setLeadReminderTime.json';
    } else {
      apiName = 'AdminTask/setReminderTime.json';
    }
    this.common.loading++;
    this.api.post(apiName, params)
      .subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          this.closeModal(true);
          this.common.showToast(res['msg']);
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        console.error(err);
        this.common.showError();
        this.common.loading--;
      });
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
