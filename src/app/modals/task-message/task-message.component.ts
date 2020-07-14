import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ReminderComponent } from '../reminder/reminder.component';
import { TaskNewComponent } from '../task-new/task-new.component';
import { CampaignTargetActionComponent } from '../campaign-modals/campaign-target-action/campaign-target-action.component';

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
  ticketData;
  fromPage;
  newAssigneeUser = {
    id: null,
    name: ""
  };
  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, public api: ApiService,
    public common: CommonService, public userService: UserService) {
    console.log("common params:", this.common.params);
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.subTitle = (this.common.params.subTitle) ? this.common.params.subTitle : null;
      this.fromPage = (this.common.params.fromPage) ? this.common.params.fromPage : null;
      if (this.fromPage == 'campaign') {
        this.ticketId = this.common.params.campaignEditData.ticketId;
        this.taskId = this.common.params.campaignEditData.camptargetid;
        this.statusId = this.common.params.campaignEditData.statusId;
        this.tabType = (this.common.params.campaignEditData.tabType) ? this.common.params.campaignEditData.tabType : null;
        this.lastSeenId = this.common.params.campaignEditData.lastSeenId;
        this.ticketData = this.common.params.campaignEditData.campaignData;
        this.getLeadMessage();
        this.getAllUserByLead();
      } else {
        this.ticketId = this.common.params.ticketEditData.ticketId;
        this.statusId = this.common.params.ticketEditData.statusId;
        this.lastSeenId = this.common.params.ticketEditData.lastSeenId;
        this.taskId = this.common.params.ticketEditData.taskId;
        // this.ticketType = this.common.params.ticketEditData.taskType;
        this.ticketType = this.common.params.ticketEditData.taskType;
        this.tabType = (this.common.params.ticketEditData.tabType) ? this.common.params.ticketEditData.tabType : null;
        this.ticketData = this.common.params.ticketEditData.ticketData;
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
            this.updateTicketStatus(2, null);
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
      if (res['code'] == 1) {
        this.userListByTask = res['data'] || [];
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.showLoading = false;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  addNewCCUserToTask() {
    if (!this.userListByTask['taskUsers'] || ![this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid].includes(this.userService._details.id)) {
      this.common.showError("Not a valid user");
      return false;
    }
    if (this.ticketId > 0 && this.newCCUserId > 0) {
      let params = {
        ticketId: this.ticketId,
        taskId: this.ticketData._refid,
        ccUserId: this.newCCUserId,
        ticketType: this.ticketType
      }
      this.common.loading++;
      this.api.post('AdminTask/addNewCCUserToTask', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.newCCUserId = null;
          this.getAllUserByTask();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select CC user");
    }
  }

  removeCCUserWithConfirm(ccUserId, ccUserName) {
    if (this.userListByTask['taskUsers'] && [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid, ccUserId].includes(this.userService._details.id)) {
      this.common.params = {
        title: 'Remove CC User',
        description: '<b>Are You Sure To remove CC-user from This Task' + `<b>`,
        isRemark: true
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.removeCCUser(ccUserId, ccUserName, data.remark);
        }
      });
    } else {
      this.common.showError("Not a valid user");
    }
  }

  removeCCUser(ccUserId, ccUserName, remark) {
    if (ccUserId > 0) {
      let params = {
        ticketId: this.ticketId,
        taskId: this.ticketData._refid,
        ccUserId: ccUserId,
        ticketType: this.ticketType,
        ccUserName: ccUserName,
        remark: remark
      }
      this.common.loading++;
      this.api.post('AdminTask/removeCCUserToTask', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.getAllUserByTask();
          this.getMessageList();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("CC user is missing");
    }
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
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
        if (res['code'] == 1) {
          this.getAllUserByTask();
          this.getMessageList();
          this.showAssignUserAuto = null;
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select Assignee user");
    }
  }

  updateTicketStatus(status, remark = null) {
    if (this.ticketId) {
      let params = {
        ticketId: this.ticketId,
        statusId: status,
        statusOld: this.statusId,
        remark: remark,
        taskId: this.ticketData._refid,
        ticketType: this.ticketData._tktype
      }
      // this.common.loading++;
      this.api.post('AdminTask/updateTicketStatus', params).subscribe(res => {
        // this.common.loading--;
        if (res['code'] > 0) {
          // this.common.showToast(res['msg']);
          if (!(this.statusId == 0)) {
            this.getMessageList();
          }
          this.statusId = status;
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        // this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  changeTicketStatusWithConfirm(status) {
    console.log("ticketData:", this.ticketData);
    if (this.userListByTask['taskUsers'] && [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid].includes(this.userService._details.id)) {
      let preTitle = "Complete";
      if (status == 3) {
        preTitle = "Hold";
      } else if (this.statusId == 3) {
        preTitle = "Unhold";
      }
      this.common.params = {
        title: preTitle + ' Task ',
        description: `<b>&nbsp;` + 'Are You Sure To ' + preTitle + ' This Task' + `<b>`,
        isRemark: (status == 3) ? true : false
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(status, data.remark);
        }
      });

    } else {
      this.common.showError("Invalid User");
    }
  }

  showReminderPopup() {
    if (this.userListByTask['taskUsers'] && [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid].includes(this.userService._details.id)) {
      this.common.params = { ticketId: this.ticketData._tktid, title: "Add Reminder", btn: "Set Reminder" };
      const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          this.ticketData._isremind = 2;
        }
      });
    } else {
      this.common.showError("Invalid User");
    }
  }

  checkReminderSeen() {
    if (this.userListByTask['taskUsers'] && [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid].includes(this.userService._details.id)) {
      let params = {
        ticket_id: this.ticketData._tktid
      };
      this.common.loading++;
      this.api.post('AdminTask/checkReminderSeen', params)
        .subscribe(res => {
          this.common.loading--;
          this.common.showToast(res['msg']);
          this.ticketData._isremind = 0;
        }, err => {
          this.common.loading--;
          console.log('Error: ', err);
        });
    } else {
      this.common.showError("Invalid User");
    }
  }

  editTaskAssignDate() {
    console.log("editTaskAssignDate:", this.ticketData);
    if (this.userListByTask['taskUsers'] && [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid].includes(this.userService._details.id)) {

      this.common.params = { userList: this.adminList, parentTaskId: this.ticketData._refid, parentTaskDesc: this.ticketData.task_desc, editType: 1, editData: this.ticketData };
      const activeModal = this.modalService.open(TaskNewComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          this.getMessageList();
        }
      });
    } else {
      this.common.showError("Invalid User");
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

  addContactAction() {
    let campaign = this.ticketData;
    let targetActionData = {
      rowId: campaign._camptargetid,
      campaignId: campaign._campid,
      campaignName: campaign._campaignname,
      potential: campaign.Potential,
      name: campaign.Company,
      mobile: campaign._mobileno,
      locationId: campaign._locationid,
      locationName: campaign.Location,
      address: campaign.Address,
      camptargetid: campaign._camptargetid

    };
    console.log(campaign);
    this.common.params = { targetActionData, title: "Campaign Target Action", button: "Add", stateDataList: null, actionDataList: null, nextactionDataList: null };
    const activeModal = this.modalService.open(CampaignTargetActionComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      // this.getCampaignTargetData();
    });
  }
  // end: campaign msg

}
