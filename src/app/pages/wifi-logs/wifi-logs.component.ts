import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShiftLogAddComponent } from '../../modals/shift-log-add/shift-log-add.component';

@Component({
  selector: 'ngx-wifi-logs',
  templateUrl: './wifi-logs.component.html',
  styleUrls: ['./wifi-logs.component.scss']
})
export class WifiLogsComponent implements OnInit {
  wifiLogList: any;
  date = new Date();
  today = new Date();

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal) {
    this.getUserWifiLogs();
  }
  ngOnInit() { }

  getUserWifiLogs() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    // let date = this.common.dateFormatter(this.date);
    // const params = '?date=' + date;
    // console.log(params);
    this.common.loading++;
    this.api.get('Admin/getUserWifiLogs')
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
        if (res['data'] && res['data']) {
          this.wifiLogList = res['data'] || [];
          this.wifiLogList.length ? this.setTable() : this.resetTable();
          console.log("wifiLogList:", this.wifiLogList);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.wifiLogList[0]) {
      // console.log(key.charAt(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if(key == 'lasttime'){
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.wifiLogList.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(inventory)
          };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

}
