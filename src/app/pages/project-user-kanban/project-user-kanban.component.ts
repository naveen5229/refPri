
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { ApiService } from '../../Service/Api/api.service';
import { ChartService } from '../../Service/Chart/chart.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';
import * as _ from 'lodash';
import { TaskNewComponent } from '../../modals/task-new/task-new.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
@Component({
  selector: 'ngx-project-user-kanban',
  templateUrl: './project-user-kanban.component.html',
  styleUrls: ['./project-user-kanban.component.scss']
})
export class ProjectUserKanbanComponent implements OnInit {
  cardlength = null;
  loggedInUser = null;
  dashboardState = false;
  projectList = [];
  childProject = [];
  projectListTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true,
    }
  }
  cards = [];
  cardsForFilter = [];
  adminList = [];
  project = {
    _id: null,
    project_desc: null,
    _parent_id: null,
  }
  subProject = {
    _id: null,
    project_desc: null,
    _parent_id: null,
  }
  issueCategory = true;
  cardsUserGroup = [];
  cardsForFilterByUser = [];
  filterUserGroup = [];
  groupList = [];
  departmentList = [];
  // typeList = [
  //   { id: 0, name: 'Project' },
  //   { id: 1, name: 'User' }
  // ];
  // projectType = { id: 0, name: 'Project' };
  inProgressData = null;
  taskStatusBarData = [
    {
      id: 'workLog',
      data: []
    }
  ];
  normalTaskByMeList = [];
  ccTaskList = [];
  completeOtherTask = [];
  otherTaskActiveTab: number = -1;
  activeButton = 'to';
  inprogressTimer = null;
  taskStatusButton = 'Hold';
  boardType: number = 0;
  callType = '';

  constructor(
    public common: CommonService,
    public api: ApiService,
    public chart: ChartService,
    public modalService: NgbModal,
    public userService: UserService) {
    this.getProjectList();
    this.getAllAdmin();
    this.getUserGroupList();
    this.getDepartmentList();
    this.common.refresh = this.refresh.bind(this);
    this.loggedInUser = this.userService._details.id;
  }

  ngOnInit() {
  }

  refresh() {
    console.log(this.project, this.subProject);
    this.activeButton = 'to';
    this.taskStatusBarData[0].data = [];
    console.log(this.project, this.subProject)
    if (this.dashboardState) {
      this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : 0, this.callType);
    } else {
      this.getAllAdmin();
    }
    this.getProjectList();
    this.getUserGroupList();
    this.getDepartmentList();
  }

  getDashboardByType(type) {
    this.boardType = type;
    this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, type, this.callType);
  }

  showTaskPopup() {
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
    });
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups')
      .subscribe(
        (res) => {
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
        });
  }

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        if (res["code"] > 0) {
          this.departmentList = res["data"] || [];
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
      }
    );
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
    });
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
      }
      columns.push(column);
    });
    return columns;
  }

  actionIcons(lead) {
    let Icons = [{
      class: "btn btn-primary cursor-pointer",
      action: this.goToBoard.bind(this, lead, 1, 'parent'),
      txt: "View Board",
      title: "View Board",
    }];
    return Icons
  }

  goToBoard(lead, type, callType) {
    this.callType = callType;
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 245 ~ ProjectUserKanbanComponent ~ goToBoard ~ lead", lead, this.callType)
    this.childProject = this.projectList.filter((data) => lead._id === data._parent_id);
    (this.callType === 'parent') ? this.subProject = { _id: null, project_desc: null, _parent_id: null } : null;
    this.taskStatusBarData[0].data = [];
    let params = `projectId=${lead._id}&type=${type}&filter=null`;
    this.common.loading++;
    this.api.get(`AdminTask/getTaskBoardView?` + params).subscribe((res) => {
      this.common.loading--;
      if (res['code'] === 1) {
        let boardData = res['data'] || [];
        boardData.forEach(element => {
          // element.connectedto = (element.title == 'Ack') ? ['Inprogress'] : JSON.parse(element.connectedto);
          element.connectedto = JSON.parse(element.connectedto);

          //assigning data to current task if end time is not available
          if (element.title == 'Inprogress') {
            if (element.data && element.data.length) {
              element.data.map(data => {
                (!data.log_end_time && data._last_logid) ? this.assignTaskToProgress(data) : null;
              })
            }
            // (element.data && element.data.length) ? this.assignTaskToProgress(element.data[0]) : null;
            // && (element.data[0]['log_start_time'])
          }

          console.log('inprogress:', this.taskStatusBarData[0].data);
        });
        this.cards = boardData;
        this.cardsForFilter = JSON.parse(JSON.stringify(boardData));
        this.placeCardLength(this.cards);
        this.getAllUserGroup(this.cards);
        this.cardlength = this.cards.length;
        this.dashboardState = true;
        (this.callType === 'parent') ? this.project = lead : this.subProject = lead;
        console.log('sub:', this.subProject, 'parent:', this.project)
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
          // element.normalTaskCount = element.data.filter(obj => (obj.type.toLowerCase()).includes('normal')).length;
          // element.scheduleTaskCount = element.data.filter(obj => (obj.type.toLowerCase()).includes('schedule')).length;
          element.cardCount = element.data.length;
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
            data['text_color'] = (this.common.getDate() > new Date(data.due_date)) ? "text-danger" : '';
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
    this.project._id = null;
    this.project.project_desc = null;
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

  onDragEntered(event, i) {
    if ((event.container.id).toLowerCase() === 'worklog') {
      console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 327 ~ ProjectUserKanbanComponent ~ onDragEntered ~ event", event, i)
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 232 ~ KanbanBoardComponent ~ drop ~ event", event)
    let containerIdTemp = (event.container.id).toLowerCase();
    let ticket = event.previousContainer.data[event.previousIndex];
    if (event.previousContainer === event.container) {
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      if (containerIdTemp === 'worklog' && !event.isPointerOverContainer) {
        this.markDoneActivityWithConfirm(ticket);
      }
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
        console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 391 ~ ProjectUserKanbanComponent ~ drop ~ containerIdTemp", containerIdTemp)
        if (this.taskStatusBarData[0].data[0]) {
          this.common.showError('A Task Already In Progress');
          this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
          return false;
        }
        // this.taskStatusBarData[0].data[0] = ticket;
        this.saveActivityLog(ticket, 0);
      }


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

          data.data.push(JSON.parse(JSON.stringify(ticket)));
          console.log('data', event.container.id, containerIdTemp)
          switch (containerIdTemp) {
            case 'complete': this.changeTicketStatusWithConfirm(ticket, null, 5);
              break;
            case 'hold': this.changeTicketStatusWithConfirm(ticket, null, 3);
              break;
            case 'reject': this.changeTicketStatusWithConfirm(ticket, null, -1);
              break;
            case 'ack': this.updateTicketStatus(ticket, null, 2);
              break;
            case 'assigned': this.reactiveTicket(ticket, null);
              break;
            case 'inprogress': this.updateTicketStatus(ticket, null, 1);// change with status update function
              break;
            default: '';
          }
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
          this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
        }
      });
    } else {
      this.common.showError("Ticket ID Not Available");
      this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
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
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Task." + `<b>`,
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
          this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
        }
      });
    } else {
      this.common.showError("Task ID Not Available");
      this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
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
            // && status != 1 for moving in inprogress
            if (status != 1 && !ticket.log_end_time && ticket._last_logid > 0) {
              this.saveActivityLog(ticket, 0, ticket['log_start_time'], this.common.getDate());
              console.log('status with 1 working and end time is null');
            } else {
              this.common.showToast(res["msg"]);
            }
          } else {
            this.common.showError(res["msg"]);
          }
          this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
        },
        (err) => {
          this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
          this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
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
          // if (this.completeOtherTask.length > 0) {
          //   document.getElementById('otherTaskModal').style.display = 'block';
          // }
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

  // closeotherTaskModal() {
  //   document.getElementById('otherTaskModal').style.display = 'none';
  //   this.otherTaskActiveTab = -1;
  // }

  insertFromOtherToProgress(data, index) {
    this.inProgressData = data;
    this.otherTaskActiveTab = index;
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
    // var countDownDate = new Date(expdate).getTime();
    // var x = setInterval(function () {
    //   thisVar.common.setTimerrr(expdate).then(res => {
    //     thisVar.inprogressTimer = (res) ? res : 'EXPIRED';
    //     (!res) ? clearInterval(x) : null;
    //   });
    // }, 1000);
    let starttime = ticket['log_start_time'];
    this.inprogressTimer = (starttime) ? Math.floor((new Date().getTime() - new Date(starttime).getTime()) / 1000) : 0;
    console.log("inprogressTimer:", this.inprogressTimer);
    let thisVar = this;
    if (ticket['log_start_time']) {
      this.setTimer = setInterval(function () {
        thisVar.inprogressTimer++;
      }, 1000);
    }

    // if (this.taskStatusBarData[0].data[0]) {
    //   this.common.showError('A Task Already In Progress');
    //   this.getProjectList();
    //   return false;
    // } else {
    //   this.taskStatusBarData[0].data[0] = ticket;
    // }
  }

  ticketMessage(ticket, type) {
    console.log("type:", type);
    let ticketEditData = {
      ticketData: {
        _chat_feature: null,
        _tktid: ticket._tktid,
        _refid: ticket._refid,
        _tktype: ticket._tktype,
        _lastreadid: ticket._lastreadid,
        _status: ticket._status,
        _isremind: (ticket._isremind) ? ticket._isremind : null,
        task_desc: ticket._task_desc,
        _expdate: ticket.due_date,
        expdate: ticket.due_date
      },
      ticketId: ticket._tktid,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      taskId: ticket._tktype == 101 || ticket._tktype == 102 ? ticket._refid : null,
      taskType: ticket._tktype,
      tabType: type,
      isChecked: ticket._is_star_mark
    };

    let subTitle = ticket.title + ":<br>" + ticket._task_desc;
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.adminList,
      groupList: this.groupList,
      departmentList: this.departmentList
    };
    const activeModal = this.modalService.open(TaskMessageComponent, {
      size: "xl",
      container: "nb-layout",
      backdrop: "static",
    });
    console.log('reszponse', activeModal, type);
    activeModal.result.then((data) => {
      this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
    });
  }

  markDoneActivityWithConfirm(ticket) {
    this.common.params = {
      title: "Complete Current Log",
      description:
        `<b>&nbsp;` + "Are You Sure To Done This Activity Log" + `<b>`,
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
        this.saveActivityLog(ticket, 0, ticket['log_start_time'], this.common.getDate());
        console.log('ticket', ticket);
      } else {
        this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
      }
    });
  }

  saveActivityLog(ticket, isHold = 0, startTime = this.common.getDate(), endTime = null) {
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 767 ~ ProjectUserKanbanComponent ~ saveActivityLog ~ ticket", this.taskStatusBarData, ticket)
    this.resetInterval();
    let params = {
      requestId: ticket._last_logid > 0 ? ticket._last_logid : null,
      refid: ticket._tktid,
      reftype: 0,
      outcome: null,
      spendHour: null,
      startTime: (startTime) ? this.common.dateFormatter(startTime) : this.common.dateFormatter(this.common.getDate()),
      endTime: (endTime) ? this.common.dateFormatter(endTime) : null,
      isHold: isHold
    };
    console.log("params:", params);
    // this.assignTaskToProgress(ticket);
    //  return false;
    this.common.loading++;
    this.api.post("Admin/saveActivityLogByRefId", params).subscribe(
      (res) => {
        this.common.loading--;
        if (res["code"] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0]['y_msg']);
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
        this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
        this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
      }
    );
  }

  openUpdateTaskProject(event, ticket) {
    event.stopPropagation();
    console.log("ticket:", ticket);
    this.common.params = {
      userList: this.adminList,
      groupList: this.groupList,
      parentTaskId: ticket._refid,
      parentTaskDesc: ticket._task_desc,
      editType: 3,
      editData: null,
      ticketId: ticket._tktid,
      ticketType: ticket._tktype,
      project: { id: (ticket._project_type.toLowerCase() != 'standalone') ? ticket._project_id : null, name: (ticket._project_type.toLowerCase() != 'standalone') ? ticket._project_type : null }
    };
    const activeModal = this.modalService.open(TaskNewComponent, { size: "md", container: "nb-layout", backdrop: "static", });
    activeModal.result.then((data) => {
      if (data.response) {
        this.goToBoard((this.callType === 'parent') ? this.project : this.subProject, (this.project._id) ? 1 : this.boardType, this.callType);
      }
    });
  }

}