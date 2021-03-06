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
  departmentId = null;
  departments = [];
  departmentName = '';

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
    this.getDepartments();
  }

  ngOnInit() {
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList", "I")
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.departments = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  selectedDepartment(selectedDepartment) {
    console.log(selectedDepartment);
    this.departmentId = selectedDepartment.id;
    this.departmentName = selectedDepartment.name;
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
        if (key == "admin_name") {
          column[key] = { value: ticket[key], class: 'admin', isHTML: true, action: '' }
        }
        else if (key == ticket["_call_rep_href"]) {
          column[key] = { value: ticket[key], class: 'blue', isHTML: true, action: this.showdata.bind(this, ticket) }
        }
        else if (key == ticket["_href_camp"]) {
          column[key] = { value: ticket[key], class: 'blue', isHTML: true, action: this.showCallData.bind(this, ticket) }
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
    return columns;

  }

  showdata(doc) {
    console.log(doc);
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
      title: "Admin Call Log Details" + '(' + ' ' + doc['Admin Name'] + ')'
    }
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });



    console.log("----------123123:", doc);

  }

  showCallData(doc) {
    let dataparams = {
      view: {
        api: 'Users/getAdminCampaignReport',
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
      title: "Admin Call Log Details" + '(' + ' ' + doc['Admin Name'] + ')'
    }
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  showCallData1() {
    let dataparams = {
      view: {
        api: 'Users/getWalle8CampaignAdminWise',
        param: {
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
      "&endDate=" + enddate +
      "&departmentId=" + this.departmentId;
    // console.log(params);
    this.common.loading++;
    this.api.get('Users/getDailyReport.json?' + params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.dailyReportList = res['data'] || [];
        this.dailyReportList.length ? this.setTable() : this.resetTable();
      }, err => {
        this.common.loading--;
        this.common.showError();
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

  getWalle8CampaignPurposeWise() {
    if (this.startTime && this.endTime) {
      let dataparams = {
        view: {
          api: 'Users/getWalle8CampaignPurposeWise',
          param: {
            startDate: this.common.dateFormatter(this.startTime),
            endDate: this.common.dateFormatter(this.endTime)
          }
        },
        title: "Walle8 Campaign Purpose Wise"
      }
      // this.common.handleModalSize('class', 'modal-lg', '1100');
      this.common.params = { data: dataparams };
      const activeModal = this.modalService.open(GenericModelComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    } else {
      this.common.showError("Select start date and end date");
    }

  }

  // start: wrong captcha
  captchList = [];
  tableWrongCaptcha = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  getWrongCaptcha() {
    document.getElementById("wrongCaptchaModal").style.display = "block";
    this.captchList = [];
    this.resetTable();
    this.common.loading++;
    this.api.get('Users/getWrongCaptcha.json?')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.captchList = res['data'] || [];
        this.captchList.length ? this.setWrongCaptchaTable() : this.resetWrongCaptchaTable();
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  resetWrongCaptchaTable() {
    this.tableWrongCaptcha.data = {
      headings: {},
      columns: []
    };
  }

  setWrongCaptchaTable() {
    this.tableWrongCaptcha.data = {
      headings: this.generateHeadingsWrongCaptcha(),
      columns: this.getTableColumnsWrongCaptcha()
    };
    return true;
  }

  generateHeadingsWrongCaptcha() {
    let headings = {};
    for (var key in this.captchList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsWrongCaptcha() {
    let columns = [];
    this.captchList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadingsWrongCaptcha()) {
        if (key == 'Action') {
          // column[key] = {
          //   value: "",
          //   isHTML: true,
          //   action: null,
          //   // icons: this.actionIcons(pending)
          // };
        } else {
          column[key] = { value: ticket[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

  closeMapModal() {
    document.getElementById("wrongCaptchaModal").style.display = "none";
  }
  // end:wrong captcha

}
