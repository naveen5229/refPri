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

  maxdate = new Date();
  mindate = new Date();


  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) { 
      this.mindate.setDate(this.mindate.getDate() - 2)

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

    console.log(params);
    if (this.activity.desc == null) {
      this.common.showError('Enter Description');
    }
    else if (this.activity.contact == null) {
      this.common.showError('Enter Contatc Person');
    } else if (this.activity.outcome == null) {
      this.common.showError('Enter Outcome');
    } else {
      this.common.loading++;
      this.api.post('Admin/saveActivityLog', params)
        .subscribe(res => {
          this.common.loading--;
          console.log(res)         
            this.common.showToast('Success');
            this.closeModal(true);
          
        }, err => {
          this.common.loading--;
          console.error(err);
          this.common.showError(err);
        });
    }
  }

  closeModal(response) {
    this.activeModal.close(response);
  }

}
