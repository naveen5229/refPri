import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList,HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ReminderComponent } from '../../reminder/reminder.component';
import { AddTransactionActionComponent } from '../add-transaction-action/add-transaction-action.component';
import { FormDataComponent } from '../form-data/form-data.component';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FileHandle } from '../../../directives/dndDirective/dnd.directive';

@Component({
  selector: 'ngx-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss'],
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
export class ChatboxComponent implements OnInit {
  files: FileHandle[] = [];
  @ViewChild('chat_block', { static: false }) private myScrollContainer: ElementRef;
  taskMessage = "";
  title = '';
  subTitle = null;
  ticketId = 0;
  statusId = 0;
  messageList = [];
  messageListShow = [];
  showLoading = true;
  loginUserId = this.userService.loggedInUser.id;
  lastMsgId = 0;
  lastSeenId = 0;
  lastSeenIdForView = 0; //only for view
  userListByTask = [];
  adminList = [];
  newCCUserId = [];
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
  activeTab = 'actionList';
  priOwnId = null;
  stateOwnerId = null;
  // attachmentFile = {
  //   name: null,
  //   file: null
  // };
  attachmentFile = [];
  attachmentList = [];
  isAttachmentShow = false;
  actionOwnerForm = {
    transId: null,
    actionId: null,
    userId: null,
    userName: null,
    oldOwnerName: null
  }
  userGroupList = [];
  userWithGroup = [];
  bGConditions = [
    {
      key: 'groupId',
      class: 'highlight-blue',
      isExist: true
    }
  ];

  parentCommentId = null;
  mentionedUsers = [];
  replyStatus = null;
  parentComment = null;
  replyType = null;
  isReplyOnDemand = false;
  commentInfo = [];
  isMentionedUser = false;
  mentionedUserList = [];
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
  fileType = null;

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
      this.priOwnId = this.common.params.editData.priOwnId;
      this.stateOwnerId = this.common.params.editData.stateOwnerId;
      this.ticketData = this.common.params.editData.rowData;
      this.adminList = this.common.params.userList.map(x => { return { id: x.id, name: x.name, groupId: null, groupuser: null } });
      this.userGroupList = this.common.params.groupList;
      if (this.userGroupList) {
        this.userWithGroup = this.userGroupList.concat(this.adminList);
      } else {
        this.userWithGroup = this.adminList.concat(this.userGroupList);
      }
      console.log("userGroupList:", this.userGroupList);
      this.getLeadMessage();
      this.getAllUserByLead();
      // this.getAllAdmin();
      this.getTargetActionData();
      this.getAttachmentByLead();
    }
    this.lastSeenIdForView = this.lastSeenId;

    // console.log("user_details:", this.userService._details)
  }

  ngOnInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    // this.scrollToBottom();
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

  getAttachmentByLead() {
    this.attachmentList = [];
    this.api.get('Processes/getAttachmentByLead?ticketId=' + this.ticketId).subscribe(res => {
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

  getLeadMessage() {
    this.showLoading = true;
    let params = {
      ticketId: this.ticketId
    }
    this.api.post('Processes/getLeadMessage', params).subscribe(res => {
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
              this.lastMessageReadoflead();
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

  saveLeadMessage() {
    if (this.taskMessage == "" && !(this.attachmentFile && this.attachmentFile.length)) {
      return this.common.showError("Message is missing");
    } else {
      let formatedMsg = this.taskMessage.trim();
      if (formatedMsg && (formatedMsg.match('www.') || formatedMsg.match('http://') || formatedMsg.match('https://') || formatedMsg.substr(formatedMsg.indexOf('.')).match('.com') || formatedMsg.substr(formatedMsg.indexOf('.')).match('.in'))) {
        formatedMsg = this.common.getFormatedString(formatedMsg, "www.");
      }
      let mentionedUsers = (this.mentionedUsers && this.mentionedUsers.length > 0) ? this.mentionedUsers.map(x => { return { user_id: x.id, name: x.name } }) : null;
      if (mentionedUsers && mentionedUsers.length > 0) {
        mentionedUsers = this.common.checkMentionedUser(mentionedUsers, this.taskMessage);
      }
      this.common.loading++;
      let params = {
        ticketId: this.ticketId,
        status: this.statusId,
        message: formatedMsg,
        attachments: JSON.stringify(this.attachmentFile.map(attachments=> {return{name: attachments.name, file: attachments.file}})),
        parentId: (this.replyType > 0) ? this.parentCommentId : null,
        users: (mentionedUsers && mentionedUsers.length > 0) ? JSON.stringify(mentionedUsers) : null,
        replyStatus: (this.replyType > 0) ? this.replyStatus : null,
        requestId: null
      }
      this.api.post('Processes/saveLeadMessage', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          this.taskMessage = "";
          this.attachmentFile = [];
          this.resetQuotedMsg();
          this.getLeadMessage();
          this.getAttachmentByLead();
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

  handleFileSelection(event) {
    this.common.loading++;
    for (let i = 0; i < event.target.files.length; i++) {
      this.common.getBase64(event.target.files[i]).then((res: any) => {
        let file = event.target.files[i];
        var ext = file.name.split('.').pop();
        let format = this.formatIcon(ext);
        let formats = ["jpeg", "jpg", "png", 'xlsx', 'xls', 'docx', 'doc', 'pdf', 'csv'];
        if (formats.includes(ext.toLowerCase())) {
        } else {
          this.common.showError("Valid Format Are : jpeg, png, jpg, xlsx, xls, docx, doc, pdf,csv");
          return false;
        }
        // this.attachmentFile.name = file.name;
        // this.attachmentFile.file = res;
        this.attachmentFile.push({ name: file.name, file: res, format:format });
        console.log("attachmentFile:", this.attachmentFile);
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

  removeFile(i){
    this.attachmentFile.splice(i,1);
    console.log('after delete',this.attachmentFile);
  }

  onPaste(event: any) {
    console.log('event', event);
    const items = event.clipboardData.items;
    let selectedFile = { "target": { "files": [] } };
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        event.preventDefault();
        selectedFile.target.files.push(item.getAsFile());
      }
    }
    // console.log("ChatboxComponent -> onPaste -> selectedFile", selectedFile)
    this.handleFileSelection(selectedFile);
  }

  filesDropped(files: FileHandle[]) {
    // console.log("ChatboxComponent -> filesDropped -> files", files)
    this.files = files;
    let selectedFile = { "target": { "files": [] } };
    this.files.map(files => {
      selectedFile.target.files.push(files.file)
    })
    this.handleFileSelection(selectedFile);
  }

  getAllUserByLead() {
    let params = {
      leadId: this.ticketId
    }
    this.api.post('Processes/getAllUserByLead', params).subscribe(res => {
      if (res['code'] == 1) {
        this.userListByTask = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.showLoading = false;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  addNewCCUserToLead() {
    if (this.ticketId > 0 && this.newCCUserId.length > 0) {
      let ccUsers =[];
      this.newCCUserId.map(ele => {
        ccUsers.push({user_id: ele.id })
      })
      let params = {
        leadId: this.ticketId,
        ccUserId: JSON.stringify(ccUsers)
      }
      this.common.loading++;
      this.api.post('Processes/addNewCCUserToLead', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          this.newCCUserId = [];
          this.getAllUserByLead();
        } else {
          this.common.showError(res['msg']);
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
      if (this.userListByTask['leadUsers'][0]._pri_own_id == this.newAssigneeUser.id) {
        this.common.showError("Please assign a new user");
        return false;
      }
      let params = {
        leadId: this.ticketId,
        assigneeUserId: this.newAssigneeUser.id,
        isCCUpdate: isCCUpdate,
        assigneeUserNameOld: this.userListByTask['leadUsers'][0].primary_owner,
        assigneeUserNameNew: this.newAssigneeUser.name
      }
      this.common.loading++;
      this.api.post('Processes/updateLeadPrimaryOwner', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.getAllUserByLead();
            this.getLeadMessage();
            this.showAssignUserAuto = null;
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
    } else {
      this.common.showError("Select Primary Owner")
    }
  }

  lastMessageReadoflead() {
    let params = {
      ticketId: this.ticketId,
      comment_id: this.lastMsgId
    }
    if (this.lastSeenId < this.lastMsgId) {
      this.api.post('Processes/readLastMessage', params).subscribe(res => {
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
    document.getElementById("userLogsModal").style.display = "block";
  }
  // end: campaign msg

  getTargetActionData(type = null) {
    this.resetTable();
    this.transActionData = [];
    const params = "?transId=" + this.ticketId;
    let apiName = (type == 1) ? 'Processes/getTransactionStateList' : 'Processes/getTransactionActionList';
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.transActionData = res['data'] || [];
        this.transActionData.length ? this.setTable(type) : this.resetTable();
      }else{
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  resetTable() {
    this.tableTransActionData.data = {
      headings: {},
      columns: []
    };
  }

  setTable(type) {
    this.tableTransActionData.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns(type)
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.transActionData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "completion_time" || key === 'action_target_time') {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumns(type) {
    let columns = [];
    this.transActionData.map(lead => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else if (!type && key == 'completion_time' && lead[key]) {
          column[key] = { value: lead[key], class: 'blue', action: this.openTransAction.bind(this, lead, type, null), title: 'Add next state' };
        } else if (!type && key == 'action_owner' && !lead['completion_time']) {
          column[key] = { value: lead[key], class: 'blue', action: this.openEditActionOwnerModal.bind(this, lead), title: 'Change Action Owner' };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    return columns;
  }

  actionIcons(lead, type) {
    let formType = (type == 1) ? 1 : 2;
    let icons = [];
    if (!type && !lead.completion_time) {
      icons.push({ class: 'fas fa-trash-alt ml-2', action: this.deleteLeadAction.bind(this, lead), txt: '', title: "Delete Action" });
    }
    else if (type == 1) {
      icons.push({ class: 'fas fa-trash-alt ml-2', action: this.deleteLeadState.bind(this, lead), txt: '', title: "Delete State" });
    }
    if (lead._action_form == 1 || lead._state_form == 1) {
      icons.push({ class: "fas fa-plus-square text-primary", action: this.openTransFormData.bind(this, lead, type, formType, false), txt: '', title: "Action Form" })
    } else if (lead._action_form == 2 || lead._state_form == 2) {
      icons.push({ class: "fas fa-plus-square text-success", action: this.openTransFormData.bind(this, lead, type, formType, false), txt: '', title: "Action Form" })
    }
    console.log("icons:", icons);
    return icons;
  }

  deleteLeadAction(row) {
    if (![this.priOwnId, row._action_owner].includes(this.loginUserId)) {
      this.common.showError("Primary Owner/Action Owner have access to delete");
      return false;
    }
    let params = {
      transId: this.ticketData._transactionid,
      transActionId: row._trans_action_id,
    }
    if (row._trans_action_id) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/removeTransactionAction', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['msg']);
                this.getTargetActionData();
              } else {
                this.common.showError(res['msg']);
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
      });
    } else {
      this.common.showError("Invalid request");
    }
  }

  deleteLeadState(row) {
    if (![this.priOwnId, row._action_owner].includes(this.loginUserId)) {
      this.common.showError("Primary Owner have access to delete");
      return false;
    }
    let params = {
      transId: this.ticketData._transactionid,
      transStateId: row._trans_state_id,
    }
    if (row._trans_state_id) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/removeTransactionState', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['msg']);
                this.getTargetActionData(1);
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
      });
    } else {
      this.common.showError("Invalid request");
    }
  }

  openTransAction(lead, type, formType = null) {
    if (![this.priOwnId].includes(this.userService.loggedInUser.id)) {
      this.common.showError("Permission Denied");
      return false;
    }
    let formTypeTemp = 0;
    if (!formType) {
      formTypeTemp = 1;
    } else {
      formTypeTemp = formType;
    }
    let actionData = {
      processId: this.ticketData._processid,
      transId: lead._transid,
      processName: this.ticketData._processname,
      identity: this.ticketData.identity,
      formType: formTypeTemp,
      requestId: null,
      actionId: null,
      actionName: null,
      stateId: (this.ticketData._state_id > 0) ? this.ticketData._state_id : null,
      stateName: (this.ticketData._state_id > 0) ? this.ticketData._state_name : null,
      actionOwnerId: null
    };
    let title = (actionData.formType == 0) ? 'Transaction Action' : 'Transaction Next State';
    this.common.params = { actionData, adminList: this.adminList, title: title, button: "Add" };
    const activeModal = this.modalService.open(AddTransactionActionComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response && data.nextFormType) {
        // nextFormType: 1 = fromstate, 2=fromaction
        if (data.nextFormType == 1) {
          lead['_next_state_id'] = data.state.id;
          lead['next_state_name'] = data.state.name;
          if (data.isFormHere == 1) {
            this.openTransFormData(lead, type, data.nextFormType, true);
          } else {
            lead._state_id = data.state.id;
            lead.state_name = data.state.name;
            this.openTransAction(lead, type, 2);
          }
        } else if (data.nextFormType == 2) {
          if (data.isFormHere == 1) {
            this.openTransFormData(lead, type, data.nextFormType, true);
          } else {
            this.openTransAction(lead, type, 1);
          }
        }
      } else {
        this.getTargetActionData(type);
      }
    });
  }

  openTransFormData(lead, type, formType = null, isNextForm = false) {
    let title = 'Action Form';
    let refId = 0;
    let refType = 0;
    // formType: 1 = stateform, 2=actionform
    if (formType == 1) {
      title = 'State Form';
      refId = lead._state_id;
      refType = 0;
    } else if (formType == 2) {
      title = 'Action Form';
      refId = lead._action_id;
      refType = 1;
    }
    let actionData = {
      processId: this.ticketData._processid,
      processName: this.ticketData._processname,
      transId: lead._transid,
      refId: refId,
      refType: refType,
      formType: formType,
      isDisabled: lead.completion_time ? true : false
    };

    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      // console.log("formData:", formType);
      if (isNextForm && formType == 2) {
        this.openTransAction(lead, type, 1);
      } else if (isNextForm && formType == 1) {
        if(lead._next_state_id){
          lead._state_id = lead._next_state_id;
          lead.state_name = lead.next_state_name;
        }
        this.openTransAction(lead, type, 2);
      } else {
        this.getTargetActionData(type);
      }
    });
  }

  openPrimaryInfoFormData() {
    let lead = this.ticketData;
    let title = 'Primary Info Form';
    let actionData = {
      processId: lead._processid,
      processName: lead._processname,
      transId: lead._transactionid,
      refId: lead._processid,
      refType: 3,
      formType: null,
    };
    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  viewTransaction() {
    let lead = this.ticketData;
    let rowData = {
      transId: lead._transactionid,
      processId: lead._processid,
      processName: lead._processname,
      identity: lead.identity,
      priOwnId: lead._pri_own_id,
      isDisabled: true
    }
    this.common.params = { rowData, processList: null, adminList: null, title: "View Transaction ", button: "Update" }
    const activeModal = this.modalService.open(AddTransactionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  closeEditActionOwnerModal() {
    document.getElementById("editActionOwnerModal").style.display = "none";
  }

  openEditActionOwnerModal(row) {
    // console.log(`[${this.priOwnId}, ${row._action_owner}, ${this.stateOwnerId}] includes ${this.loginUserId}`);
    if (![this.priOwnId, row._action_owner, this.stateOwnerId].includes(this.loginUserId)) {
      this.common.showError("Primary Owner/Action Owner have access to change");
      return false;
    }
    this.actionOwnerForm.transId = this.ticketData._transactionid;
    this.actionOwnerForm.actionId = row._trans_action_id;
    this.actionOwnerForm.oldOwnerName = row.action_owner;
    document.getElementById("editActionOwnerModal").style.display = "block";
  }

  resetActionOwnerForm() {
    this.actionOwnerForm.transId = null;
    this.actionOwnerForm.actionId = null;
    this.actionOwnerForm.userId = null;
    this.actionOwnerForm.userName = null;
    this.actionOwnerForm.oldOwnerName = null;
  }

  changeActionOwner() {
    if (this.actionOwnerForm.userId > 0) {
      let params = {
        transId: this.actionOwnerForm.transId,
        transActionId: this.actionOwnerForm.actionId,
        actionOwnerId: this.actionOwnerForm.userId,
        actionOwnerName: this.actionOwnerForm.userName,
        actionOwnerNameOld: this.actionOwnerForm.oldOwnerName,
      }
      this.common.loading++;
      this.api.post('Processes/changeTransactionActionOwner', params).subscribe(res => {
          this.common.loading--;
          if (res['code'] == 1) {
            if (res['data'][0].y_id > 0) {
              this.common.showToast(res['msg']);
              this.resetActionOwnerForm();
              this.closeEditActionOwnerModal();
              this.getTargetActionData();
            } else {
              this.common.showError(res['msg']);
            }
          } else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    } else {
      this.common.showError("Action owner is missing");
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

  messageReadInfo(commentId) {
    this.commentInfo = [];
    let params = "?ticketId=" + this.ticketId + "&commentId=" + commentId;
    this.api.get('Processes/getMessageReadInfo' + params).subscribe(res => {
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
    // console.log("target value:", e.target.value);
    // console.log("target value22:", value);
    let accessUsers = [];
    if (this.userListByTask['leadUsers'][0]._pri_own_id != this.loginUserId) {
      accessUsers.push({ id: this.userListByTask['leadUsers'][0]._pri_own_id, name: this.userListByTask['leadUsers'][0].primary_owner });
    }
    if (this.userListByTask['leadUsers'][0]._aduserid != this.loginUserId) {
      accessUsers.push({ id: this.userListByTask['leadUsers'][0]._aduserid, name: this.userListByTask['leadUsers'][0].assignby });
    }
    if (this.userListByTask['ccUsers'] && this.userListByTask['ccUsers'].length > 0) {
      this.userListByTask['ccUsers'].forEach(element => {
        if (element._cc_user_id != this.loginUserId) {
          accessUsers.push({ id: element._cc_user_id, name: element.cc_user });
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
    if(!this.mentionedUsers.find(x=>x.id==user.id)){
      this.mentionedUsers.push({ id: user.id, name: user.name });
    }
    // console.log("mentionedUsers2:", this.mentionedUsers);
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
      this.common.searchString(value,messageList).then((res)=>{
        console.log("res:",res);
        this.searchedIndex = res.searchedIndex;
        this.searchCount = this.searchedIndex.length;
        this.messageList = res.messageList;
        setTimeout(() => {
          this.searchCount>0 ? this.focusOnSelectedIndex() : null;
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
    console.log('selectedIndex:', this.selectedIndex,this.searchedIndex.length);
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
    if(addClass)
      addClass.classList.add('text-focus-highlight');
    this.scrollToChat(focusOn);
  }

  reduceFocusHandler() {
    this.messageList = JSON.parse(JSON.stringify(this.messageListShow));
    this.searchedIndex = [];
    this.searchCount = 0;
  }
}
