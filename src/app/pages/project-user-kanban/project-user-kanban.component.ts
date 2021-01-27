
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
  departmentList = [];
  // typeList = [
  //   { id: 0, name: 'Project' },
  //   { id: 1, name: 'User' }
  // ];
  // projectType = { id: 0, name: 'Project' };
  inProgressData = null;
  taskStatusBarData = [
    {
      id: 'inProgress',
      data: []
    }
  ];
  normalTaskByMeList = [];
  ccTaskList = [];
  completeOtherTask = [];
  otherTaskActiveTab: number = -1;
  activeButton = 'to';

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
    this.taskStatusBarData[0].data = [];
    if (this.dashboardState) {
      if (this.project.projectId) {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 1);
      } else {
        this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, 0);
      }
    } else {
      this.getAllAdmin();
    }
    this.getProjectList();
    this.getUserGroupList();
    this.getDepartmentList();
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

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          this.departmentList = res["data"] || [];
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
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
      console.log('Error: ', err);
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
      action: this.goToBoard.bind(this, lead, 1),
      txt: "View Board",
      title: "View Board",
    }];
    return Icons
  }

  goToBoard(lead, type) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 153 ~ KanbanBoardComponent ~ goToBoard ~ lead", lead, type,this.project);
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
          let containerIdTemp = (event.container.id).toLocaleLowerCase();
          if(containerIdTemp=='inprogress' && this.taskStatusBarData[0].data[0]){
              this.common.showError('A Task Already In Progress');
              this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, (this.project.projectId) ? 1 :0 );
              return false;
          }
          data.data.push(JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex])));

          console.log('data', event.container.id)
          let ticket = event.previousContainer.data[event.previousIndex];
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
            case 'inprogress': this.saveActivityLog(ticket, null);// change with status update function
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
          } else {
            this.common.showError(res["msg"]);
          }
          this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, (this.project.projectId) ? 1 : 0);
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

  assignTaskToProgress(ticket) {
    console.log("🚀 ~ file: project-user-kanban.component.ts ~ line 898 ~ ProjectUserKanbanComponent ~ assignTaskToProgress ~ ticket", ticket)
    const expdate = ticket['due date'];
    var countDownDate = new Date(expdate).getTime();
    var x = setInterval(function () {
      var now = new Date().getTime();
      var distance = countDownDate - now; // Find the distance between now and the count down date
      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      // Output the result in an element with id="demo"
      document.getElementById("timer").innerHTML = days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";
      // If the count down is over, write some text 
      if (distance < 0) {
        clearInterval(x);
        document.getElementById("timer").innerHTML = "EXPIRED";
      }
    }, 1000);

    if (this.taskStatusBarData[0].data[0]) {
      this.common.showError('A Task Already In Progress');
      this.getProjectList();
      return false;
    } else {
      this.taskStatusBarData[0].data[0] = ticket;
    }
  }

  ticketMessage(ticket, type) {
    console.log("type:", type);
    let ticketEditData = {
      ticketData: null,
      ticketId: ticket._tktid,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      taskId: ticket._tktype == 101 || ticket._tktype == 102 ? ticket._refid : null,
      taskType: ticket._tktype,
      tabType: type,
      isChecked: ticket._is_star_mark
    };

    let subTitle = ticket.title + ":<br>" + ticket.desc;
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
      size: "lg",
      container: "nb-layout",
      backdrop: "static",
    });
    console.log('reszponse', activeModal, type);
    activeModal.result.then((data) => {
      this.getProjectList();
    });
  }

  saveActivityLog(ticket,isCompleted=0,startTime = this.common.getDate(),endTime=null){
      let params = {
        requestId: ticket._last_logid > 0 ?  ticket._last_logid : null,
        refid: ticket._tktid,
        reftype: 0,
        outcome: null,
        spendHour: null,
        startTime: (startTime) ? this.common.dateFormatter(startTime) : null,
        endTime: (endTime) ? this.common.dateFormatter(endTime) : null,
        isCompleted: isCompleted
      };
      console.log("params:", params);this.assignTaskToProgress(ticket);
       return false;
      this.common.loading++;
      this.api.post("Admin/saveActivityLogByRefId", params).subscribe(
        (res) => {
          this.common.loading--;
          if (res["code"] > 0) {
            if(res['data'][0]['y_id']>0){
              this.common.showToast(res['data'][0]['y_msg']);
              if(!endTime){
                this.assignTaskToProgress(ticket);
              }else{
                this.taskStatusBarData[0].data = [];
              }
            }else{
              this.common.showError(res['data'][0]['y_msg']);
            }
          } else {
            this.common.showError(res["msg"]);
          }
          this.goToBoard({ _id: this.project.projectId, project_desc: this.project.projectName }, (this.project.projectId) ? 1 : 0);
        },
        (err) => {
          this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
  }

}