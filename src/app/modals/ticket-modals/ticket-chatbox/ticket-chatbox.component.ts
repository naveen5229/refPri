import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, HostListener, ViewChildren, QueryList } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ReminderComponent } from '../../reminder/reminder.component';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FileHandle } from '../../../directives/dndDirective/dnd.directive';

@Component({
  selector: 'ngx-chatbox',
  templateUrl: './ticket-chatbox.component.html',
  styleUrls: ['./ticket-chatbox.component.scss'],
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
export class TicketChatboxComponent implements OnInit {
  files: FileHandle[] = [];
  @ViewChild('chat_block', { static: false }) private myScrollContainer: ElementRef;
  taskMessage = "";
  messageImage = [];
  title = '';
  subTitle = null;
  ticketId = 0;
  statusId = 0;
  messageList = [];
  messageListShow = [];
  showLoading = true;
  loginUserId = this.userService._details.id;
  lastMsgId = 0;
  lastSeenId = 0;
  lastSeenIdForView = 0; //only for view not update it
  userListByTask = [];
  adminList = [];
  newCCUserId = [];
  // taskId = null;
  // ticketType = null;
  showAssignUserAuto = null;
  msgListOfMine = [];
  tabType = null;
  ticketData;
  fromPage;
  newAssigneeUser = {
    id: null,
    name: ""
  };
  // attachmentFile = {
  //   name: null,
  //   file: null
  // };
  attachmentFile = [];
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
  // isChatFeature = true;
  departmentList = [];
  stTaskMaster = null;
  fileType = null;
  mentionUserIndex: number = 0;

  isSearchShow = false;
  searchedIndex = [];
  selectedIndex = 0;
  searchCount = 0;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event) {
    this.keyHandler(event);
  }
  @ViewChildren('userlistInput') userlistInput: QueryList<ElementRef>;
  @ViewChild('msgtextarea', { static: false }) private msgtextarea: ElementRef;
  @ViewChild('imgRenderer', { static: false }) imgRenderer: ElementRef;

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
      // this.taskId = this.common.params.ticketEditData.taskId;
      // this.ticketType = this.common.params.ticketEditData.taskType;
      this.tabType = (this.common.params.ticketEditData.tabType) ? this.common.params.ticketEditData.tabType : null;
      this.ticketData = this.common.params.ticketEditData.ticketData;
      if (!this.ticketData) {
        this.getTicketDataByTktId();
      }
      this.getMessageList();
      this.getAllUserByTicket();

      this.lastSeenIdForView = this.lastSeenId;
      console.log(this.common.params, 'ticket data')
      this.adminList = this.common.params.userList.map(x => { return { id: x.id, name: x.name, groupId: null, groupuser: null } });
      this.userGroupList = this.common.params.groupList;
      if (this.userGroupList) {
        this.userWithGroup = this.userGroupList.concat(this.adminList);
      } else {
        this.userWithGroup = this.adminList.concat(this.userGroupList);
      }
      console.log("userGroupList:", this.userGroupList, this.userWithGroup);
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
    // let activeId = document.activeElement.id;
    if (this.isMentionedUser) {
      if (key === 'arrowdown') {
        event.preventDefault();
        this.mentionUserIndex++;
        if (this.mentionedUserList.length === this.mentionUserIndex) {
          this.mentionUserIndex = 0;
        }
      } else if (key === 'arrowup') {
        event.preventDefault();
        this.mentionUserIndex--;
        if (this.mentionUserIndex < 0) {
          this.mentionUserIndex = this.mentionedUserList.length - 1;
        }
      } else if (key === 'enter') {
        event.preventDefault();
        this.onSelectMenstionedUser(this.mentionedUserList[this.mentionUserIndex]);
        this.isMentionedUser = false;
      }
    }
    if (key == 'escape') {
      this.closeModal(false);
    }

  }

  getTicketDataByTktId() {
    this.common.loading++;
    this.api.get('Ticket/getTicketDataByTktId?ticketId=' + this.ticketId).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        let ticketData = res['data'] || null;
        if (ticketData && ticketData.length > 0) {
          this.ticketData = ticketData[0];
          this.statusId = this.ticketData._status;
          this.lastSeenId = this.ticketData._lastreadid;
        } else {
          this.common.showError("Something went wrong, Please reopen chatbox");
        }
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
    this.api.post('Ticket/getTicketMessage', params).subscribe(res => {
      this.showLoading = false;
      if (res['code'] == 1) {
        this.messageList = res['data'] || [];
        this.messageListShow = JSON.parse(JSON.stringify(this.messageList));
        this.scrollToBottom();
        if (this.messageList.length > 0) {
          let msgListOfOther = this.messageList.filter(x => { return x._userid != this.loginUserId });
          this.msgListOfMine = this.messageList.filter(x => { return x._userid == this.loginUserId });
          // console.log("msgListOfOther:", msgListOfOther);
          // console.log("msgListOfMine:", this.msgListOfMine.length);
          if (msgListOfOther.length > 0) {
            let lastMsgIdTemp = msgListOfOther[msgListOfOther.length - 1]._id;
            if (this.lastMsgId != lastMsgIdTemp) {
              this.lastMsgId = lastMsgIdTemp;
              this.lastMessageRead();
            }
            // console.log("lastMsgIdTemp:", lastMsgIdTemp);
          }
          // console.log("lastMsgId:", this.lastMsgId);
        }
        setTimeout(() => {
          this.common.fileLinkHandler('chat_block');
        }, 500);
      } else {
        this.common.showError(res['msg'])
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
    if (this.lastSeenId < this.lastMsgId) {
      this.api.post('Ticket/readLastMessage', params).subscribe(res => {
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
    if (this.taskMessage == "" && !this.attachmentFile) {
      return this.common.showError("Message is missing");
    } else {
      let formatedMsg = this.taskMessage.trim();
      // console.log("🚀 ~ file: task-message.component.ts ~ line 342 ~ TaskMessageComponent ~ saveTicketMessage ~ formatedMsg", formatedMsg)
      if (formatedMsg && (formatedMsg.match('www.') || formatedMsg.match('http://') || formatedMsg.match('https://') || formatedMsg.substr(formatedMsg.indexOf('.')).match('.com') || formatedMsg.substr(formatedMsg.indexOf('.')).match('.in'))) {
        formatedMsg = this.common.getFormatedString(formatedMsg, "www.");
      }
      let mentionedUsers = (this.mentionedUsers && this.mentionedUsers.length > 0) ? this.mentionedUsers.map(x => { return { user_id: x.id, name: x.name } }) : null;
      if (mentionedUsers && mentionedUsers.length > 0) {
        mentionedUsers = this.common.checkMentionedUser(mentionedUsers, this.taskMessage);
      }
      // console.log("mentionedUsers:", mentionedUsers);
      // return false;
      let params = {
        ticketId: this.ticketId,
        status: this.statusId,
        message: formatedMsg,//this.taskMessage,
        // attachment: this.attachmentFile.file,
        // attachmentName: (this.attachmentFile.file) ? this.attachmentFile.name : null,
        attachments: JSON.stringify(this.attachmentFile.map(attachments => { return { name: attachments.name, file: attachments.file } })),
        parentId: (this.replyType > 0) ? this.parentCommentId : null,
        users: (mentionedUsers && mentionedUsers.length > 0) ? JSON.stringify(mentionedUsers) : null,
        replyStatus: (this.replyType > 0) ? this.replyStatus : null,
        requestId: null //(this.replyType > 0 && this.replyStatus === 0) ? this.parentCommentId : null
      }
      console.log("params:", params);
      // return false;
      this.common.loading++;
      this.api.post('Ticket/saveTicketMessage', params).subscribe(res => {
        this.common.loading--;
        this.msgtextarea.nativeElement.focus();
        if (res['code'] > 0) {
          if (res['data'][0].y_id > 0) {
            this.taskMessage = "";
            // this.attachmentFile.file = null;
            // this.attachmentFile.name = null;
            this.attachmentFile = [];
            this.resetQuotedMsg();
            if (this.ticketData._assignee_user_id == this.loginUserId && this.statusId == 0 && this.msgListOfMine.length == 0) {
              // console.log("msgListOfMine for update tkt:", this.msgListOfMine.length);
              this.updateTicketStatus(2, null);
            }
            this.getMessageList();
            this.getAttachmentByTicket();
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  getAllUserByTicket() {
    let params = {
      ticketId: this.ticketId
    }
    this.api.post('Ticket/getAllUserByTicket', params).subscribe(res => {
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
    this.api.get('Ticket/getAttachmentByTicket?ticketId=' + this.ticketId).subscribe(res => {
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

  addNewCCUser() {
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
        ccUserId: JSON.stringify(CCUsers)
      }
      this.common.loading++;
      this.api.post('Ticket/addNewCCUser', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.getAllUserByTicket();
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
        ccUserId: ccUserId,
        ccUserName: ccUserName,
        remark: remark
      }
      this.common.loading++;
      this.api.post('Ticket/removeCCUser', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.getAllUserByTicket();
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
          let findCC = this.userListByTask['ccUsers'].find(x => { return x._cc_user_id == this.loginUserId });
          if (findCC) {
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
        ticketAllocationId: this.ticketData._ticket_allocation_id,
        assigneeUserId: this.newAssigneeUser.id,
        status: this.statusId,
        isCCUpdate: isCCUpdate,
        assigneeUserNameOld: this.userListByTask['taskUsers'][0].assignto,
        assigneeUserNameNew: this.newAssigneeUser.name
      }
      // console.log("updateTaskAssigneeUser params:", params);
      // return;
      this.common.loading++;
      this.api.post('Ticket/updateTicketAssigneeUser', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.getAllUserByTicket();
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
        remark: remark
      }
      this.api.post('Ticket/updateTicketStatus', params).subscribe(res => {
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
    // console.log("ticketData:", this.ticketData);
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
        // console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(status, data.remark);
        }
      });

    } else {
      this.common.showError("Invalid User");
    }
  }

  showReminderPopup() {
    this.common.params = { ticketId: this.ticketId, title: "Add Reminder", btn: "Set Reminder" };
    const activeModal = this.modalService.open(ReminderComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.ticketData._isremind = 2;
      }
    });
  }

  checkReminderSeen() {
    let params = {
      ticketId: this.ticketId
    };
    this.common.loading++;
    this.api.post('Ticket/checkTicketReminderSeen', params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.common.showToast(res['msg']);
      this.ticketData._isremind = 0;
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  handleFileSelection(event) {
    this.common.loading++;
    for (let i = 0; i < event.target.files.length; i++) {
      this.common.getBase64(event.target.files[i]).then((res: any) => {
        console.log("🚀 ~ file: task-message.component.ts ~ line 697 ~ TaskMessageComponent ~ this.common.getBase64 ~ res", res)
        let file = event.target.files[i];
        console.log("🚀 ~ file: ticket-chatbox.component.ts ~ line 636 ~ TicketChatboxComponent ~ this.common.getBase64 ~ file", file)
        var ext = file.name.split('.').pop();
        let format = this.formatIcon(ext);
        let formats = ["jpeg", "jpg", "png", 'xlsx', 'xls', 'docx', 'doc', 'pdf', 'csv'];
        if (formats.includes(ext.toLowerCase())) {
        } else {
          this.common.showError(`${file.name} is not right format.Valid Format Are : jpeg, png, jpg, xlsx, xls, docx, doc, pdf, csv`);
          return false;
        }
        // this.attachmentFile.name = file.name;
        // this.attachmentFile.file = res;
        this.attachmentFile.push({ name: file.name, file: res, format: format });
        console.log(this.attachmentFile);
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
    }
    this.common.loading--;
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
    return icon;
    this.fileType = icon;
  }


  removeFile(i) {
    this.attachmentFile.splice(i, 1);
    console.log('after delete', this.attachmentFile);
  }

  onPaste(event: any) {
    // console.log('event', event);
    const items = event.clipboardData.items;
    let selectedFile = { "target": { "files": [] } };
    // if (items.length > 1) {
    //   this.common.showError("Only select single file");
    // }
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        event.preventDefault();
        selectedFile.target.files.push(item.getAsFile());
      }
    }
    this.handleFileSelection(selectedFile);
  }

  filesDropped(files: FileHandle[]) {
    console.log("ChatboxComponent -> filesDropped -> files", files)
    this.files = files;
    let selectedFile = { "target": { "files": [] } };
    // selectedFile.target.files.push(this.files[0].file);
    this.files.map(files => {
      selectedFile.target.files.push(files.file)
    })
    console.log("🚀 ~ file: task-message.component.ts ~ line 741 ~ TaskMessageComponent ~ filesDropped ~ selectedFile", selectedFile);
    this.handleFileSelection(selectedFile);
  }

  messageReadInfo(commentId) {
    this.commentInfo = [];
    let params = "?ticketId=" + this.ticketId + "&commentId=" + commentId
    this.api.get('Ticket/getMessageReadInfo' + params).subscribe(res => {
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

  onMessageType(e) {
    let value = e.data;
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
      // console.log("onMessageType");
      this.isMentionedUser = true;
      this.mentionedUserList = accessUsers;//this.adminList;
      setTimeout(() => {
        this.userlistInput.toArray()[0].nativeElement.focus();
      }, 100);
    } else if (e && value && value == " ") {
      // console.log("onMessageType2");
      this.isMentionedUser = false;
    } else if (this.isMentionedUser) {
      let splieted = this.taskMessage.split('@');
      let searchableTxt = splieted[splieted.length - 1];
      this.mentionedUserList = accessUsers.filter(x => { return (x.name.toLowerCase()).includes(searchableTxt.toLowerCase()) }); //this.adminList.filter(x => { return (x.name.toLowerCase()).includes(searchableTxt.toLowerCase()) });
      if (this.mentionUserIndex >= this.mentionedUserList.length) {
        this.mentionUserIndex = 0;
      }
    }
  }

  onSelectMenstionedUser(user) {
    if (!this.mentionedUsers.find(x => x.id == user.id)) {
      this.mentionedUsers.push({ id: user.id, name: user.name });
    }
    // this.mentionedUsers.push({ id: user.id, name: user.name });
    console.log("mentionedUsers2:", this.mentionedUsers);
    let splieted = this.taskMessage.split('@');
    splieted.pop();
    this.taskMessage = splieted.join('@') + '@' + user.name + ' ';
    this.msgtextarea.nativeElement.focus();
  }


  search() {
    this.isSearchShow = !this.isSearchShow;
    setTimeout(() => { // this will make the execution after the above boolean has changed
      document.getElementById('searchChat').focus();
    }, 0);
  }


  searchChat(value) {
    let messageList = JSON.parse(JSON.stringify(this.messageListShow));
    this.common.searchString(value, messageList).then((res) => {
      console.log("res:", res);
      this.searchedIndex = res.searchedIndex;
      this.searchCount = this.searchedIndex.length;
      this.messageList = res.messageList;
      setTimeout(() => {
        this.searchCount > 0 ? this.focusOnSelectedIndex() : null;
      }, 500);
    });
  }

  scrollToChat(focusOn) {
    try {
      setTimeout(() => {
        let scrollIntoView = document.getElementById("focusOn-" + focusOn);
        (scrollIntoView) ? scrollIntoView.scrollIntoView() : null;
      }, 100);
    } catch (err) { }
  }

  onchangeIndex(type) {
    console.log('selectedIndex:', this.selectedIndex, this.searchedIndex.length);
    if (this.searchedIndex.length > 0) {
      if (type == "plus") {
        if (this.selectedIndex == this.searchedIndex.length - 1) {
          return false;
        }
        this.selectedIndex++;
        this.searchCount--;
      } else {
        if (this.selectedIndex == 0) {
          return false;
        }
        this.selectedIndex--;
        this.searchCount++;
      }
      this.focusOnSelectedIndex();
    }
  }

  focusOnSelectedIndex() {
    let focusOn = this.searchedIndex[this.selectedIndex];
    console.log("focusOn:", focusOn);
    for (let i = 0; i < this.searchedIndex.length; i++) {
      let removeClass = document.getElementById("focusOn-" + this.searchedIndex[i])
      if (removeClass)
        removeClass.classList.remove('text-focus-highlight');
    }
    let addClass = document.getElementById("focusOn-" + focusOn);
    if (addClass)
      addClass.classList.add('text-focus-highlight');
    this.scrollToChat(focusOn);
  }

  reduceFocusHandler() {
    this.messageList = JSON.parse(JSON.stringify(this.messageListShow));
    this.searchedIndex = [];
    this.searchCount = 0;
  }
}
