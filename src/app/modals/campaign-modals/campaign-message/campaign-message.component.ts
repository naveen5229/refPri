import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ReminderComponent } from '../../reminder/reminder.component';
import { TaskNewComponent } from '../../task-new/task-new.component';
import { CampaignTargetActionComponent } from '../campaign-target-action/campaign-target-action.component';

@Component({
  selector: 'ngx-campaign-message',
  templateUrl: './campaign-message.component.html',
  styleUrls: ['./campaign-message.component.scss']
})
export class CampaignMessageComponent implements OnInit {
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
  campaignTargetActionData = [];
  tableCampaignTargetActionData = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
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
      }
      this.getAllAdmin();
      this.getTargetActionData();
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
      this.getTargetActionData();
    });
  }
  // end: campaign msg

  getTargetActionData() {
    let campTargetId = this.taskId;
    this.resetTable();
    const params = "campTargetId=" + campTargetId;
    this.common.loading++;
    this.api.get('Campaigns/getCampTarAction?' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.campaignTargetActionData = res['data'];
        this.campaignTargetActionData.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.tableCampaignTargetActionData.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.tableCampaignTargetActionData.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.campaignTargetActionData[0]) {
      if (key.charAt(0) != "_") {
        if (key == 'Action') {
        } else {
          headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        }
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.campaignTargetActionData.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          // column[key] = {
          //   value: "",
          //   isHTML: false,
          //   action: null,
          //   icons: this.actionIcons(campaign)
          // };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(campaign) {
    let icons = [
      { class: 'fas fa-trash-alt ml-2', action: this.deleteCampaign.bind(this, campaign) }
    ];
    return icons;
  }

  deleteCampaign(row) {
    let params = {
      campTarActId: row._camptaractid,
    }
    if (row._camptaractid) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Campaigns/removeCampTarAction', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getTargetActionData();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }

}
