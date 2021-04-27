import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.scss']
})
export class CallLogsComponent implements OnInit {
  callLogList: any;
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


  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal, public mapService: MapService) {
    this.common.refresh = this.refresh.bind(this);
    this.getCallLogs();
  }

  ngOnInit() {
  }

  refresh() {
    this.getCallLogs();
  }

  getCallLogs() {
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let date = this.common.dateFormatternew(this.date);
    const params = '?Date=' + date;
    console.log(params);
    this.common.loading++;
    this.api.get('UserCallLogs/getUserCallLog' + params)
      .subscribe(res => {
        this.common.loading--;
        // if (res['code'] === 0) { this.common.showError(res['msg']); return false; }; 
        if (res['code'] > 0) {
          this.callLogList = res['data'] || [];
          this.callLogList.length ? this.setTable() : this.resetTable();
        }else{
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
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
    for (var key in this.callLogList[0]) {
      console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }


  getTableColumns() {
    let columns = [];
    this.callLogList.map(shift => {
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
    console.log(columns);
    return columns;

  }
}
