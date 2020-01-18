import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';

@Component({
  selector: 'ngx-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.scss']
})
export class DailyReportComponent implements OnInit {
  endTime = new Date();
  startTime = new Date();

  dailyReportList = [];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService,
    public modalService: NgbModal,
    private http: HttpClient,
    public api: ApiService) { 
      this.http.get('test.txt').subscribe(data => {
        console.log(data);
    })

    }

  ngOnInit() {
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }
  generateHeadings() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.dailyReportList[0]) {
      // console.log(key.charAt(0));

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

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  getTableColumns() {
    console.log(this.generateHeadings());
    let columns = [];
    this.dailyReportList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if(key =="admin_name")
        {
          column[key] ={value:ticket[key], class:'admin',isHTML:true, action: ''}
        }
        else if(key =="abs_call_time")
        {
          column[key] ={value:ticket[key], class:'blue',isHTML:true, action: this.showdata.bind(this, ticket)}
        }
        else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
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

  showdata(doc)
  {
    let dataparams = {
      view: {
        api: 'Users/getAdminCallLogReport',
        param: {
          adminId: doc['_admin_id'],
          startDate: this.common.dateFormatter(this.startTime),
          endDate: this.common.dateFormatter(this.endTime),
        }
      },
      // viewModal: {
      //   api: 'TripExpenseVoucher/getRouteTripSummaryDril',
      //   param: {
      //     startDate: '_start',
      //     endDate: '_end',
      //     type: '_type',
      //     levelId: '_id'
      //   }
      // }
      title: "Admin Call Log Details"
    }
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  
    
    
    console.log("----------123123:",doc);

  }

  getDailyReport() {
    console.log(this.startTime, this.endTime);
    this.dailyReportList = [];
    this.table = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);

    const params =
      "startDate=" + startdate +
      "&endDate=" + enddate;
      // console.log(params);
    this.common.loading++;
    this.api.get('Users/getDailyReport.json?' + params)
      .subscribe(res => {
        this.common.loading--;
        // console.log('res:', res);
        this.dailyReportList = res['data'] || [];
        console.log(this.dailyReportList);
        
        this.dailyReportList.length ? this.setTable() : this.resetTable();

        console.log(this.dailyReportList);

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  callLogs() {
    let dataparams = {
      view: {
        api: 'Users/getLastContactTime',
        param: {
          // startDate: getStartTime,
          // endDate: getEndTime,
          // type: id
        }
      },
      // viewModal: {
      //   api: 'TripExpenseVoucher/getRouteTripSummaryDril',
      //   param: {
      //     startDate: '_start',
      //     endDate: '_end',
      //     type: '_type',
      //     levelId: '_id'
      //   }
      // }
      title: "Call Log Details"
    }
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }
  
}
