import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.scss']
})
export class CustomDashboardComponent implements OnInit {
  loginUserId = this.userService._details.id;
  tpId = null;
  activeTab = null;
  adminList = [];
  tpList = [];
  allOpenTicket = [];
  groupList = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  searchData = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate()
  }

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
    this.common.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.getAllAdmin();
    this.getTicketProcessList();
    this.getUserGroupList();
    this.resetSmartTableData();
    this.activeTab = null;
  }
  ngOnInit() {}

  
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

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups').subscribe(res => {
      if (res["code"] > 0) {
        let groupList = res['data'] || [];
        this.groupList = groupList.map((x) => {
          return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
        });
      } else {
        this.common.showError(res["msg"]);
      }
    },err => {
      this.common.showError();
      console.log("Error: ", err);
    });
  }

  getTicketProcessList() {
    this.common.loading++;
    this.api.get('Ticket/getTicketProcessList').subscribe(res => {
      this.common.loading--;
      let tpList = res['data'] || [];
      this.tpList = tpList.filter(ele => {
        return (ele._is_active && ele._ticket_input > 0)
      })
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
  }

  getTicketByType(type, startDate = null, endDate = null) {
    if(!this.tpId){
      this.common.showError("Ticket Process is missing");
      return false;
    }
    this.activeTab = "allOpen";
    if (this.searchData.startDate && this.searchData.endDate) {
      startDate = this.common.dateFormatter(this.searchData.startDate);
      endDate = this.common.dateFormatter(this.searchData.endDate);
    }
    this.resetSmartTableData();
    let params = "?tpId=" + this.tpId + "&startDate=" + startDate + "&endDate=" + endDate;
    this.common.loading++;
    this.api.get("Ticket/getDynamicDashboardData" + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
          this.allOpenTicket = res['data'] || [];
          this.setTableAllOpenTicket(type);
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
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  // start: allocatedTkt
  setTableAllOpenTicket(type) {
    this.table.data = {
      headings: this.generateHeadingsAllOpenTicket(),
      columns: this.getTableColumnsAllOpenTicket(type)
    };
    return true;
  }

  generateHeadingsAllOpenTicket() {
    let headings = {};
    for (var key in this.allOpenTicket[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime" || key === "action_completed") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumnsAllOpenTicket(type) {
    let columns = [];
    this.allOpenTicket.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsAllOpenTicket()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, type)
          };
        } else if (key == "remaining_time") {
          column[key] = { value: this.common.findRemainingTime(ticket[key]), class: "black", action: "", };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }

        column['style'] = { 'background': this.common.taskStatusBg(ticket._status) };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: allocatedTkt


}
