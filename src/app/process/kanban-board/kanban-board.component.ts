import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragRelease, CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { ApiService } from '../../Service/Api/api.service';
import { ChartService } from '../../Service/Chart/chart.service';
import { CommonService } from '../../Service/common/common.service';
import { AddTransactionActionComponent } from '../../modals/process-modals/add-transaction-action/add-transaction-action.component';
import { FormDataComponent } from '../../modals/process-modals/form-data/form-data.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
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
  adminList = [];
  processId = null;
  processName = null;

  constructor(
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
    this.getProcessListByUser();
    this.getAllAdmin();
  }

  getProcessListByUser() {
    this.common.loading++;
    this.api.get(`Processes/getProcessListByUser`).subscribe((res) => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.processList = res['data'] || [];
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
      class: "fa fa-eye",
      action: this.goToBoard.bind(this, lead),
      txt: "",
      title: "View Board",
    }];

    return Icons
  }

  goToBoard(lead) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 177 ~ KanbanBoardComponent ~ goToBoard ~ lead", lead);
    this.processId = lead._id;
    this.processName = lead.name;

    let params = `processId=${lead._id}&filter=null`
    this.common.loading++;
    this.api.get(`Processes/getProcessBoardView?` + params).subscribe((res) => {
      this.common.loading--;
      this.cards = res['data'] || [];
      this.dashboardState = true;
    }, (err) => {
      this.common.loading--;
      this.common.showError(err);
    });
  }

  onDragStarted(event: CdkDragStart<string[]>) {
    // let scrollWidth = document.getElementById('cardField').offsetWidth;
    // console.log("🚀 ~ file: kanban-board.component.ts ~ line 157 ~ KanbanBoardComponent ~ onDragStarted ~ scrollWidth", scrollWidth)
    console.log("onDragStarted:", event);
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
    console.log("onDragEnded:", event);
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
  

  drop(event: CdkDragDrop<string[]>, index) {
    console.log("🚀 ~ file: kanban-board.component.ts ~ line 86 ~ KanbanBoardComponent ~ drop ~ event", event, index);

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
      let moveFrom = this.cards.findIndex(data => data.id === event.previousContainer.id);
      let moveTo = this.cards.findIndex(data => data.id === event.container.id);
      let isComplete = moveTo > moveFrom ? true : false;
      console.log('index from To', moveFrom, moveTo, isComplete);
      if (!event.isPointerOverContainer) {
        return;
      }
      this.cards.forEach((data, i) => {
        if (data.id === event.container.id) {
          console.log('index', data, i);
          data.data.push(JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex])));
          if (event.previousContainer.data[event.previousIndex]['_is_action'] === 1) {
            this.openTransAction(event.previousContainer.data[event.previousIndex], null, null, isComplete);
          } else {
            // this.openTransFormData(event.previousContainer.data[event.previousIndex],null,null);
          }
        }
        setTimeout(() => {
          if (data.id === event.previousContainer.id) {
            data.data.splice(event.previousIndex, 1);
          }
        }, 200);
      })
    }

    console.log("🚀 ~ file: kanban-board.component.ts ~ line 86 ~ KanbanBoardComponent ~ drop ~ event", this.cards)
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
    console.log("openTransAction", lead);
    let formTypeTemp = 0;
    // if (!formType) {
    //   formTypeTemp = ([2, 6, 7].includes(type)) ? 1 : 0;
    // } else {
    //   formTypeTemp = formType;
    // }
    let actionData = {
      processId: this.processId,
      processName: this.processName,
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
          this.getProcessListByUser();
        }
      } else {
        this.getProcessListByUser();
      }
    });
  }

  openTransFormData(lead, type, formType = null) {
    console.log("openTransAction");
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
        this.openTransAction(lead, type, 2);
      } else {
        this.getProcessListByUser();
      }
    });
  }


}
