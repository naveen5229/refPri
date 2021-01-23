
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
import { TaskNewComponent } from '../../modals/task-new/task-new.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-project-user-kanban',
  templateUrl: './project-user-kanban.component.html',
  styleUrls: ['./project-user-kanban.component.scss']
})
export class ProjectUserKanbanComponent implements OnInit {
  loggedInUser = null;
  dashboardState = false;
  projectList = [];
  projectListTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true,
      arrow: true
    }
  }
  cards = [];
  cardsForFilter = [];
  adminList = [];
  project = {
    projectId: null,
    projectName: null
  }
  issueCategory = true;
  cardsUserGroup = [];
  cardsForFilterByUser = [];
  filterUserGroup = [];
  groupList = [];
  // typeList = [
  //   { id: 0, name: 'Project' },
  //   { id: 1, name: 'User' }
  // ];
  // projectType = { id: 0, name: 'Project' };
  inProgressData = null;
  taskStatusBarData = [
    {
      id: 'statusInProgress',
      to: 'statusComplete',
      data: []
    },
    {
      id: 'statusComplete',
      to: 'statusInProgress',
      data: []
    },
  ];
  normalTaskByMeList = [];
  ccTaskList = [];
  completeOtherTask = [];


  constructor(
    public common: CommonService,
    public api: ApiService,
    public chart: ChartService,
    public modalService: NgbModal,
    public userService: UserService) {
    this.getProjectList();
    this.getAllAdmin();
    this.getUserGroupList();
    this.common.refresh = this.refresh.bind(this);
    this.loggedInUser = this.userService._details.id;
  }

  ngOnInit() {
  }

  refresh() {
    if (this.dashboardState) {
      if (this.project.projectId) {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
      } else {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
      }
      this.getProjectList();
      this.getUserGroupList();
    } else {
      this.getProjectList();
      this.getAllAdmin();
      this.getUserGroupList();
    }
  }

  showTaskPopup() {
    this.projectListTable.settings.arrow = false;
    this.common.params = { userList: this.adminList, groupList: this.groupList, parentTaskId: null, editType: 2, project: this.project };
    const activeModal = this.modalService.open(TaskNewComponent, {
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        this.getProjectList();
      }
      this.projectListTable.settings.arrow = true;
    });
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups')
      .subscribe(
        (res) => {
          console.log(" Group data", res["data"]);
          if (res["code"] > 0) {
            let groupList = res['data'] || [];
            this.groupList = groupList.map((x) => {
              return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
            });
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.showError();
          console.log("Error: ", err);
        });
  }

  getProjectList() {
    this.common.loading++;
    this.api.get("AdminTask/getProjectListByUser").subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.projectList = res['data'] || [];
        this.setProjectList();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  // getProcessListByUser() {
  //   this.common.loading++;
  //   this.api.get(`Processes/getProcessListByUser`).subscribe((res) => {
  //     this.common.loading--;
  //     if (res['code'] == 1) {
  //       this.projectList = res['data'] || [];
  //       console.log("🚀 ~ file: kanban-board.component.ts ~ line 70 ~ KanbanBoardComponent ~ this.api.get ~ this.processList", this.projectList)
  //       this.setProcessList();
  //     } else {
  //       this.common.showError(res['msg']);
  //     }
  //   }, (err) => {
  //     this.common.loading--;
  //     this.common.showError(err);
  //   });
  // }

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

  setProjectList() {
    this.projectListTable.data = {
      headings: this.generateHeadingsProjectList(),
      columns: this.getTableColumnsProjectList()
    };
    return true;
  }

  generateHeadingsProjectList() {
    let headings = {};
    for (var key in this.projectList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsProjectList() {
    let columns = [];
    this.projectList.map(Project => {
      let column = {};
      for (let key in this.generateHeadingsProjectList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(Project),
            _data: Project
          };
        } else {
          column[key] = { value: Project[key], class: 'black', action: '' };
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
      action: this.goToBoard.bind(this, lead, 1),
      txt: "View Board",
      title: "View Board",
    }];

    return Icons
  }

  goToBoard(lead, type) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 153 ~ KanbanBoardComponent ~ goToBoard ~ lead", lead, type);

    console.log('project type fromgoToBoard', this.project)
    let params = `projectId=${lead._id}&type=${type}&filter=null`
    this.common.loading++;
    this.api.get(`AdminTask/getTaskBoardView?` + params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] === 1) {
        let boardData = res['data'] || [];
        boardData.forEach(element => {
          element.connectedto = JSON.parse(element.connectedto);
        });
        console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 228 ~ ProjectUserKanbanComponent ~ this.api.get ~ boardData", boardData)
        this.cards = boardData;
        this.cardsForFilter = JSON.parse(JSON.stringify(boardData));
        this.placeCardLength(this.cards);
        this.getAllUserGroup(this.cards);
        this.dashboardState = true;
        this.project.projectId = lead._id;
        this.project.projectName = lead.project_desc;
      }
    }, (err) => {
      this.common.loading--;
      this.common.showError(err);
    });
  }

  placeCardLength(boardData) {
    if (boardData) {
      boardData.forEach(element => {
        if (element.data) {
          element.normalTaskCount = element.data.filter(obj => (obj.type.toLowerCase()).includes('normal')).length;
          element.scheduleTaskCount = element.data.filter(obj => (obj.type.toLowerCase()).includes('schedule')).length;
        }
      });
    }
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 255 ~ ProjectUserKanbanComponent ~ placeCardLength ~ boardData", boardData)
  }

  getAllUserGroup(boardData) {
    this.cardsUserGroup = [];
    let userGroup = [];
    if (boardData) {
      boardData.forEach(element => {
        if (element.data) {
          element.data.forEach(data => {
            userGroup.push({ id: data.userid, name: data.user, user_label: data.user_label, color: '#3366ff' });
          })
        }
      });
    }
    let groupBy = _.groupBy(userGroup, data => { return data.id });
    Object.keys(groupBy).map(key => {
      this.cardsUserGroup.push(groupBy[key][0]);
    });
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 255 ~ ProjectUserKanbanComponent ~ placeCardLength ~ boardData", this.cardsUserGroup)
  }

  goToList() {
    this.dashboardState = false;
    this.project.projectId = null;
    this.project.projectName = null;
    this.getProjectList();
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
      let moveFrom = this.cards.findIndex(data => data.title === event.previousContainer.id);
      let moveTo = this.cards.findIndex(data => data.title === event.container.id);
      let isComplete = moveTo > moveFrom ? true : false;
      if (!event.isPointerOverContainer) {
        return;
      }
      this.cards.forEach((data, i) => {
        if (data.title === event.container.id) {
          console.log('index', data, i);
          if (data.data === null) {
            data.data = [];
          }
          data.data.push(JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex])));

          console.log('data', event.container.id)
          let ticket = event.previousContainer.data[event.previousIndex];
          switch ((event.container.id).toLocaleLowerCase()) {
            case 'complete': this.changeTicketStatusWithConfirm(ticket, null, 5);
              break;
            case 'hold': this.changeTicketStatusWithConfirm(ticket, null, 3);
              break;
            case 'reject': this.changeTicketStatusWithConfirm(ticket, null, -1);
              break;
            case 'ack': this.updateTicketStatus(ticket, null, 2);
              break;
            case 'assigned': this.reactiveTicket(ticket, null)
              break;
            default: '';
          }
          // if (event.previousContainer.data[event.previousIndex]['_is_action'] === 1) {
          //   let lead = event.previousContainer.data[event.previousIndex];
          //   lead['_state_id'] = this.cards[moveFrom]['_state_id'];
          //   lead['_state_name'] = this.cards[moveFrom]['title'];
          //   this.openTransAction(lead, null, null, isComplete);
          // } else {
          //   // this.openTransFormData(event.previousContainer.data[event.previousIndex],null,null);
          //   let transaction = {
          //     _transaction_id: event.previousContainer.data[event.previousIndex]['_transaction_id'],
          //     _state_id: this.cards[moveFrom]['_state_id'],
          //     _next_state_id: this.cards[moveTo]['_state_id'],
          //     state_name: this.cards[moveFrom]['title'],
          //     _next_state_name: this.cards[moveTo]['title'],
          //     _state_form: event.previousContainer.data[event.previousIndex]['_state_form']
          //   }
          //   this.saveTransNextState(transaction);
          // }
        }
        setTimeout(() => {
          if (data.title === event.previousContainer.id) {
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
    let formTypeTemp = 0;
    if (!formType) {
      formTypeTemp = 0;
    } else {
      formTypeTemp = formType;
    }
    let actionData = {
      processId: this.project.projectId,
      processName: this.project.projectName,
      transId: lead._transaction_id,
      identity: null,
      formType: formTypeTemp,
      requestId: (type == 1) ? lead._transaction_actionid : null,
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
      isMarkTxnComplete: (lead._state_change == 2 && type == 1) ? 1 : null
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
          this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
        }
      } else {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
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
      processId: this.project.projectId,
      processName: this.project.projectName,
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
        this.openTransAction(lead, type, 2);
      } else {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
      }
    });
  }


  saveTransNextState(transaction) {
    if (!transaction._next_state_id) {
      this.common.showError('Next state is missing');
      this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
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
      console.log("saveTransNextState - saveTransAction:", params, transaction);
      // return;
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            transaction._state_id = transaction._next_state_id;
            transaction.state_name = transaction._next_state_name;;
            this.common.showToast(res['data'][0].y_msg);
            if (transaction._state_form == 1) {
              this.openTransFormData(transaction, null, 1);
            }
            else {
              // this.openTransAction(lead, type, 2);
              this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
            }

            // this.transAction.state = this.transAction.nextState;
            // this.isFormHere = this.nextStateForm;
            // if (this.isMarkTxnComplete == 1 && stateType == 2) {
            //   setTimeout(() => {
            //     this.markTxnComplete(params.transId);
            //   }, 1000);
            // }
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
    }
  }

  transMessage(lead, type) {
    console.log('click occured');
    return;
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
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
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
            return (data.title.toLowerCase()).match((searchedKey.trim()).toLowerCase()) || (data.type.toLowerCase()).match((searchedKey.trim()).toLowerCase()) || (data._project_type.toLowerCase()).match((searchedKey.trim()).toLowerCase())
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

  reactiveTicket(ticket, type) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: 0,
      };
      this.common.params = {
        title: "Reactive Ticket",
        description:
          `<b>&nbsp;` + "Are You Sure To Reactive This Record" + `<b>`,
      };
      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        if (data.response) {
          this.updateTicketStatus(ticket, type, 0);
        } else {
          if (this.project.projectId) {
            this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
          } else {
            this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
          }
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
      if (this.project.projectId) {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
      } else {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
      }
    }
  }

  changeTicketStatusWithConfirm(ticket, type, status) {
    console.log(status, ticket, 'status')
    if (ticket._refid) {
      let preTitle = "Complete";
      if (status === -1) {
        preTitle = "Reject";
      } else if (status == 3) {
        preTitle = "Hold";
      } else if (ticket._status == 3) {
        preTitle = "Unhold";
      }
      this.common.params = {
        title: preTitle + " Task ",
        description:
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Task" + `<b>`,
        isRemark: status == 3 ? true : false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(ticket, type, status, data.remark);
        } else {
          console.log('project type', this.project)
          if (this.project.projectId) {
            this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
          } else {
            this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
          }
        }
      });
    } else {
      this.common.showError("Task ID Not Available");
      if (this.project.projectId) {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
      } else {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
      }
    }
  }

  updateTicketStatus(ticket, type, status, remark = null) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: status,
        statusOld: ticket._status,
        remark: remark,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
      };
      // console.log("params:", params); return false;
      this.common.loading++;
      this.api.post("AdminTask/updateTicketStatus", params).subscribe(
        (res) => {
          this.common.loading--;
          if (res["code"] > 0) {
            this.common.showToast(res["msg"]);
            if (this.project.projectId) {
              this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
            } else {
              this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
            }
            // if (
            //   type == -102 &&
            //   this.searchTask.startDate &&
            //   this.searchTask.endDate
            // ) {
            //   let startDate = this.common.dateFormatter(
            //     this.searchTask.startDate
            //   );
            //   let endDate = this.common.dateFormatter(this.searchTask.endDate);
            //   this.getTaskByType(type, startDate, endDate);
            // } else {
            //   this.getTaskByType(type);
            // }
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  getTaskByType() {
    let params = {};
    for (let i = 0; i < 2; i++) {
      if (i === 0) {
        params = {
          type: -101,
          startDate: null,
          endDate: null,
        };
      } else {
        params = {
          type: -5,
          startDate: null,
          endDate: null,
        };
      }


      this.common.loading++;
      this.api.post("AdminTask/getTaskByType", params)
        .subscribe((res) => {
          this.common.loading--;
          console.log("data", res["data"]);
          if (i === 0) {
            //task by me
            this.normalTaskByMeList = (res["data"] || [])
              .map(task => {
                task.assignedAs = 'by';
                return task;
              });;
          } else {
            //CC task
            this.ccTaskList = (res["data"] || [])
              .map(task => {
                task.assignedAs = 'cc';
                return task;
              });
          }

          this.completeOtherTask = this.ccTaskList.concat(this.normalTaskByMeList);
          if (this.completeOtherTask.length > 0) {
            document.getElementById('otherTaskModal').style.display = 'block';
          }
          console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 843 ~ ProjectUserKanbanComponent ~ getTaskByType ~ completeOtherTask", this.completeOtherTask)
        },
          (err) => {
            this.common.loading--;
            this.common.showError();
            console.log("Error: ", err);
          }
        );
    }
  }

  closeotherTaskModal() {
    document.getElementById('otherTaskModal').style.display = 'none';
  }

  insertFromOtherToProgress(data, index) {
    this.inProgressData = data;
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 878 ~ ProjectUserKanbanComponent ~ insertFromOtherToProgress ~ index", this.inProgressData, data, index);
    document.getElementById(index).style.background = 'yellow';
  }

  assignTaskToProgress() {
    if (this.taskStatusBarData[0].data[0]) {
      this.common.showError('A Task Already In Progress');
      return;
    }else{
      this.taskStatusBarData[0].data[0] = this.inProgressData;
      document.getElementById('otherTaskModal').style.display = 'none';
    }
  }
}