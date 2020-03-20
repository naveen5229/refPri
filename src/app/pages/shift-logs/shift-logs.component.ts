import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/User/user.service';
@Component({
  selector: 'ngx-shift-logs',
  templateUrl: './shift-logs.component.html',
  styleUrls: ['./shift-logs.component.scss']
})
export class ShiftLogsComponent implements OnInit {
  partnerId = null;
  shiftLogList: any;
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



  constructor(
    public common: CommonService,
    public user: UserService,
    public api: ApiService) {
      this.partnerId = this.user._details.partnerid;
      this.getShiftLogs();
    }
  ngOnInit() {
  }


 

  getShiftLogs() {
   
  this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };

    let date = this.common.dateFormatter(this.date);
    const params = '?date=' + date;
    console.log(params);
    this.common.loading++;
    this.api.get('Admin/getUserShiftByDate' + params,  'I')
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
        if (res['data'] && res['data']) {
          this.shiftLogList = res['data'] || [];
          this.shiftLogList.length ? this.setTable() : this.resetTable();
          console.log(this.shiftLogList);
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
    for (var key in this.shiftLogList[0]) {
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
    this.shiftLogList.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(inventory)
          };
        }   else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
      console.log(columns);
    return columns;

  }

 
}
