import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { ChartService } from '../../Service/Chart/chart.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import * as Chart from 'chart.js';
import { UserService } from '../../Service/user/user.service';

@Component({
  selector: 'ngx-call-kpi',
  templateUrl: './call-kpi.component.html',
  styleUrls: ['./call-kpi.component.scss']
})
export class CallKpiComponent implements OnInit {

  title = 'angular8chartjs';
  canvas1: any;
  canvas2: any;
  canvas3: any;
  canvas: any;
  ctx: any;
  myChart1: any;
  myChart2: any;
  myChart3: any;
  endTime = new Date();
  startTime = new Date();
  shiftStart = new Date();
  shiftEnd = new Date();
  showLabel = false;
  callKpiList = [];
  temCharts = [];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  departments = [];
  selectedDept = {
    id: null,
    name: ""
  };


  constructor(public common: CommonService,
    public modalService: NgbModal,
    public api: ApiService,
    public chart: ChartService,
    public user: UserService) {
    this.startTime.setDate(this.startTime.getDate() - 1)
    this.startTime.setHours(0);
    this.startTime.setMinutes(0);
    this.startTime.setSeconds(0);
    this.endTime.setDate(this.endTime.getDate() - 1)
    this.endTime.setHours(23);
    this.endTime.setMinutes(59);
    this.endTime.setSeconds(59);
    this.shiftStart.setHours(9)
    this.shiftStart.setMinutes(30)
    this.shiftEnd.setHours(18)
    this.shiftEnd.setMinutes(30)
    this.getCallKpi();

    //  const doc = this.getCallKpi();
    // this.shiftStart.setDate(this.endTime.getDate()-1)
    // this.endTime.setDate(this.endTime.getDate()-1)
    // console.log(this.shiftStart.getTime());
    this.getDepartments();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.getCallKpi();
    this.getDepartments();
  }

  getDepartments() {
    this.common.loading++;
    this.api.get("Admin/getDepartmentList")
      .subscribe(res => {
        this.common.loading--;
        this.departments = [];
        this.departments.push({ "id": null, "name": "All Departments" });
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        if (res['data'] && res['data'].length > 0) {
          for (let i = 0; i < res['data'].length; i++) {
            this.departments.push({ "id": res['data'][i]["id"], "name": res['data'][i]["name"] });
          }
        }
        // this.departments = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getCallKpi() {
    this.callKpiList = [];
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
    let shiftStart = this.common.timeFormatter1(this.shiftStart);
    let shiftEnd = this.common.timeFormatter1(this.shiftEnd);

    const params =
      "startDate=" + startdate +
      "&endDate=" + enddate +
      "&shiftStart=" + shiftStart +
      "&shiftEnd=" + shiftEnd +
      "&departmentId=" + this.selectedDept.id;
    this.common.loading++;
    this.api.get('Users/getAdminCallKpis.json?' + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        this.callKpiList = res['data'] || [];
        this.showChart(this.callKpiList[0]);
        this.callKpiList.length ? this.setTable() : this.resetTable();
        return this.callKpiList[0];
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
  generateHeadings() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.callKpiList[0]) {
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
    this.callKpiList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == "Admin Name") {
          column[key] = { value: ticket[key], class: 'blue', isHTML: true, action: this.showChart.bind(this, ticket) }

        }
        else if (ticket["_href"].includes(key)) {
          column[key] = { value: ticket[key], class: 'blue', isHTML: true, action: this.callDetails.bind(this, ticket) }
        }


        else if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else {
          column[key] = { value: (ticket[key] && typeof (ticket[key]) == 'object') ? ticket[key]['value'] + ticket[key]['suffix'] : ticket[key], class: (ticket[key]) ? ticket[key]['class'] : '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;

  }

  showChart(doc) {
    if (this.user._loggedInBy == 'admin') {
      this.showChartForAdmin(doc);
    } else {
      this.showChartForFOadmin(doc);
    }
  }

  showChartForAdmin(doc) {
    console.log("doc", doc)
    this.temCharts.forEach(ele => ele.destroy());
    console.log(doc);

    let chartData1 = {
      canvas: document.getElementById('myChart1'),
      data: [doc['_type_cnt']['incoming'], doc['_type_cnt']['outgoing'], doc['_type_cnt']['missed'], doc['_type_cnt']['other']],
      labels: ["Incoming", "Outgoing", "Missed", "Others"],
      showLegend: true
    }

    let chartData2 = {
      canvas: document.getElementById('myChart2'),
      data: [doc['Tk. Cnt.']['value'], doc['FO Cnt.']['value'], doc['Pt. Cnt.']['value'], doc['Ad. Cnt.']['value'], doc['Ot. Cnt.']['value']],
      labels: ["Tickets", "FO", "Partner", "Admin", "Others"],
      bgColor: [doc['Tk. Cnt.']['class'], doc['FO Cnt.']['class'], doc['Pt. Cnt.']['class'], doc['Ad. Cnt.']['class'], doc['Ot. Cnt.']['class']],
      showLegend: false
    }

    let chartData3 = {
      canvas: document.getElementById('myChart3'),
      data: [doc['Tk. Dur.']['value'], doc['FO Dur.']['value'], doc['Pt. Dur.']['value'], doc['Ad. Dur.']['value'], doc['Ot. Dur.']['value']],
      labels: ["Tickets", "FO", "Partner", "Admin", "Others"],
      bgColor: [doc['Tk. Dur.']['class'], doc['FO Dur.']['class'], doc['Pt. Dur.']['class'], doc['Ad. Dur.']['class'], doc['Ot. Dur.']['class']],
      showLegend: false
    }
    console.log(chartData1, chartData2, chartData3);
    this.temCharts = this.chart.generatePieChartforCall([chartData1, chartData2, chartData3]);

    this.showLabel = true;

  }

  showChartForFOadmin(doc) {
    this.temCharts.forEach(ele => ele.destroy());
    let chartData1 = {
      canvas: document.getElementById('myChart1'),
      data: [doc['_type_cnt']['incoming'], doc['_type_cnt']['outgoing'], doc['_type_cnt']['missed'], doc['_type_cnt']['other']],
      labels: ["Incoming", "Outgoing", "Missed", "Others"],
      showLegend: true
    }

    let chartData2 = {
      canvas: document.getElementById('myChart2'),
      data: [doc['Ad. Cnt.']['value'], doc['Ot. Cnt.']['value']],
      labels: ["Admin", "Others"],
      bgColor: [doc['Ad. Cnt.']['class'], doc['Ot. Cnt.']['class']],
      showLegend: false
    }

    let chartData3 = {
      canvas: document.getElementById('myChart3'),
      data: [doc['Ad. Dur.']['value'], doc['Ot. Dur.']['value']],
      labels: ["Admin", "Others"],
      bgColor: [doc['Ad. Dur.']['class'], doc['Ot. Dur.']['class']],
      showLegend: false
    }
    this.temCharts = this.chart.generatePieChartforCall([chartData1, chartData2, chartData3]);

    this.showLabel = true;
  }

  callDetails(callData) {
    let dataparams = {
      view: {
        api: 'Users/getAdminCallKpis.json',
        param: {

          startDate: this.common.dateFormatter(this.startTime),
          endDate: this.common.dateFormatter(this.endTime),
          shiftStart: this.common.timeFormatter1(this.shiftStart),
          shiftEnd: this.common.timeFormatter1(this.shiftEnd),
          adminId: callData['_admin_id']


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
      title: "Call Log Details" + ' ' + '(' + callData['Admin Name'] + ')'
    }
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }


  exportCSV() {
    let exportCsvData = {
      headings: {},
      Columns: []
    }
    for (var key in this.callKpiList[0]) {
      if (key.charAt(0) != "_") {
        if (key.replace(/[.\s]/g, '') === 'TotalDur(HH:MM)') {
          exportCsvData.headings['TotalDur'] = { title: 'TotalDur', placeholder: this.common.formatTitle(key) };
        } else {
          exportCsvData.headings[key.replace(/[.\s]/g, '')] = { title: key.replace(/[.\s]/g, ''), placeholder: this.common.formatTitle(key) };
        }
      }
    }


    exportCsvData.Columns = this.callKpiList.map(ele => {
      return {
        AdCnt: `${ele['Ad. Cnt.']['value']}%`,
        AdDur: `${ele['Ad. Dur.']['value']}%`,
        FOCnt: `${ele['FO Cnt.']['value']}%`,
        FODur: `${ele['FO Dur.']['value']}%`,
        OtCnt: `${ele['Ot. Cnt.']['value']}%`,
        OtDur: `${ele['Ot. Dur.']['value']}%`,
        PtCnt: `${ele['Pt. Cnt.']['value']}%`,
        PtDur: `${ele['Pt. Dur.']['value']}%`,
        TkCnt: `${ele['Tk. Cnt.']['value']}%`,
        TkDur: `${ele['Tk. Dur.']['value']}%`,
        AdminName: `${ele['Admin Name']}`,
        ProCnt: `${ele['Pro. Cnt.']['value']}%`,
        TotalCall: `${ele['Total Call']}`,
        TotalDur: `${ele['Total Dur. (HH:MM)']}`,
        dept: `${ele['dept']}`
      }
    });

    this.common.getCSVFromDataArray(exportCsvData.Columns, exportCsvData.headings, 'Call Kpi Report');
    console.log(exportCsvData)
  }
}
