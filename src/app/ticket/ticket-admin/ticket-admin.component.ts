import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-ticket-admin',
  templateUrl: './ticket-admin.component.html',
  styleUrls: ['./ticket-admin.component.scss']
})
export class TicketAdminComponent implements OnInit {
  activeTab = 'current';
  currentTicketList = [];
  currentTicketTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  processWiseTicketList = [];
  processWiseTicketTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  userWiseTicketList = [];
  userWiseTicketTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  missedCallList = [];
  missedCallTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  completedTicketList = [];
  completedTicketTable = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  searchTask = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate(),
    tpId: null,
    minutes: null
  };
  tpList = [];
  currentStatus = {id:5,status:'Completed'}
  statusList = [
    {id:5,status:'Completed'},
    {id:2,status:'Acknowledge'},
    {id:0,status:'Assigned'},
    {id:-1,status:'Rejected'},
    {id:99,status:'Pending'}
  ]

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getAdminTicket(999);
    this.getTicketProcessList();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() { }

  refresh() {
    this.resetSearchForm();
    this.activeTab = "current";
    this.getAdminTicket(999);
    this.getTicketProcessList();
  }

  resetSearchForm(){
    this.searchTask = {
      startDate: <any>this.common.getDate(-2),
      endDate: <any>this.common.getDate(),
      tpId: null,
      minutes: null
    };
  }

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let tpList = res['data'] || [];
      this.tpList = tpList.filter(ele => {
        return (ele._is_active)
      })
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getAdminTicket(type) {
    let startDate, endDate, tpId, minutes = null,status = null;
    if(type===0 || type===1 || type==2 || type==3) {
      startDate = (this.searchTask.startDate) ? this.common.dateFormatter(this.searchTask.startDate) : null;
      endDate = (this.searchTask.endDate) ? this.common.dateFormatter(this.searchTask.endDate) : null;
    }
    if(type==2 || type==3) {
      tpId = (this.searchTask.tpId) ? this.searchTask.tpId : null;
      minutes = (this.searchTask.minutes) ? this.searchTask.minutes : null;
    }
    if(this.activeTab=='completedTicket' && type == 3){
      status = this.currentStatus.id;
    }
    let params = "?type="+type+"&startDate="+startDate+"&endDate="+endDate+"&tpId="+tpId+"&minutes="+minutes+"&status="+status;
    // return console.log(params);
    this.common.loading++;
    this.api.get("Ticket/getTicketSummaryByType"+params).subscribe(res => {
      this.common.loading--;
      this.resetSmartTableData();
      if(res['code']<=0) { this.common.showError(res['msg']); return false;};
      if(type==999){
        this.currentTicketList = res['data'] || [];
        this.setTableCurrent(type);
      }else if(type===0){
        this.processWiseTicketList = res['data'] || [];
        this.setTableProcessWise(type);
      }else if(type===1){
        this.userWiseTicketList = res['data'] || [];
        this.setTableUserWise(type);
      }else if(type===2){
        this.missedCallList = res['data'] || [];
        this.setTableMissedCall(type);
      }else if(type===3){
        this.completedTicketList = res['data'] || [];
        this.setTableCompletedTicket(type);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  resetSmartTableData() {
    this.currentTicketTable.data = {
      headings: {},
      columns: []
    };
    this.processWiseTicketTable.data = {
      headings: {},
      columns: []
    };
    this.userWiseTicketTable.data = {
      headings: {},
      columns: []
    };
    this.missedCallTable.data = {
      headings: {},
      columns: []
    };
    this.completedTicketTable.data = {
      headings: {},
      columns: []
    };
  }

  setTableCurrent(type) {
    this.currentTicketTable.data = {
      headings: this.generateHeadingsCurrentTicket(),
      columns: this.getTableColumnsCurrentTicket(type)
    };
    return true;
  }
  generateHeadingsCurrentTicket() {
    let headings = {};
    for (var key in this.currentTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if (key == 'expdate' || key == 'addtime') {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumnsCurrentTicket(type) {
    let columns = [];
    this.currentTicketList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsCurrentTicket()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, type)
          };
        } else if(key.toLowerCase()=='ltn') {
          column[key] = { value: ticket[key], class: 'blue', action: (ticket[key]>0) ? this.callDetails.bind(this, ticket,0) : null };
        } else if(key.toLowerCase()=='uncalled') {
          column[key] = { value: ticket[key], class: 'blue', action: (ticket[key]>0) ?  this.callDetails.bind(this, ticket,1) : null };
        } else if(key.toLowerCase()=='tot. call dur. (hh:mm)') {
          column[key] = { value: ticket[key], class: 'blue', action: this.callDetails.bind(this, ticket,2) };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    return columns;
  }

  // start: processwise
  setTableProcessWise(type) {
    this.processWiseTicketTable.data = {
      headings: this.generateHeadingsProcessWiseTicket(),
      columns: this.getTableColumnsProcessWiseTicket(type)
    };
    return true;
  }
  generateHeadingsProcessWiseTicket() {
    let headings = {};
    for (var key in this.processWiseTicketList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if (key == 'expdate' || key == 'addtime') {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumnsProcessWiseTicket(type) {
    let columns = [];
    this.processWiseTicketList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsProcessWiseTicket()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, type)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: processwise
// start: userwise
setTableUserWise(type) {
  this.userWiseTicketTable.data = {
    headings: this.generateHeadingsUserWiseTicket(),
    columns: this.getTableColumnsUserWiseTicket(type)
  };
  return true;
}
generateHeadingsUserWiseTicket() {
  let headings = {};
  for (var key in this.userWiseTicketList[0]) {
    if (key.charAt(0) != "_") {
      headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      if (key == 'expdate' || key == 'addtime') {
        headings[key]["type"] = "date";
      }
    }
  }
  return headings;
}

getTableColumnsUserWiseTicket(type) {
  let columns = [];
  this.userWiseTicketList.map(ticket => {
    let column = {};
    for (let key in this.generateHeadingsUserWiseTicket()) {
      if (key.toLowerCase() == 'action') {
        column[key] = {
          value: "",
          isHTML: true,
          action: null,
          // icons: this.actionIcons(ticket, type)
        };
      } else if(key.toLowerCase()=='tot. call cnt') {
        column[key] = { value: ticket[key], class: 'blue', action: this.callDetails.bind(this, ticket,2,true) };
      } else {
        column[key] = { value: ticket[key], class: 'black', action: '' };
      }

      column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
    }
    columns.push(column);
  });
  return columns;
}
// end: userwise
// start: missedCall
setTableMissedCall(type) {
  this.missedCallTable.data = {
    headings: this.generateHeadingsMissedCall(),
    columns: this.getTableColumnsMissedCall(type)
  };
  return true;
}
generateHeadingsMissedCall() {
  let headings = {};
  for (var key in this.missedCallList[0]) {
    if (key.charAt(0) != "_") {
      headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      if (key == 'expdate' || key == 'addtime') {
        headings[key]["type"] = "date";
      }
    }
  }
  return headings;
}

getTableColumnsMissedCall(type) {
  let columns = [];
  this.missedCallList.map(ticket => {
    let column = {};
    for (let key in this.generateHeadingsMissedCall()) {
      if (key.toLowerCase() == 'action') {
        column[key] = {
          value: "",
          isHTML: true,
          action: null,
          // icons: this.actionIcons(ticket, type)
        };
      } else {
        column[key] = { value: ticket[key], class: 'black', action: '' };
      }
    }
    columns.push(column);
  });
  return columns;
}
// end: missedCall
// start: completedTicket
setTableCompletedTicket(type) {
  this.completedTicketTable.data = {
    headings: this.generateHeadingsCompletedTicket(),
    columns: this.getTableColumnsCompletedTicket(type)
  };
  return true;
}
generateHeadingsCompletedTicket() {
  let headings = {};
  for (var key in this.completedTicketList[0]) {
    if (key.charAt(0) != "_") {
      headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      if (key == 'expdate' || key == 'addtime') {
        headings[key]["type"] = "date";
      }
    }
  }
  return headings;
}

getTableColumnsCompletedTicket(type) {
  let columns = [];
  this.completedTicketList.map(ticket => {
    let column = {};
    for (let key in this.generateHeadingsCompletedTicket()) {
      if (key.toLowerCase() == 'action') {
        column[key] = {
          value: "",
          isHTML: true,
          action: null,
          icons: this.actionIcons(ticket, type)
        };
      } else {
        column[key] = { value: ticket[key], class: 'black', action: '' };
      }
    }
    columns.push(column);
  });
  return columns;
}
// end: completedTicket

actionIcons(ticket, type) {
  let icons = [];
  if (type == 3) {
    icons.push({ class: "fa fa-retweet", action: this.changeTicketStatusWithConfirm.bind(this, ticket, type, 0), txt: "", title: "Re-Active", });
  }
  return icons;
}

changeTicketStatusWithConfirm(ticket, type, status) {
  console.log(ticket, 'status');
  if (ticket._ticket_id) {
    let preTitle = "Complete";
    if (status === -1) {
      preTitle = "Reject";
    } else if (status == 2) {
      preTitle = "Acknowledge";
    } else if (ticket._status == 2) {
      preTitle = "Completed";
    } else if (status == 0) {
      preTitle = "Re-Active";
    }
    this.common.params = {
      title: preTitle + " Ticket ",
      description:
        `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Ticket" + `<b>`,
      isRemark: status == -1 ? true : false,
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: "nb-layout", backdrop: "static", keyboard: false, windowClass: "accountModalClass", });
    activeModal.result.then((data) => {
      console.log("Confirm response:", data);
      if (data.response) {
        this.updateTicketStatus(ticket, type, status, data.remark);
      }
    });
  } else {
    this.common.showError("Ticket ID Not Available");
  }
}

updateTicketStatus(ticket, type, status, remark = null) {
  if (ticket._ticket_allocation_id) {
    let params = {
      ticketId: ticket._ticket_allocation_id,
      statusId: status,
      statusOld: ticket._status,
      remark: remark,
    }
    this.common.loading++;
    this.api.post('Ticket/updateTicketStatus', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.common.showToast(res['msg']);
        this.getAdminTicket(type);
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

callDetails(ticket,type,isDate=false) {
  let params = {
    userId: ticket['_aduserid'],
    type: type
  }
  if(isDate){
    params['startDate'] = (this.searchTask.startDate) ? this.common.dateFormatter(this.searchTask.startDate) : null,
    params['endDate'] = (this.searchTask.endDate) ? this.common.dateFormatter(this.searchTask.endDate) : null
  }
  let dataparams = {
    view: {
      api: 'Ticket/getTicketSummaryById',
      param: params
    },
    title: "Call Log Details "+'(' + ticket['employee_name'] + ')'
  }
  // this.common.handleModalSize('class', 'modal-lg', '1100');
  this.common.params = { data: dataparams };
  const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
}

  exportCSV() {
    let data = null;
    let headings = null;
    let title = null;
    if(this.activeTab=='processWise'){
      data = this.processWiseTicketList;
      headings = this.processWiseTicketTable.data.headings;
      title = 'Process-Wise-Summary';
    }else if(this.activeTab=='userWise'){
      data = this.userWiseTicketList;
      headings = this.userWiseTicketTable.data.headings;
      title = 'User-Wise-Summary';
    }
    else if(this.activeTab=='completedTicket'){
      data = this.completedTicketList;
      headings = this.completedTicketTable.data.headings;
      title = 'Completed Ticket';
    }
    else if(this.activeTab=='current'){
      data = this.currentTicketList;
      headings = this.currentTicketTable.data.headings;
      title = "Today's Ticket";
    }
    else if(this.activeTab=='missedCall'){
      data = this.missedCallList;
      headings = this.missedCallTable.data.headings;
      title = "Process Call Logs";
    }
    if (data.length == 0) {
      this.common.showError('No Data Found')
    } else {
      this.common.getCSVFromDataArray(data, headings, title);
    }
  }
}
