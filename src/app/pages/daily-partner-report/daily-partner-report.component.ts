import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-daily-partner-report',
  templateUrl: './daily-partner-report.component.html',
  styleUrls: ['./daily-partner-report.component.scss']
})
export class DailyPartnerReportComponent implements OnInit {
  data = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }

  };
  headings = [];
  valobj = {};
  reportList = [];
  constructor(public common: CommonService,
    public api: ApiService) { 
      this.getReportData();
    }

  ngOnInit() {
  }

  getReportData() {
    this.reportList = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
   
    this.common.loading++;
    this.api.get('Users/getDailyPartnerReport.json?')
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
        this.reportList = res['data'] || [];
        this.reportList.length ? this.setTable() : this.resetTable();

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
    for (var key in this.reportList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    headings['Actions'] = {title: 'Actions', placeholder: this.formatTitle('Actions')}
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

    this.reportList.map(report => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key== 'Actions') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
          //  icons: this.actionIcons(report)
          };
        } else {
          column[key] = { value: report[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });

    return columns;
  }

}
