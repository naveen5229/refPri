import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../Service/user/user.service';

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

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getAdminTicket(1);
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() { }

  refresh() {
    this.activeTab = "current";
    this.getAdminTicket(1);
  }

  getAdminTicket(type) {
    this.common.loading++;
    this.api.get("Ticket/getTicketCurrentSummary").subscribe(res => {
      this.common.loading--;
      this.resetSmartTableData();
      this.currentTicketList = res['data'] || [];
      this.setTableCurrent(type);
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
        if (key == 'Action') {
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

}
