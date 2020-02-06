import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';

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
  loginUserId = this.userService._details.id;
  lastMsgId = 0;
  constructor(public activeModal: NgbActiveModal, public api: ApiService,
    public common: CommonService, public userService: UserService) {
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.ticketId = this.common.params.ticketEditData.ticketId;
      this.statusId = this.common.params.ticketEditData.statusId;
      this.getMessageList();
    }

    console.log("user_details:", this.userService._details)
  }

  ngOnInit() { }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  getMessageList() {
    // if (this.messageList.length == 0) {
    this.showLoading = true;
    // }
    // this.messageList = [];
    let params = {
      ticketId: this.ticketId
    }
    this.api.post('AdminTask/getTicketMessage', params).subscribe(res => {
      this.showLoading = false;
      console.log("messageList:", res['data']);
      if (res['success']) {
        this.messageList = res['data'] || [];
        if (this.messageList.length > 0) {
          let lastMsgIdTemp = this.messageList[this.messageList.length - 1]._id;
          if (this.lastMsgId != lastMsgIdTemp) {
            this.lastMsgId = lastMsgIdTemp;
            this.lastMessageRead();
          }
          console.log("lastMsgId:", this.lastMsgId);
          console.log("lastMsgIdTemp:", lastMsgIdTemp);
        }
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
  lastMessageRead() {
    let params = {
      ticketId: this.ticketId,
      comment_id: this.lastMsgId
    }
    this.api.post('AdminTask/readLastMessage', params).subscribe(res => {
      console.log("messageList:", res['data']);
      if (res['code'] > 0) {

      } else {
        this.common.showError(res['msg'])
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
        if (res['code'] > 0) {
          this.taskMessage = "";
          // this.common.showToast("Comment save Successfully..!")
          // this.closeModal(true);
          this.getMessageList();
        }
        else {
          this.common.showError(res['msg'])
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
