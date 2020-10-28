import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatboxComponent } from '../../modals/process-modals/chatbox/chatbox.component';

@Component({
  selector: 'ngx-process-admin',
  templateUrl: './process-admin.component.html',
  styleUrls: ['./process-admin.component.scss']
})
export class ProcessAdminComponent implements OnInit {
today = new Date();
activeTab = 'Actions';
Actions = [];
Transactions = [];
tableActions = {
  data: {
    headings: {},
    columns: []
  },
  settings: {
    hideHeader: true
  }
};

tableTransactions = {
  data: {
    headings: {},
    columns: []
  },
  settings: {
    hideHeader: true
  }
};

searchData = {
  startdate: <any>this.common.getDate(-1),
  enddate: <any>this.common.getDate(),
}
  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.getData(102);
   }

   ngOnInit() { }

   getData(type, startdate = null, enddate = null) {
    this.common.loading++;
    if (type == 102 && this.searchData.startdate && this.searchData.enddate) {
      startdate = this.common.dateFormatter(this.searchData.startdate);
      enddate = this.common.dateFormatter(this.searchData.enddate);
    }
    this.resetSmartTableData();
    let params = "?type=" + type + "&startDate=" + startdate + "&endDate=" + enddate;
    this.api.get("Processes/getProcessReportByType" + params).subscribe(res => {
      this.common.loading--;
      //  console.log("data", res['data']);
      if (res['code'] == 1) {
       if (type == 102) {
          this.Actions = res['data'] || [];
          (this.Actions && this.Actions.length>0) ? this.setTableActions(type) : this.resetSmartTableData();
        } else if (type == 101) {
          this.Transactions = res['data'] || [];
          (this.Transactions && this.Transactions.length>0) ? this.setTransactions(type) : this.resetSmartTableData();
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
    // start Actions
    setTableActions(type) {
      this.tableActions.data = {
        headings: this.generateHeadingsActions(),
        columns: this.getTableColumnsActions(type)
      };
      return true;
    }
  
    generateHeadingsActions() {
      let headings = {};
      for (var key in this.Actions[0]) {
        if (key.charAt(0) != "_") {
          if (key.toLowerCase() == 'action') {

          }else{
            headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
            if (key === "addtime" || key === "action_completed") {
              headings[key]["type"] = "date";
            }
          }
        }
      }
      return headings;
    }
  
    getTableColumnsActions(type) {
      let columns = [];
      this.Actions.map(lead => {
        let column = {};
        for (let key in this.generateHeadingsActions()) {
          if (key.toLowerCase() == 'action') {
            // column[key] = {
            //   value: "",
            //   isHTML: true,
            //   action: null,
            //   icons: this.actionIcons(lead, type)
            // };
          } else {
            column[key] = { value: lead[key], class: 'black', action: '' };
          }
        }
        columns.push(column);
      });
      return columns;
    }
    // end Actions

    // start Transactions
    setTransactions(type) {
      this.tableTransactions.data = {
        headings: this.generateHeadingsTransactions(),
        columns: this.getTableColumnsTransactions(type)
      };
      return true;
    }
  
    generateHeadingsTransactions() {
      let headings = {};
      for (var key in this.Transactions[0]) {
        if (key.charAt(0) != "_") {
          if (key.toLowerCase() == 'action') {

          }else{
            headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
            if (key === "addtime") {
              headings[key]["type"] = "date";
            }
          }
        }
      }
      return headings;
    }
  
    getTableColumnsTransactions(type) {
      let columns = [];
      this.Transactions.map(lead => {
        let column = {};
        for (let key in this.generateHeadingsTransactions()) {
          if (key.toLowerCase() == 'action') {
            
          } else {
            column[key] = { value: lead[key], class: 'black', action: '' };
          }
        }
        columns.push(column);
      });
      return columns;
    }
    // end Transactions

    searchTransaction(){
      console.log("searchData:", this.searchData);
      if (this.searchData.startdate && this.searchData.enddate) {
      let startDate = this.common.dateFormatter(this.searchData.startdate);
      let endDate = this.common.dateFormatter(this.searchData.enddate);
        this.getData(102, startDate, endDate);
      } else {
        this.common.showError("Select date");
      }
    }

    resetSmartTableData() {
      this.tableActions.data = {
        headings: {},
        columns: []
      };
      this.tableTransactions.data = {
        headings: {},
        columns: []
      };

    }
}
