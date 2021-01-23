import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';

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

  searchTask = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate(),
  };

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getAdminTicket(999);
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() { }

  refresh() {
    this.searchTask = {
      startDate: <any>this.common.getDate(-2),
      endDate: <any>this.common.getDate(),
    };
    this.activeTab = "current";
    this.getAdminTicket(999);
  }

  getAdminTicket(type) {
    let startDate,endDate = null;
    if(type===0 || type===1) {
      startDate = (this.searchTask.startDate) ? this.common.dateFormatter(this.searchTask.startDate) : null;
      endDate = (this.searchTask.endDate) ? this.common.dateFormatter(this.searchTask.endDate) : null;
    }
    let params = "?type="+type+"&startDate="+startDate+"&endDate="+endDate;
    this.common.loading++;
    this.api.get("Ticket/getTicketSummaryByType"+params).subscribe(res => {
      this.common.loading--;
      this.resetSmartTableData();
      if(type==999){
        this.currentTicketList = res['data'] || [];
        this.setTableCurrent(type);
      }else if(type===0){
        this.processWiseTicketList = res['data'] || [];
        this.setTableProcessWise(type);
      }else if(type===1){
        this.userWiseTicketList = res['data'] || [];
        this.setTableUserWise(type);
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
    if (data.length == 0) {
      this.common.showError('No Data Found')
    } else {
      this.common.getCSVFromDataArray(data, headings, title);
    }
  }
}
