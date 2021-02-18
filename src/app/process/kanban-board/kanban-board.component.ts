import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragRelease, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { ApiService } from '../../Service/Api/api.service';
import { ChartService } from '../../Service/Chart/chart.service';
import { CommonService } from '../../Service/common/common.service';
import { AddTransactionActionComponent } from '../../modals/process-modals/add-transaction-action/add-transaction-action.component';
import { FormDataComponent } from '../../modals/process-modals/form-data/form-data.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';
import { ChatboxComponent } from '../../modals/process-modals/chatbox/chatbox.component';
import * as _ from 'lodash';
import { NbSidebarService } from '@nebular/theme';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  cardlength = null;
  dashboardState = false;
  processList = [];
  processListTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  }
  cards = [];
  cardsForFilter = [];
  adminList = [];
  processId = null;
  processName = null;
  issueCategory = true;
  cardsUserGroup = [];
  cardsForFilterByUser = [];
  filterUserGroup = [];
  taskStatusBarData = [
    {
      id: 'workLog',
      data: []
    }
  ];
  inprogressTimer = null;
  activityProgressStatus = 5;
  activityHold = {ticket:null,isHold:null,startTime:new Date(),endTime:new Date()};

  constructor(private sidebarService: NbSidebarService,
    public common: CommonService,
    public api: ApiService,
    public chart: ChartService,
    public modalService: NgbModal,
    public userService: UserService) {
    this.getProcessListByUser();
    this.getAllAdmin();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    if (this.dashboardState) {
      this.goToBoard({ _id: this.processId, name: this.processName });
      this.getProcessListByUser();
    } else {
      this.getProcessListByUser();
      this.getAllAdmin();
    }
  }

  toggleSidebar(type): boolean {
    let sideBarClassList = document.querySelectorAll('.menu-sidebar')[0].classList;
    if((type=="expand" && sideBarClassList.contains('compacted')) || (type=="compact" && !sideBarClassList.contains('compacted'))){
      this.sidebarService.toggle(true, 'menu-sidebar');
    }
    return false;
  }

  getProcessListByUser() {
    this.common.loading++;
    this.api.get(`Processes/getProcessListByUser`).subscribe((res) => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.processList = res['data'] || [];
        console.log("🚀 ~ file: kanban-board.component.ts ~ line 70 ~ KanbanBoardComponent ~ this.api.get ~ this.processList", this.processList)
        this.setProcessList();
      } else {
        this.common.showError(res['msg']);
      }
    }, (err) => {
      this.common.loading--;
      this.common.showError(err);
    });
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

  setProcessList() {
    this.processListTable.data = {
      headings: this.generateHeadingsProcessList(),
      columns: this.getTableColumnsProcessList()
    };
    return true;
  }

  generateHeadingsProcessList() {
    let headings = {};
    for (var key in this.processList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsProcessList() {
    let columns = [];
    this.processList.map(process => {
      let column = {};
      for (let key in this.generateHeadingsProcessList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(process),
            _data: process
          };
        } else {
          column[key] = { value: process[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(process._status) };
      }
      columns.push(column);
    });
    return columns;
  }

  actionIcons(lead) {
    let Icons = [{
      class: "btn btn-primary cursor-pointer",
      action: this.goToBoard.bind(this, lead),
      txt: "View Board",
      title: "View Board",
    }];

    return Icons
  }

  goToBoard(lead) {
    this.processId = lead._id;
    this.processName = lead.name;
    let params = `processId=${lead._id}&filter=null`
    this.common.loading++;
    this.api.get(`Processes/getProcessBoardView?` + params).subscribe((res) => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let boardData = res['data'] || [];
      this.cards = boardData;
      this.cardsForFilter = JSON.parse(JSON.stringify(boardData));
      this.placeCardLength(this.cards);
      this.getAllUserGroup(this.cards);
      this.dashboardState = true;
      this.toggleSidebar('compact');
    }, (err) => {
      this.common.loading--;
      this.common.showError(err);
    });
  }

  placeCardLength(boardData) {
    if (boardData) {
      boardData.forEach(element => {
        if (element.data) {
          element.transCount = element.data.filter(obj => obj._is_action === 0).length;
          element.actionCount = element.data.filter(obj => obj._is_action === 1).length;
        }
      });
    }
  }

  getAllUserGroup(boardData) {
    this.cardsUserGroup = [];
    let userGroup = [];
    if (boardData) {
      boardData.forEach(element => {
      console.log("🚀 ~ file: kanban-board.component.ts ~ line 205 ~ KanbanBoardComponent ~ getAllUserGroup ~ element", element)

        if(element.id === 'new'){
          element.connectedto = ['workLog'];
        }

        if (element.data) {
          element.data.forEach(data => {
            data.log_start_time = new Date();
            userGroup.push({ id: data.userid, name: data.user, user_label: data.user_label, color: '#3366ff' });
          })
        }
      });
    }
    let groupBy = _.groupBy(userGroup, data => { return data.id });
    Object.keys(groupBy).map(key => {
      this.cardsUserGroup.push(groupBy[key][0]);
    });
  }

  goToList() {
    this.dashboardState = false;
    this.processId = null;
    this.processName = null;
    this.getProcessListByUser();
    this.toggleSidebar('expand');
  }

  onDragStarted(event: CdkDragStart<string[]>) {
    // let scrollWidth = document.getElementById('cardField').offsetWidth;
    // console.log("🚀 ~ file: kanban-board.component.ts ~ line 157 ~ KanbanBoardComponent ~ onDragStarted ~ scrollWidth", scrollWidth)
    let connTo = JSON.parse(JSON.stringify(event.source.dropContainer.connectedTo));
    if (connTo) {
      connTo.forEach(e2 => {
        document.getElementById(e2).style.border = 'inset';
        document.getElementById(e2).style.borderColor = 'gray';
        // console.log(document.getElementById(e2).children[4]);
        // document.getElementById(e2).children[4].classList.add('dragStyle');
      });
    }
  };
  onDragEnded(event: CdkDragEnd<string[]>) {
    let connTo = JSON.parse(JSON.stringify(event.source.dropContainer.connectedTo));
    if (connTo) {
      connTo.forEach(e2 => {
        console.log("connTo:", e2);
        document.getElementById(e2).style.border = null;
        document.getElementById(e2).style.borderColor = null;
        // document.getElementById(e2).children[4].classList.remove('dragStyle');
      });
    }
  };


  drop(event: CdkDragDrop<string[]>) {
    let containerIdTemp = (event.container.id).toLowerCase();
    let ticket = event.previousContainer.data[event.previousIndex];
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 232 ~ KanbanBoardComponent ~ drop ~ event", event)
    if (event.previousContainer === event.container) {
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log('Pd', event.previousContainer.data)
      // transferArrayItem(event.previousContainer.data,
      //                   event.container.data,
      //                   event.previousIndex,
      //                   event.currentIndex);

      // if (event.container['_disabled']) {
      //   return;
      // }

      
      if (containerIdTemp === 'worklog') {
        if ((event.previousContainer.id).toLowerCase() === 'inprogress') {
          ticket["_last_logid"] = null;
        }
        if (this.taskStatusBarData[0].data[0]) {
          this.common.showError('A Task Already In Progress');
          this.goToBoard({ _id: this.processId, name: this.processName });
          return false;
        }
        // this.taskStatusBarData[0].data[0] = ticket;
        this.saveActivityLog(ticket, 0, 0);
      }

      
      let moveFrom = this.cards.findIndex(data => data.id === event.previousContainer.id);
      let moveTo = this.cards.findIndex(data => data.id === event.container.id);
      let isComplete = moveTo > moveFrom ? true : false;
      if (!event.isPointerOverContainer) {
        return;
      }
      this.cards.forEach((data, i) => {
        if (data.id === event.container.id) {
          console.log('index', data, i);
          if (data.data === null) {
            data.data = [];
          }
          data.data.push(JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex])));
          if (event.previousContainer.data[event.previousIndex]['_is_action'] === 1) {
            let lead = event.previousContainer.data[event.previousIndex];
            lead['_state_id'] = this.cards[moveFrom]['_state_id'];
            lead['_state_name'] = this.cards[moveFrom]['title'];
            lead['_next_state_id'] = this.cards[moveTo]['_state_id'];
            lead['_next_state_name'] = this.cards[moveTo]['title'];
            this.openTransAction(lead, null, null, isComplete);
          } else {
            // this.openTransFormData(event.previousContainer.data[event.previousIndex],null,null);
            let transaction = {
              _transaction_id: event.previousContainer.data[event.previousIndex]['_transaction_id'],
              _state_id: this.cards[moveFrom]['_state_id'],
              _next_state_id: this.cards[moveTo]['_state_id'],
              state_name: this.cards[moveFrom]['title'],
              _next_state_name: this.cards[moveTo]['title'],
              _state_form: event.previousContainer.data[event.previousIndex]['_state_form']
            }
            if(transaction._state_form){
              this.openTransFormData(transaction, null, 1);
            }else{
              this.saveTransNextState(transaction);
            }
          }
        }
        setTimeout(() => {
          if (data.id === event.previousContainer.id) {
            data.data.splice(event.previousIndex, 1);
          }
        }, 200);
      })
    }
  }

  movedIn(event) {
    // console.log("🚀 ~ file: kanban-board.component.ts ~ line 223 ~ KanbanBoardComponent ~ movedIn ~ event", event)
    let scrollWidth = document.getElementById('cardField');
    if (event.delta.x == 1) {
      scrollWidth.scrollTo(scrollWidth.scrollLeft + 5, 0);
    } else if (event.delta.x == -1) {
      scrollWidth.scrollTo(scrollWidth.scrollLeft - 5, 0);
    }
  }

  openTransAction(lead, type, formType = null, isComplete: Boolean = null) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 317 ~ KanbanBoardComponent ~ openTransAction ~ lead", lead)
    let formTypeTemp = 0;
    if (!formType) {
      formTypeTemp = 0;
    } else {
      formTypeTemp = formType;
    }
    let actionData = {
      processId: this.processId,
      processName: this.processName,
      transId: lead._transaction_id,
      identity: null,
      formType: formTypeTemp,
      requestId: (lead._is_action == 1) ? lead._transaction_actionid : null,
      actionId: (lead._action_id > 0) ? lead._action_id : null,
      actionName: (lead._action_id > 0) ? lead._action_name : '',
      stateId: (lead._state_id > 0) ? lead._state_id : null,
      stateName: (lead._state_id > 0) ? lead._state_name : '',
      actionOwnerId: this.userService._details.id, //current user
      modeId: (lead._mode_id > 0) ? lead._mode_id : null,
      modeName: (lead._mode_id > 0) ? lead._mode_name : '',
      remark: (lead._remark) ? lead._remark : null,
      isStateForm: lead._state_form,
      isActionForm: lead._action_form,
      isModeApplicable: (lead._is_mode_applicable) ? lead._is_mode_applicable : 0,
      isMarkTxnComplete: (lead._state_change == 2 && lead._is_action == 1) ? 1 : null
    };

    // console.log('actionData',actionData);
    // return;
    let title = (actionData.formType == 0) ? 'Transaction Action' : 'Transaction Next State';
    this.common.params = { actionData, adminList: this.adminList, title: title, button: "Add", isComplete: isComplete };
    const activeModal = this.modalService.open(AddTransactionActionComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log("res data:", data, lead);
      if (data.response && data.nextFormType) {
        // nextFormType: 1 = fromstate, 2=fromaction
        // if (data.nextFormType == 1) {
        //   lead._state_id = data.state.id;
        //   lead.state_name = data.state.name;
        //   if (data.isFormHere == 1) {
        //     this.openTransFormData(lead, type, data.nextFormType);
        //   }
        //   else {
        //     this.openTransAction(lead, type, 2);
        //   }

        // } else if (data.nextFormType == 2) {
        //   if (data.isFormHere == 1) {
        //     this.openTransFormData(lead, type, data.nextFormType);
        //   } else {
        //     this.openTransAction(lead, type, 1);
        //   }
        // }
        if (data.nextFormType == 2 && data.isFormHere == 1) {
          this.openTransFormData(lead, type, data.nextFormType);
        } else {
          this.goToBoard({ _id: this.processId, name: this.processName });
        }
      } else {
        this.goToBoard({ _id: this.processId, name: this.processName });
      }
    });
  }

  openTransFormData(lead, type, formType = null) {
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
      processId: this.processId,
      processName: this.processName,
      transId: lead._transaction_id,
      refId: refId,
      refType: refType,
      formType: formType,
    };

    this.common.params = { actionData, title: title, button: "Save" };
    const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log("formData:", formType);
      if (formType == 2) {
        this.openTransAction(lead, type, 1);
      } else if (formType == 1) {
        // this.openTransAction(lead, type, 2);
        this.saveTransNextState(lead);
      } else {
        this.goToBoard({ _id: this.processId, name: this.processName });
      }
    });
  }


  saveTransNextState(transaction) {
    if (!transaction._next_state_id) {
      this.common.showError('Next state is missing');
      this.goToBoard({ _id: this.processId, name: this.processName });
    }
    else {
      const params = {
        requestId: null,
        transId: transaction._transaction_id,
        stateId: transaction._next_state_id,
        actionId: null,
        nexActId: null,
        nextActTarTime: null,
        remark: null,
        modeId: null,
        actionOwnerId: null,
        isNextAction: null,
        isCompleted: false
      };
      console.log("saveTransNextState - saveTransAction:", params,transaction);
      // return;
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            // transaction._state_id = transaction._next_state_id;
            // transaction.state_name = transaction._next_state_name;
            // if (transaction._state_form == 1) {
            //   this.openTransFormData(transaction, null, 1);
            // }else {
            //   // this.openTransAction(lead, type, 2);
            //   this.goToBoard({ _id: this.processId, name: this.processName });
            // }

            // this.transAction.state = this.transAction.nextState;
            // this.isFormHere = this.nextStateForm;
            if (transaction._state_type == 2) {
              setTimeout(() => {
                this.markTxnComplete(params.transId);
              }, 1000);
            }else {
              // this.openTransAction(lead, type, 2);
              this.goToBoard({ _id: this.processId, name: this.processName });
            }
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
    }
  }

  markTxnComplete(transId) {
    console.log("confrm transId:", transId);
    this.common.params = {
      title: 'Mark Txn Complete',
      description: '<b>Are you sure to complete this Transaction ?<b>'
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        this.updateTransactionStatus(transId, 5);
      }
    });
  }

  
  updateTransactionStatus(transId, status) {
    if (transId) {
      let params = {
        transId: transId,
        status: status
      }
      this.common.loading++;
      this.api.post('Processes/updateTransactionStatus', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
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
      this.common.showError("Transaction ID Not Available");
    }
  }

  transMessage(lead, type) {
    if (lead._transaction_id > 0) {
      let editData = {
        transactionid: lead._transaction_id,
        lastSeenId: lead._lastreadid,
        tabType: type,
        priOwnId: (lead._pri_own_id > 0) ? lead._pri_own_id : null,
        rowData: lead,
        stateOwnerId: lead._state_owner_id
      }
      this.common.params = {
        editData, title: "Transaction Comment", button: "Save", subTitle: lead.identity, fromPage: 'process',
        userList: this.adminList,
        groupList: null,
        departmentList: null
      };
      const activeModal = this.modalService.open(ChatboxComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        this.goToBoard({ _id: this.processId, name: this.processName });
      });
    } else {
      this.common.showError("Invalid Lead");
    }
  }

  getFilteredCard(searchedKey) {
    if (!searchedKey.length) {
      this.cards = this.cardsForFilter;
    } else {
      let cardsForFilter = JSON.parse(JSON.stringify(this.cardsForFilter));
      cardsForFilter.forEach(element => {
        if (element.data) {
          element.data = element.data.filter(data => {
            return (data.title.toLowerCase()).match(searchedKey) || (data.type.toLowerCase()).match(searchedKey)
          })
        }
      });
      this.cards = cardsForFilter;
    }
    this.cardsForFilterByUser = JSON.parse(JSON.stringify(this.cards));
    this.placeCardLength(this.cards);
    this.getAllUserGroup(this.cards);
    this.filterUserGroup = [];
  }

  issueSort(type) {
    if (type === 0) {
      let cardsForFilter = JSON.parse(JSON.stringify(this.cardsForFilter));
      cardsForFilter.forEach(element => {
        if (element.data) {
          element.data = element.data.filter(data => {
            return this.userService._details.id === data.userid
          })
        }
      });
      this.cards = cardsForFilter;
      this.placeCardLength(this.cards);
      this.issueCategory = false;
    } else if (type === 1) {
      this.cards = this.cardsForFilter;
      this.placeCardLength(this.cards);
      this.issueCategory = true;
    }
    this.getAllUserGroup(this.cards);
    this.filterUserGroup = [];
  }

  getCardsByUser(userId) {
    let allAssignedUser = [];
    this.cardsUserGroup.forEach(ele => {
      allAssignedUser.push(ele.id);
    });

    if (this.filterUserGroup.includes(userId)) {
      this.filterUserGroup.splice(this.filterUserGroup.indexOf(userId), 1);
    } else {
      this.filterUserGroup.push(userId);
    }

    let cardsForFilter = this.cardsForFilterByUser.length ? JSON.parse(JSON.stringify(this.cardsForFilterByUser)) : JSON.parse(JSON.stringify(this.cardsForFilter));
    cardsForFilter.forEach(element => {
      if (element.data) {
        element.data = element.data.filter(data => {
          if (this.filterUserGroup.length > 0) {
            return this.filterUserGroup.includes(data.userid);
          } else {
            return this.cardsForFilter;
          }
        })
      }
    });
    this.cards = cardsForFilter;
    this.placeCardLength(this.cards);

    allAssignedUser.map(ele => {
      if (this.filterUserGroup.includes(ele)) {
        document.getElementById(`${ele}`).classList.add('userCardBoderOnCLick');
      } else {
        document.getElementById(`${ele}`).classList.remove('userCardBoderOnCLick');
      }
    });
  }

  resetUserFilter() {
    this.filterUserGroup = [];
    this.issueSort(1);
  }

  saveActivityLog(ticket, isHold = 0,progressPer=0, startTime = this.common.getDate(), endTime = null,) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 616 ~ KanbanBoardComponent ~ saveActivityLog ~ ticket", ticket)
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 767 ~ ProjectUserKanbanComponent ~ saveActivityLog ~ ticket", this.taskStatusBarData, ticket)
    this.resetInterval();
    let params = {
      requestId: ticket._last_logid > 0 ? ticket._last_logid : null,
      refid: ticket._is_action === 1 ? ticket._transaction_actionid : ticket._transaction_id,
      reftype: ticket._is_action === 1 ? 2 : 1,
      outcome: null,
      spendHour: null,
      startTime: (startTime) ? this.common.dateFormatter(startTime) : this.common.dateFormatter(this.common.getDate()),
      endTime: (endTime) ? this.common.dateFormatter(endTime) : null,
      isHold: isHold,
      progressPer:progressPer
    };
    console.log("params:", params);
    this.assignTaskToProgress(ticket);
     return false;
    this.common.loading++;
    this.api.post("Admin/saveActivityLogByRefId", params).subscribe(
      (res) => {
        this.common.loading--;
        if (res["code"] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0]['y_msg']);
            document.getElementById('taskStatus').style.display = 'none'; 
            this.resetProgressForm();
            if (!endTime) {
              this.assignTaskToProgress(ticket);
            } else {
              this.taskStatusBarData[0].data = [];
            }
          } else {
            this.common.showError(res['data'][0]['y_msg']);
          }
        } else {
          this.common.showError(res["msg"]);
        }
        this.goToBoard({ _id: this.processId, name: this.processName });
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
        this.goToBoard({ _id: this.processId, name: this.processName });
      }
    );
  }

  setTimer;
  resetInterval() {
    this.inprogressTimer = 0;
    (this.setTimer) ? clearInterval(this.setTimer) : null;
  }
  assignTaskToProgress(ticket) {
    this.resetInterval();
    this.taskStatusBarData[0].data[0] = ticket;
    let expdate = ticket['due_date'];
    let starttime = ticket['log_start_time'];
    this.inprogressTimer = (starttime) ? Math.floor((new Date().getTime() - new Date(starttime).getTime()) / 1000) : 0;
    let thisVar = this;
    if (ticket['log_start_time']) {
      this.setTimer = setInterval(function () {
        thisVar.inprogressTimer++;
      }, 1000);
    }
  }

  getUserPermission(ticket, isHold = 0, startTime = this.common.getDate(), endTime = null){
    this.activityHold = {
      ticket:ticket,
      isHold:isHold,
      startTime:startTime,
      endTime:endTime
    }
    document.getElementById('taskStatus').style.display = 'block';
  }

  onProgressSave(){
    console.log(this.activityHold,this.activityProgressStatus);
    this.saveActivityLog(this.activityHold.ticket, this.activityHold.isHold, this.activityProgressStatus, this.activityHold.startTime, this.activityHold.endTime,)
  }

  closeotherTaskStatus(){
    document.getElementById('taskStatus').style.display = 'none';
    this.resetProgressForm();
  }

  resetProgressForm(){
    this.activityProgressStatus = 5;
    this.activityHold = {ticket:null,isHold:null,startTime:new Date(),endTime:new Date()};
  }
}
