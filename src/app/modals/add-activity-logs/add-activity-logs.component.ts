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
    hour: new Date()
  }

  isSubmit = false;

  maxdate = new Date();
  mindate = new Date();


  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.mindate.setDate(this.mindate.getDate() - 2)
    this.activity.hour.setHours(0);
    this.activity.hour.setMinutes(0);
    this.activity.hour.setSeconds(0);

  }

  ngOnInit() {
  }

  saveActivityLog() {
    let params = {
      description: this.activity.desc,
      contactPerson: this.activity.contact,
      outcome: this.activity.outcome,
      date: this.common.dateFormatter(this.activity.date),
      spendHours: this.common.timeFormatter(this.activity.hour),
    }
    if (this.activity.desc == null) {
      this.common.showError('Enter Description');
    }else if (this.activity.contact == null) {
      this.common.showError('Enter Contatc Person');
    } else if (this.activity.outcome == null) {
      this.common.showError('Enter Outcome');
    } else {
      this.common.loading++;
      this.api.post('Admin/saveActivityLog', params)
        .subscribe(res => {
          this.common.loading--;
          if(res['code']===0) { this.common.showError(res['msg']); return false;};
          this.common.showToast('Success');
          this.isSubmit = true;
          this.refreshForm();
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
      hour: new Date()
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
