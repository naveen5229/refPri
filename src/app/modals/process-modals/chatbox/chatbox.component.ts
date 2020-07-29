import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ReminderComponent } from '../../reminder/reminder.component';
import { AddTransactionActionComponent } from '../add-transaction-action/add-transaction-action.component';

@Component({
  selector: 'ngx-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit {
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
  // taskId = null;
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
  transActionData = [];
  tableTransActionData = {
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
      this.ticketId = this.common.params.editData.transactionid;
      this.tabType = (this.common.params.editData.tabType) ? this.common.params.editData.tabType : null;
      this.lastSeenId = this.common.params.editData.lastSeenId;
      this.ticketData = this.common.params.editData.rowData;
      this.getLeadMessage();
      this.getAllUserByLead();
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
    this.api.post('Processes/getLeadMessage', params).subscribe(res => {
      this.showLoading = false;
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
      this.api.post('Processes/saveLeadMessage', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.taskMessage = "";
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
      leadId: this.ticketId
    }
    this.api.post('Processes/getAllUserByLead', params).subscribe(res => {
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
    if (this.ticketId > 0 && this.newCCUserId > 0) {
      let params = {
        leadId: this.ticketId,
        ccUserId: this.newCCUserId
      }
      this.common.loading++;
      this.api.post('Processes/addNewCCUserToLead', params).subscribe(res => {
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
    if (this.ticketId > 0 && this.newAssigneeUser.id > 0) {
      let isCCUpdate = 0;
      if (this.userListByTask['leadUsers'][0]._pri_own_id == this.newAssigneeUser.id || this.loginUserId == this.newAssigneeUser.id) {
        this.common.showError("Please assign a new user");
        return false;
      }
      let params = {
        ticketId: this.ticketId,
        leadId: this.ticketId,
        assigneeUserId: this.newAssigneeUser.id,
        isCCUpdate: isCCUpdate,
        assigneeUserNameOld: this.userListByTask['leadUsers'][0].primary_owner,
        assigneeUserNameNew: this.newAssigneeUser.name
      }
      console.log("updateLeadPrimaryOwner params:", params);
      this.common.loading++;
      this.api.post('Processes/updateLeadPrimaryOwner', params).subscribe(res => {
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
      this.api.post('Processes/readLastMessage', params).subscribe(res => {
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

  openTransAction(lead, type) {
    console.log("openTransAction");
    let actionData = {
      processId: lead._processid,
      transId: lead._transactionid,
      processName: lead._processname,
      identity: lead.identity,
      isNextAction: (type == 2) ? true : false,
      requestId: (type == 1) ? null : null
    };
    this.common.params = { actionData, adminList: this.adminList, title: "Transaction Action", button: "Add" };
    const activeModal = this.modalService.open(AddTransactionActionComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      this.getTargetActionData();
    });
  }
  // end: campaign msg

  getTargetActionData() {
    this.resetTable();
    this.transActionData = [];
    const params = "transId=" + this.ticketId;
    this.common.loading++;
    this.api.get('Processes/getTransactionActionList?' + params).subscribe(res => {
      this.common.loading--;
      console.log("api data", res);
      // if (!res['data']) return;
      if (res['code'] == 1) {
        this.transActionData = res['data'] || [];
        this.transActionData.length ? this.setTable() : this.resetTable();
      }
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  resetTable() {
    this.tableTransActionData.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.tableTransActionData.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.transActionData[0]) {
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
    this.transActionData.map(lead => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          // column[key] = {
          //   value: "",
          //   isHTML: false,
          //   action: null,
          //   icons: this.actionIcons(lead)
          // };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  actionIcons(lead) {
    let icons = [
      { class: 'fas fa-trash-alt ml-2', action: this.deleteLead.bind(this, lead) }
    ];
    return icons;
  }

  deleteLead(row) {
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
          this.api.post('Processes/removeTransactionAction', params)
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
