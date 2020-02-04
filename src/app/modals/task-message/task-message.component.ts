import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-task-message',
  templateUrl: './task-message.component.html',
  styleUrls: ['./task-message.component.scss']
})
export class TaskMessageComponent implements OnInit {
  taskMessage = "";
  title = '';
  ticketId = 0;
  statusId = 0;
  messageList = [];
  showLoading = true;
  constructor(public activeModal: NgbActiveModal, public api: ApiService,
    public common: CommonService) {
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.ticketId = this.common.params.ticketEditData.ticketId;
      this.statusId = this.common.params.ticketEditData.statusId;
      this.getMessageList();
    }
  }

  ngOnInit() { }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  getMessageList() {
    this.showLoading = true;
    this.messageList = [];
    let params = {
      ticketId: this.ticketId
    }
    this.api.post('AdminTask/getTicketMessage', params).subscribe(res => {
      this.showLoading = false;
      console.log("messageList:", res['data']);
      if (res['success']) {
        this.messageList = res['data'] || [];
      } else {
        this.common.showError(res['data'])
      }
    },
      err => {
        this.showLoading = false;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  saveTicketMessage() {
    if (this.taskMessage == "") {
      return this.common.showError("Message is missing");
    } else {
      this.common.loading++;
      let params = {
        ticketId: this.ticketId,
        status: this.statusId,
        message: this.taskMessage
      }
      this.api.post('AdminTask/saveTicketMessage', params).subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.taskMessage = "";
          this.common.showToast("Comment save Successfully..!")
          // this.closeModal(true);
          this.getMessageList();
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

}
