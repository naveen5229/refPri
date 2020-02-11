import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-future-ref',
  templateUrl: './future-ref.component.html',
  styleUrls: ['./future-ref.component.scss']
})
export class FutureRefComponent implements OnInit {
  futureRefList = [];
  tableFutureRefList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService, public api: ApiService) {
    this.getFutureRefList();
  }

  ngOnInit() {
  }
  getFutureRefList() {
    this.api.get("Users/getFutureRef.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.futureRefList = res['data'] || [];
        this.setTableFutureRefList();
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  // start project task list
  setTableFutureRefList() {
    this.tableFutureRefList.data = {
      headings: this.generateHeadingsFutureRefList(),
      columns: this.getTableColumnsFutureRefList()
    };
    return true;
  }

  generateHeadingsFutureRefList() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.futureRefList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsFutureRefList() {
    let columns = [];
    this.futureRefList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsFutureRefList()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(ticket, -6)
          };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }
  // end project task list

}
