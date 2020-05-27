import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
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
  // this page in from 3 pages change carefully
  @ViewChild('chat_block', { static: false }) private myScrollContainer: ElementRef;
  taskMessage = "";
  title = '';
  subTitle = null;
  ticketId = 0;
  statusId = 0;
  messageList = [];
  showLoading = true;
  loginUserId = this.userService._details.id;
  lastMsgId = 0;
  lastSeenId = 0;
  userListByTask = [];
  adminList = [];
  newCCUserId = null;
  taskId = null;
  ticketType = null;
  showAssignUserAuto = null;
  msgListOfMine = [];
  tabType = null;
  constructor(public activeModal: NgbActiveModal, public api: ApiService,
    public common: CommonService, public userService: UserService) {
    console.log("common params:", this.common.params);
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.subTitle = (this.common.params.subTitle) ? this.common.params.subTitle : null;
      if (this.common.params.fromPage == 'campaign') {
        this.ticketId = this.common.params.campaignEditData.ticketId;
        this.taskId = this.common.params.campaignEditData.camptargetid;
        this.statusId = this.common.params.campaignEditData.statusId;
        this.tabType = (this.common.params.campaignEditData.tabType) ? this.common.params.campaignEditData.tabType : null;
        this.lastSeenId = this.common.params.campaignEditData.lastSeenId;
        this.getLeadMessage();
        this.getAllUserByLead();
      } else {
        this.ticketId = this.common.params.ticketEditData.ticketId;
        this.statusId = this.common.params.ticketEditData.statusId;
        this.lastSeenId = this.common.params.ticketEditData.lastSeenId;
        this.taskId = this.common.params.ticketEditData.taskId;
        this.ticketType = this.common.params.ticketEditData.taskType;
        this.ticketType = this.common.params.ticketEditData.taskType;
        this.tabType = (this.common.params.ticketEditData.tabType) ? this.common.params.ticketEditData.tabType : null;
        this.getMessageList();
        this.getAllUserByTask();
      }
      this.getAllAdmin();
    }

    console.log("user_details:", this.userService._details)
  }

  ngOnInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

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
          let msgListOfOther = this.messageList.filter(x => { return x._userid != this.loginUserId });
          this.msgListOfMine = this.messageList.filter(x => { return x._userid == this.loginUserId });
          console.log("msgListOfOther:", msgListOfOther);
          console.log("msgListOfMine:", this.msgListOfMine.length);
          if (msgListOfOther.length > 0) {
            let lastMsgIdTemp = msgListOfOther[msgListOfOther.length - 1]._id;
            if (this.lastMsgId != lastMsgIdTemp) {
              this.lastMsgId = lastMsgIdTemp;
              this.lastMessageRead();
            }
            console.log("lastMsgIdTemp:", lastMsgIdTemp);
          }
          console.log("lastMsgId:", this.lastMsgId);
        }
      } else {
        this.common.showError(res['data'])
      }
    }, err => {
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
    console.log("lastSeenId-lastMsgId:", this.lastSeenId, this.lastMsgId);
    if (this.lastSeenId < this.lastMsgId) {
      this.api.post('AdminTask/readLastMessage', params).subscribe(res => {
        console.log("messageList:", res['data']);
        if (res['code'] > 0) {

          setTimeout(() => {
            this.lastSeenId = this.lastMsgId;
          }, 5000);

        } else {
          this.common.showError(res['msg'])
        }
      }, err => {
        this.showLoading = false;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
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
          if (this.tabType == 101 && this.statusId == 0 && this.msgListOfMine.length == 0) {
            console.log("msgListOfMine for update tkt:", this.msgListOfMine.length);
            this.updateTicketStatus(2);
          }
          this.getMessageList();
        }
        else {
          this.common.showError(res['msg'])
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  getAllUserByTask() {
    // this.showLoading = true;
    let params = {
      ticketId: this.ticketId,
      ticketType: this.ticketType
    }
    this.api.post('AdminTask/getAllUserByTask', params).subscribe(res => {
      // this.showLoading = false;
      console.log("userListByTask:", res['data']);
      if (res['success']) {
        this.userListByTask = res['data'] || [];
      } else {
        this.common.showError(res['data'])
      }
    }, err => {
      this.showLoading = false;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  addNewCCUserToTask() {
    if (this.ticketId > 0 && this.newCCUserId > 0) {
      let params = {
        ticketId: this.ticketId,
        taskId: this.taskId,
        ccUserId: this.newCCUserId
      }
      this.common.loading++;
      this.api.post('AdminTask/addNewCCUserToTask', params).subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.newCCUserId = null;
          this.getAllUserByTask();
        } else {
          this.common.showError(res['data']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select CC user")
    }
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.adminList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  newAssigneeUser = {
    id: null,
    name: ""
  };
  updateTaskAssigneeUser() {
    if (this.ticketId > 0 && this.newAssigneeUser.id > 0) {
      let isCCUpdate = 0;
      if (this.userListByTask['taskUsers'][0]._assignee_user_id == this.loginUserId) {
        isCCUpdate = 1;
      }
      if (this.userListByTask['taskUsers'][0]._assignee_user_id == this.newAssigneeUser.id || this.loginUserId == this.newAssigneeUser.id) {
        this.common.showError("Please assign a new user");
        return false;
      }
      let params = {
        ticketId: this.ticketId,
        taskId: this.taskId,
        assigneeUserId: this.newAssigneeUser.id,
        status: this.statusId,
        isCCUpdate: isCCUpdate,
        assigneeUserNameOld: this.userListByTask['taskUsers'][0].assignto,
        assigneeUserNameNew: this.newAssigneeUser.name
      }
      console.log("updateTaskAssigneeUser params:", params);
      this.common.loading++;
      this.api.post('AdminTask/updateTaskAssigneeUser', params).subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.getAllUserByTask();
          this.getMessageList();
          this.showAssignUserAuto = null;
        } else {
          this.common.showError(res['data']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select Assignee user")
    }
  }

  updateTicketStatus(status) {
    if (this.ticketId && this.statusId == 0) {
      let params = {
        ticketId: this.ticketId,
        statusId: status
      }
      // this.common.loading++;
      this.api.post('AdminTask/updateTicketStatus', params).subscribe(res => {
        // this.common.loading--;
        if (res['code'] > 0) {
          // this.common.showToast(res['msg']);
          this.statusId = status;
        } else {
          this.common.showError(res['data']);
          console.log('Error to auto ack: ', res['data']);
        }
      }, err => {
        // this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }


  // start: campaign msg ----------------------------------------------------
  getLeadMessage() {
    this.showLoading = true;
    let params = {
      ticketId: this.ticketId
    }
    this.api.post('Campaigns/getLeadMessage', params).subscribe(res => {
      this.showLoading = false;
      console.log("messageList:", res['data']);
      if (res['success']) {
        this.messageList = res['data'] || [];
        if (this.messageList.length > 0) {
          let msgListOfOther = this.messageList.filter(x => { return x._userid != this.loginUserId });
          this.msgListOfMine = this.messageList.filter(x => { return x._userid == this.loginUserId });
          console.log("msgListOfOther:", msgListOfOther);
          console.log("msgListOfMine:", this.msgListOfMine.length);
          if (msgListOfOther.length > 0) {
            let lastMsgIdTemp = msgListOfOther[msgListOfOther.length - 1]._id;
            if (this.lastMsgId != lastMsgIdTemp) {
              this.lastMsgId = lastMsgIdTemp;
              this.lastMessageReadoflead();
            }
            console.log("lastMsgIdTemp:", lastMsgIdTemp);
          }
          console.log("lastMsgId:", this.lastMsgId);
        }
      } else {
        this.common.showError(res['data'])
      }
    }, err => {
      this.showLoading = false;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  saveLeadMessage() {
    if (this.taskMessage == "") {
      return this.common.showError("Message is missing");
    } else {
      this.common.loading++;
      let params = {
        ticketId: this.ticketId,
        status: this.statusId,
        message: this.taskMessage
      }
      this.api.post('Campaigns/saveLeadMessage', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.taskMessage = "";
          // if (this.tabType == 101 && this.statusId == 0 && this.msgListOfMine.length == 0) {
          //   console.log("msgListOfMine for update tkt:", this.msgListOfMine.length);
          //   this.updateTicketStatus(2);
          // }
          this.getLeadMessage();

        } else {
          this.common.showError(res['msg'])
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  getAllUserByLead() {
    let params = {
      leadId: this.taskId
    }
    this.api.post('Campaigns/getAllUserByLead', params).subscribe(res => {
      console.log("getAllUserByLead:", res['data']);
      if (res['success']) {
        this.userListByTask = res['data'] || [];
      } else {
        this.common.showError(res['data'])
      }
    }, err => {
      this.showLoading = false;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  addNewCCUserToLead() {
    if (this.taskId > 0 && this.newCCUserId > 0) {
      let params = {
        leadId: this.taskId,
        ccUserId: this.newCCUserId
      }
      this.common.loading++;
      this.api.post('Campaigns/addNewCCUserToLead', params).subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.newCCUserId = null;
          this.getAllUserByLead();
        } else {
          this.common.showError(res['data']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select CC user")
    }
  }


  updateLeadPrimaryOwner() {
    if (this.taskId > 0 && this.newAssigneeUser.id > 0) {
      let isCCUpdate = 0;
      if (this.userListByTask['leadUsers'][0]._pri_own_id == this.newAssigneeUser.id || this.loginUserId == this.newAssigneeUser.id) {
        this.common.showError("Please assign a new user");
        return false;
      }
      let params = {
        ticketId: this.ticketId,
        leadId: this.taskId,
        assigneeUserId: this.newAssigneeUser.id,
        // status: this.statusId,
        isCCUpdate: isCCUpdate,
        assigneeUserNameOld: this.userListByTask['leadUsers'][0].primary_owner,
        // assigneeUserIdOld: this.userListByTask['leadUsers'][0]._pri_own_id,
        assigneeUserNameNew: this.newAssigneeUser.name
      }
      console.log("updateLeadPrimaryOwner params:", params);
      this.common.loading++;
      this.api.post('Campaigns/updateLeadPrimaryOwner', params).subscribe(res => {
        this.common.loading--;
        if (res['success']) {
          this.getAllUserByLead();
          this.getLeadMessage();
          this.showAssignUserAuto = null;
        } else {
          this.common.showError(res['data']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select Primary Owner")
    }
  }

  lastMessageReadoflead() {
    let params = {
      ticketId: this.ticketId,
      comment_id: this.lastMsgId
    }
    console.log("lastSeenId-lastMsgId:", this.lastSeenId, this.lastMsgId);
    if (this.lastSeenId < this.lastMsgId) {
      this.api.post('Campaigns/readLastMessage', params).subscribe(res => {
        console.log("messageList:", res['data']);
        if (res['code'] > 0) {

          setTimeout(() => {
            this.lastSeenId = this.lastMsgId;
          }, 5000);

        } else {
          this.common.showError(res['msg'])
        }
      }, err => {
        this.showLoading = false;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  closeLeadUserLogsModal() {
    document.getElementById("userLogsModal").style.display = "none";
  }

  showLeadUserLogsModal() {
    console.log('userLogs:', this.userListByTask['userLogs']);
    document.getElementById("userLogsModal").style.display = "block";
  }
  // end: campaign msg

}
