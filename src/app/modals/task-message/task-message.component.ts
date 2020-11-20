import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, HostListener, ViewChildren, QueryList } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ReminderComponent } from '../reminder/reminder.component';
import { TaskNewComponent } from '../task-new/task-new.component';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { TaskScheduleMasterComponent } from '../task-schedule-master/task-schedule-master.component';
import { TaskScheduleNewComponent } from '../task-schedule-new/task-schedule-new.component';
import { FileHandle } from '../../directives/dndDirective/dnd.directive';

@Component({
  selector: 'ngx-task-message',
  templateUrl: './task-message.component.html',
  styleUrls: ['./task-message.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1,
      })),
      state('closed', style({
        height: '0',
        opacity: 0
      })),
      transition('open => closed', [
        animate('0.35s')
      ]),
      transition('closed => open', [
        animate('0.35s')
      ]),
    ]),
  ]
})
export class TaskMessageComponent implements OnInit {
  // this page in from 3 pages change carefully
  files: FileHandle[] = [];
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
  lastSeenIdForView = 0; //only for view not update it
  userListByTask = [];
  adminList = [];
  newCCUserId = [];
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
  attachmentFile = {
    name: null,
    file: null
  };
  attachmentList = [];
  isAttachmentShow = false;

  userGroupList = [];
  userWithGroup = [];
  bGConditions = [
    {
      key: 'groupId',
      class: 'highlight-blue',
      isExist: true
    }
  ];
  isLoaded = false;
  parentCommentId = null;
  mentionedUsers = [];
  replyStatus = null;
  parentComment = null;
  replyType = null;
  isReplyOnDemand = false;
  commentInfo = [];
  isMentionedUser = false;
  mentionedUserList = [];
  isChatFeature = true;
  departmentList = [];
  stTaskMaster = null;
  isChecked = null;
  fileType = null;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event) {
    this.keyHandler(event);
  }
  @ViewChildren('userlistInput') userlistInput: QueryList<ElementRef>;
  @ViewChild('msgtextarea', { static: false }) private msgtextarea: ElementRef;

  constructor(public activeModal: NgbActiveModal, public modalService: NgbModal, public api: ApiService,
    public common: CommonService, public userService: UserService) {
    console.log("common params:", this.common.params);
    if (this.common.params != null) {
      this.title = this.common.params.title;
      this.subTitle = (this.common.params.subTitle) ? this.common.params.subTitle : null;
      this.fromPage = (this.common.params.fromPage) ? this.common.params.fromPage : null;
      this.departmentList = this.common.params.departmentList;

      this.ticketId = this.common.params.ticketEditData.ticketId;
      this.statusId = this.common.params.ticketEditData.statusId;
      this.lastSeenId = this.common.params.ticketEditData.lastSeenId;
      this.taskId = this.common.params.ticketEditData.taskId;
      this.ticketType = this.common.params.ticketEditData.taskType;
      this.tabType = (this.common.params.ticketEditData.tabType) ? this.common.params.ticketEditData.tabType : null;
      this.ticketData = this.common.params.ticketEditData.ticketData;
      this.isChecked = this.common.params.ticketEditData.isChecked;
      if (!this.ticketData || this.ticketType == 114) {
        this.getTicketDataByTktId();
      } else if (this.tabType == -8 && this.ticketType == 103 || this.ticketData._tktype == 103) {
        this.getScheduledMasterByTaskId();
      }
      this.getMessageList();
      this.getAllUserByTask();

      this.lastSeenIdForView = this.lastSeenId;
      console.log(this.common.params, 'ticket data')
      this.adminList = this.common.params.userList.map(x => { return { id: x.id, name: x.name, groupId: null, groupuser: null } });
      this.userGroupList = this.common.params.groupList;
      if (this.userGroupList) {
        this.userWithGroup = this.userGroupList.concat(this.adminList);
      } else {
        this.userWithGroup = this.adminList.concat(this.userGroupList);
      }
      console.log("userGroupList:", this.userGroupList);
      if (this.ticketType == 114) {
        this.title = "Broadcast";
      }
      this.getAttachmentByTicket();

    }

  }

  ngOnInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    // this.scrollToBottom();
  }

  ngAfterViewInit() {
    this.isLoaded = true;
    setTimeout(() => {
      this.taskMessage = '';
    }, 30);
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }, 100);
    } catch (err) { }
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }
  keyHandler(event) {
    const key = event.key.toLowerCase();
    let activeId = document.activeElement.id;
    console.log('row data', key);
    if (key == 'escape') {
      this.closeModal(false);
    }

  }

  getTicketDataByTktId() {
    this.common.loading++;
    this.api.get('AdminTask/getTicketDataByTktId?ticketId=' + this.ticketId).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        let ticketData = res['data'] || null;
        if (ticketData && ticketData.length > 0) {
          this.ticketData = ticketData[0];
          this.statusId = this.ticketData._status;
          this.lastSeenId = this.ticketData._lastreadid;
          this.taskId = [101, 102, 104, 111, 112, 113, 114].includes(this.ticketData._tktype) ? this.ticketData._refid : null;
          this.ticketType = this.ticketData._tktype;
          this.isChatFeature = this.ticketData._chat_feature;
          if (this.ticketType == 114) {
            this.title = "Broadcast";
          }
        } else {
          this.common.showError("Something went wrong, Please reopen chatbox");
        }
        console.log("getTicketMessage", ticketData);
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getMessageList() {
    this.showLoading = true;
    let params = {
      ticketId: this.ticketId
    }
    this.api.post('AdminTask/getTicketMessage', params).subscribe(res => {
      this.showLoading = false;
      console.log("messageList:", res['data']);
      if (res['success']) {
        this.messageList = res['data'] || [];
        this.scrollToBottom();
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

  setReplyWithType(type) {
    this.replyType = type;
    if (type == 1) {
      this.replyStatus = -1;
    } else if (type == 2) {
      this.replyStatus = 0;
    } else if (type == 3) {
      this.replyStatus = 5;
    } else {
      this.replyStatus = null;
      this.replyType = null;
      this.messageReadInfo(this.parentCommentId);
    }
    this.msgtextarea.nativeElement.focus();
  }

  replyToComment(msg, userType) {
    this.replyType = null;
    this.parentCommentId = msg._id;
    this.parentComment = msg.comment;
    this.replyStatus = -1;
    this.isReplyOnDemand = (userType == 'other' && msg.reply_demanded && !msg.is_send) ? true : false;
  }

  resetQuotedMsg() {
    this.replyType = null;
    this.parentCommentId = null;
    this.replyStatus = null;
    this.parentComment = null;
    this.mentionedUsers = [];
    this.isReplyOnDemand = false;
  }

  saveTicketMessage() {
    if (this.taskMessage == "" && !this.attachmentFile.file) {
      return this.common.showError("Message is missing");
    } else {
      let formatedMsg = this.taskMessage;
      let splitedMsg = this.taskMessage.split(" ");
      if (splitedMsg && formatedMsg.match('www.')) {
        splitedMsg.forEach((element, index) => {
          if (element.match('www.')) {
            let fullURL = (element.match('http')) ? element : "http://" + element;
            let href_temp = '<a target="_blank" href=' + fullURL + '>' + element + '</a>';
            splitedMsg[index] = href_temp;
          }
        });
        formatedMsg = splitedMsg.join(" ");
      }
      // console.log("formatedMsg:", formatedMsg);
      // return false;
      let mentionedUsers = (this.mentionedUsers && this.mentionedUsers.length > 0) ? this.mentionedUsers.map(x => { return { user_id: x.id, name: x.name } }) : null;
      let params = {
        ticketId: this.ticketId,
        status: this.statusId,
        message: formatedMsg,//this.taskMessage,
        attachment: this.attachmentFile.file,
        attachmentName: (this.attachmentFile.file) ? this.attachmentFile.name : null,
        parentId: (this.replyType > 0) ? this.parentCommentId : null,
        users: (mentionedUsers && mentionedUsers.length > 0) ? JSON.stringify(mentionedUsers) : null,
        replyStatus: (this.replyType > 0) ? this.replyStatus : null,
        requestId: null //(this.replyType > 0 && this.replyStatus === 0) ? this.parentCommentId : null
      }
      console.log("params:", params);
      // return false;
      this.common.loading++;
      this.api.post('AdminTask/saveTicketMessage', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.taskMessage = "";
          this.attachmentFile.file = null;
          this.attachmentFile.name = null;
          this.resetQuotedMsg();
          if (this.ticketData._assignee_user_id == this.loginUserId && this.statusId == 0 && this.msgListOfMine.length == 0) {
            console.log("msgListOfMine for update tkt:", this.msgListOfMine.length);
            this.updateTicketStatus(2, null);
          }
          this.getMessageList();
          this.getAttachmentByTicket();
          this.msgtextarea.nativeElement.focus();
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

  getAllUserByTask() {
    let params = {
      ticketId: this.ticketId,
      ticketType: this.ticketType
    }
    this.api.post('AdminTask/getAllUserByTask', params).subscribe(res => {
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

  getAttachmentByTicket() {
    this.attachmentList = [];
    this.api.get('AdminTask/getAttachmentByTicket?ticketId=' + this.ticketId).subscribe(res => {
      if (res['code'] == 1) {
        this.attachmentList = res['data'] || [];
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
    let accessUsers = [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid];
    if (this.userListByTask['ccUsers'].length > 0) {
      this.userListByTask['ccUsers'].forEach(element => {
        accessUsers.push(element._cc_user_id);
      });
    }

    if (!this.userListByTask['taskUsers'] || !accessUsers.includes(this.userService._details.id)) {
      this.common.showError("Not a valid user");
      return false;
    }
    let CCUsers = [];
    this.newCCUserId.forEach(x => {
      if (x.groupId != null) {
        x.groupuser.forEach(x2 => {
          if (!accessUsers.includes(x2._id)) {
            CCUsers.push({ user_id: x2._id });
          }
        })
      } else {
        if (!accessUsers.includes(x.id)) {
          CCUsers.push({ user_id: x.id });
        }
      }
    });

    if (this.ticketId > 0 && CCUsers && CCUsers.length > 0) {
      let params = {
        ticketId: this.ticketId,
        taskId: this.ticketData._refid,
        ccUserId: JSON.stringify(CCUsers),
        ticketType: this.ticketType
      }
      this.common.loading++;
      this.api.post('AdminTask/addNewCCUserToTask', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.getAllUserByTask();
          this.newCCUserId = [];
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Select new CC user");
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

  updateTaskAssigneeUser() {
    if (this.ticketId > 0 && this.newAssigneeUser.id > 0) {
      let isCCUpdate = 0;
      if (this.userListByTask['taskUsers'][0]._assignee_user_id == this.loginUserId) {
        isCCUpdate = 1;
        if (this.userListByTask['ccUsers'] && this.userListByTask['ccUsers'].length > 0) {
          console.log("ccuser check");
          let findCC = this.userListByTask['ccUsers'].find(x => { return x._cc_user_id == this.loginUserId });
          console.log("ccuser check2", findCC);
          if (findCC) {
            console.log("ccuser check3");
            isCCUpdate = 0;
          }
        }
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
      this.api.post('AdminTask/updateTicketStatus', params).subscribe(res => {
        if (res['code'] > 0) {
          if (!(this.statusId == 0)) {
            this.getMessageList();
          }
          this.statusId = status;
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
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
    // if (this.userListByTask['taskUsers'] && [this.userListByTask['taskUsers'][0]._assignee_user_id, this.userListByTask['taskUsers'][0]._aduserid].includes(this.userService._details.id)) {
    this.common.params = { ticketId: this.ticketData._tktid, title: "Add Reminder", btn: "Set Reminder" };
    const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.ticketData._isremind = 2;
      }
    });
    // } else {
    //   this.common.showError("Invalid User");
    // }
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
          this.ticketData.expdate = this.common.changeDateformate(data.returnNewDate, 'dd MMM yy HH:mm');
          this.ticketData._expdate = data.returnNewDate;
          this.getMessageList();
        }
      });
    } else {
      this.common.showError("Invalid User");
    }
  }

  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0]).then((res: any) => {
      this.common.loading--;
      let file = event.target.files[0];
      console.log("Type:", file, res);
      var ext = file.name.split('.').pop();
      this.formatIcon(ext);
      let formats = ["jpeg", "jpg", "png", 'xlsx', 'xls', 'docx', 'doc', 'pdf', 'csv'];
      if (formats.includes(ext.toLowerCase())) {
      } else {
        this.common.showError("Valid Format Are : jpeg, png, jpg, xlsx, xls, docx, doc, pdf, csv");
        return false;
      }
      this.attachmentFile.name = file.name;
      this.attachmentFile.file = res;
      console.log("attachmentFile:", this.attachmentFile)
    }, err => {
      this.common.loading--;
      console.error('Base Err: ', err);
    })
  }

  formatIcon(ext) {
    let icon = null;
    switch (ext) {
      case 'xlxs' || 'xls': icon = 'fa fa-file-excel-o'; break;
      case 'docx' || 'doc': icon = 'fa fa-file'; break;
      case 'pdf': icon = 'fa fa-file-pdf-o'; break;
      case 'csv': icon = 'fas fa-file-csv'; break;
      default: icon = null;
    }
    this.fileType = icon;
  }


  onPaste(event: any) {
    console.log('event', event);
    const items = event.clipboardData.items;
    let selectedFile = { "target": { "files": [] } };
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        selectedFile.target.files.push(item.getAsFile());
      }
    }

    this.handleFileSelection(selectedFile);
  }

  filesDropped(files: FileHandle[]) {
    console.log("ChatboxComponent -> filesDropped -> files", files)
    this.files = files;
    let selectedFile = { "target": { "files": [] } };
    selectedFile.target.files.push(this.files[0].file);
    this.handleFileSelection(selectedFile);
  }

  messageReadInfo(commentId) {
    this.commentInfo = [];
    let params = "?ticketId=" + this.ticketId + "&commentId=" + commentId;
    if (this.ticketId < this.lastMsgId) {
      this.api.get('AdminTask/getMessageReadInfo' + params).subscribe(res => {
        if (res['code'] > 0) {
          this.commentInfo = res['data'] || [];
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  onMessageType(e) {
    let value = e.data;
    console.log("target value:", e.target.value);
    console.log("target value22:", value);
    let accessUsers = [];
    if (this.userListByTask['taskUsers'][0]._assignee_user_id != this.loginUserId) {
      accessUsers.push({ id: this.userListByTask['taskUsers'][0]._assignee_user_id, name: this.userListByTask['taskUsers'][0].assignto });
    }
    if (this.userListByTask['taskUsers'][0]._aduserid != this.loginUserId) {
      accessUsers.push({ id: this.userListByTask['taskUsers'][0]._aduserid, name: this.userListByTask['taskUsers'][0].assignby });
    }
    if (this.userListByTask['ccUsers'] && this.userListByTask['ccUsers'].length > 0) {
      this.userListByTask['ccUsers'].forEach(element => {
        if (element._cc_user_id != this.loginUserId) {
          accessUsers.push({ id: element._cc_user_id, name: element.cc_user });
        }
      });
    }
    if (this.userListByTask['projectUsers'] && this.userListByTask['projectUsers'].length > 0) {
      this.userListByTask['projectUsers'].forEach(element => {
        if (element._pu_user_id != this.loginUserId) {
          accessUsers.push({ id: element._pu_user_id, name: element.project_user });
        }
      });
    }
    if (e && value && value == "@") {
      console.log("onMessageType");
      this.isMentionedUser = true;
      this.mentionedUserList = accessUsers;//this.adminList;
      setTimeout(() => {
        this.userlistInput.toArray()[0].nativeElement.focus();
      }, 100);
    } else if (e && value && value == " ") {
      console.log("onMessageType2");
      this.isMentionedUser = false;
    } else if (this.isMentionedUser) {
      let splieted = this.taskMessage.split('@');
      let searchableTxt = splieted[splieted.length - 1];
      this.mentionedUserList = accessUsers.filter(x => { return (x.name.toLowerCase()).includes(searchableTxt.toLowerCase()) }); //this.adminList.filter(x => { return (x.name.toLowerCase()).includes(searchableTxt.toLowerCase()) });
    }
  }

  onSelectMenstionedUser(user) {
    this.mentionedUsers.push({ id: user.id, name: user.name });
    console.log("mentionedUsers2:", this.mentionedUsers);
    let splieted = this.taskMessage.split('@');
    splieted.pop();
    this.taskMessage = splieted.join('@') + '@' + user.name;
    this.msgtextarea.nativeElement.focus();
  }

  getScheduledMasterByTaskId() {
    this.common.loading++;
    this.api.get('AdminTask/getScheduledMasterByTaskId?taskId=' + this.ticketData._refid).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.stTaskMaster = (res['data']) ? res['data'][0] : null;
        console.log("getTicketMessage", this.stTaskMaster);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  openSchedukedTaskMasterModal() {
    this.common.params = {
      data: this.stTaskMaster,
      adminList: this.adminList,
      groupList: this.userGroupList,
      departmentList: this.departmentList,
      title: "Add Schedule task",
      button: "Save",
    };
    const activeModal = this.modalService.open(TaskScheduleMasterComponent, { size: "lg", container: "nb-layout", backdrop: "static", });
    activeModal.result.then(data => {
      if (data.response) {
        this.getScheduledMasterByTaskId();
      }
    });
  }

  addScheduleTaskparam() {
    this.common.params = {
      taskId: this.stTaskMaster._id,
      title: "Schedule task action",
      button: "Save",
    };
    const activeModal = this.modalService.open(TaskScheduleNewComponent, { size: "lg", container: "nb-layout", backdrop: "static", });
  }

  starMarkOnTicket() {
    let params = {
      ticketId: this.ticketId,
      isChecked: this.isChecked == 1 ? true : false,
    };
    this.common.loading++;
    this.api.post("AdminTask/starMarkOnTicket", params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        // this.getTaskByType(type);
        if (this.isChecked == 1) {
          this.isChecked = 0;
        } else {
          this.isChecked = 1;
        }
        this.getMessageList();
        this.common.showToast(res['msg']);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("Error: ", err);
    }
    );
  }



}
