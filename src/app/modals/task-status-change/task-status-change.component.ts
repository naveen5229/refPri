import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-task-status-change',
  templateUrl: './task-status-change.component.html',
  styleUrls: ['./task-status-change.component.scss']
})
export class TaskStatusChangeComponent implements OnInit {
  taskStatus = 0;
  ticketId = 0;
  title = '';
  remark = '';
  constructor(public activeModal: NgbActiveModal, public api: ApiService,
    public common: CommonService) {
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.ticketId = this.common.params.ticketEditData.ticketId;
      this.taskStatus = this.common.params.ticketEditData.statusId;
    }
  }

  ngOnInit() { }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  updateTicket() {
    this.common.loading++;
    let params = {
      ticketId: this.ticketId,
      statusId: this.taskStatus
    }
    this.api.post('AdminTask/updateTicketStatus', params).subscribe(res => {
      this.common.loading--;
      if (res['success']) {
        // this.common.showToast("Task Created Successfully..!")
        this.closeModal(true);
      }
      else {
        this.common.showError(res['data'])
      }
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
}
