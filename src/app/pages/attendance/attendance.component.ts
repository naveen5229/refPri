import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  attandanceList = [];
  tableAttandanceList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService, public api: ApiService) {
    this.getAttendanceList();
  }

  ngOnInit() {
  }

  getAttendanceList() {
    this.attandanceList = [];
    this.resetTable();
    let params = "?date=" + this.common.dateFormatter(this.common.getDate());
    this.common.loading++;
    this.api.get('Admin/getAttendanceList.json' + params)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.attandanceList = res['data'] || [];
        console.log(this.attandanceList);
        this.attandanceList.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  resetTable() {
    this.tableAttandanceList.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadings() {
    let headings = {};
    for (var key in this.attandanceList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  setTable() {
    this.tableAttandanceList.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.attandanceList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else {
          column[key] = { value: typeof (ticket[key]) == 'object' ? ticket[key]['value'] : ticket[key], class: ticket[key]['class'], action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

}
