import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  activeTab = 'leadsForMe';
  adminList = [];
  tpList = [];
  allocatedTkt = [];
  unallocatedTkt = [];
  tableAllocatedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  tableUnallocatedTkt = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getTicketByType(101);
    this.getAllAdmin();
    this.getTicketProcessList();
  }

  ngOnInit() { }

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

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      if (!res['data']) return;
      this.tpList = res['data'];

    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getTicketByType(type, startDate = null, endDate = null) {
    this.common.loading++;
    // if ((type == 102) && this.searchData.startDate && this.searchData.endDate) {
    //   startDate = this.common.dateFormatter(this.searchData.startDate);
    //   endDate = this.common.dateFormatter(this.searchData.endDate);
    // }
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startDate + "&endDate=" + endDate;
    this.api.get("Ticket/getTicketByType" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (type == 100) {
          this.unallocatedTkt = res['data'] || [];
          this.setTableUnallocatedTkt(type);
        } else if (type == 101) {
          this.allocatedTkt = res['data'] || [];
          this.setTableAllocatedTkt(type);
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

  resetSmartTableData() {
    this.tableAllocatedTkt.data = {
      headings: {},
      columns: []
    };
    this.tableUnallocatedTkt.data = {
      headings: {},
      columns: []
    };
  }

  // start: leads for me
  setTableAllocatedTkt(type) {
    this.tableAllocatedTkt.data = {
      headings: this.generateHeadingsAllocatedTkt(),
      columns: this.getTableColumnsAllocatedTkt(type)
    };
    return true;
  }

  generateHeadingsAllocatedTkt() {
    let headings = {};
    for (var key in this.allocatedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsAllocatedTkt(type) {
    let columns = [];
    this.allocatedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsAllocatedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: allocatedTkt

  // start: UnallocatedTkt
  setTableUnallocatedTkt(type) {
    this.tableUnallocatedTkt.data = {
      headings: this.generateHeadingsUnallocatedTkt(),
      columns: this.getTableColumnsUnallocatedTkt(type)
    };
    return true;
  }

  generateHeadingsUnallocatedTkt() {
    let headings = {};
    for (var key in this.unallocatedTkt[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsUnallocatedTkt(type) {
    let columns = [];
    this.unallocatedTkt.map(lead => {
      let column = {};
      for (let key in this.generateHeadingsAllocatedTkt()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(lead, type)
          };
        } else {
          column[key] = { value: lead[key], class: 'black', action: '' };
        }

        // column['style'] = { 'background': this.common.taskStatusBg(lead._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: unallocatedTkt

  actionIcons(tkt, type) {
    console.log("actionIcons:", tkt);
  }

}
