import { Component, AfterViewInit, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import * as Chart from 'chart.js'
import { ChartService } from '../../Service/Chart/chart.service';

@Component({
  selector: 'ngx-campaign-summary',
  templateUrl: './campaign-summary.component.html',
  styleUrls: ['./campaign-summary.component.scss']
})
export class CampaignSummaryComponent implements OnInit, AfterViewInit {

  activeTab = "";


  myChart: any;
  ctx: any;

  campaignid = null;
  campaignDataList = [];
  startDate = new Date();
  endDate = new Date();

  campaignSummaryData = [];

  userCount = [];
  poCount = [];
  callCount = [];
  totalLeadCount = [];
  stateWiseCount = [];

  temCharts = [];
  temBarCharts = [];


  myChart1: any;
  myChart2: any;

  showLabel = false;

  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  totalLeadtable = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  stateWisetable = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };


  constructor(public api: ApiService,
              public common: CommonService,
              public chart: ChartService) { 
                this.startDate.setMonth(this.startDate.getMonth() -1);
                console.log(this.startDate, this.endDate);
                this.getcampaignList();
              }

  ngOnInit() {
  }

  ngAfterViewInit() { 

  }

  getcampaignList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getCampaignList").subscribe(res => {
      this.common.loading--;
      this.campaignDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

 

  getCampaignSummary() {

    let startDate = this.common.dateFormatter(this.startDate);
    let endDate = this.common.dateFormatter(this.endDate);

    const params = 'campaignId=' + this.campaignid + '&startDate=' + startDate + '&endDate=' + endDate;
    this.common.loading++;
    this.api.get("Campaigns/getCampDashboardSummary?" + params).subscribe(res => {
      this.common.loading--;
      this.campaignSummaryData = res['data'];

      this.userCount = JSON.parse(this.campaignSummaryData['userwisecount']);
      this.poCount = JSON.parse(this.campaignSummaryData['pocccount']);
      this.callCount = JSON.parse(this.campaignSummaryData['callcount']);
      this.totalLeadCount = JSON.parse(this.campaignSummaryData['totalleadcount']);
      this.stateWiseCount = JSON.parse(this.campaignSummaryData['statewisecount']);

      this.totalLeadsetTable();
      this.stateWisesetTable();

      this.showdata(this.totalLeadCount, this.stateWiseCount);


      console.log(this.campaignSummaryData);

      console.log(JSON.parse(this.campaignSummaryData['callcount']));
      console.log(JSON.parse(this.campaignSummaryData['pocccount']));
      console.log(JSON.parse(this.campaignSummaryData['statewisecount']));
      console.log(JSON.parse(this.campaignSummaryData['totalleadcount']));
      console.log(JSON.parse(this.campaignSummaryData['userwisecount']));

    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getSummary(type) {
    console.log('working');
    if (type == 1) {
      this.resetTable();
      this.setTable(this.userCount);
    } else if (type == 2) {
      this.resetTable();
      this.setTable(this.poCount);
    } else if (type == 3) {
      this.resetTable();
      this.setTable(this.callCount);
    }
  }





  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  setTable(tableData) {
    this.table.data = {
      headings: this.generateHeadings(tableData),
      columns: this.getTableColumns(tableData)
    };
    return true;
  }

  totalLeadsetTable() {
    this.totalLeadtable.data = {
      headings: this.totalLeadgenerateHeadings(),
      columns: this.totalLeadgetTableColumns()
    };
    return true;
  }

  stateWisesetTable() {
    this.stateWisetable.data = {
      headings: this.stateWisegenerateHeadings(),
      columns: this.stateWisegetTableColumns()
    };
    return true;
  }

  generateHeadings(tableData) {

    let headings = {};
    for (var key in tableData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  totalLeadgenerateHeadings() {

    let headings = {};
    for (var key in this.totalLeadCount[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    return headings;
  }

  stateWisegenerateHeadings() {

    let headings = {};
    for (var key in this.stateWiseCount[0]) {
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


  getTableColumns(tableData) {
    let columns = [];

    tableData.map(rowData => {
      let column = {};
      for (let key in this.generateHeadings(tableData)) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(rowData)
          };
        } else {
          column[key] = { value: rowData[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  totalLeadgetTableColumns() {
    let columns = [];

    this.totalLeadCount.map(rowData => {
      let column = {};
      for (let key in this.totalLeadgenerateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(rowData)
          };
        } else {
          column[key] = { value: rowData[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })
    console.log(columns);
    return columns;
  }

  stateWisegetTableColumns() {
    let columns = [];
    console.log('aya kya');

    this.stateWiseCount.map(rowData => {
      let column = {};
      for (let key in this.stateWisegenerateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(rowData)
          };
        } else {
          column[key] = { value: rowData[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(rowData) {
    // let icons = [
    //   { class: 'fas fa-trash-alt ml-3', action: this.deleteRecord.bind(this, rowData) }
    // ];
    // return icons;
  }

 
  showdata(tableData, stateTableData) {
    console.log(stateTableData);
    this.temCharts.forEach(ele => ele.destroy());
    this.temBarCharts.forEach(ele => ele.destroy());

    let chartData1 = {
      canvas: document.getElementById('myChart1'),
      data: [tableData[0]['total_leads'], tableData[0]['valid_leads'], tableData[0]['called_leads']],
      labels: ["Total", "Valid", "Called"],
      showLegend: true
    }

    const labels = stateTableData.map(e => e.name);
    const data = stateTableData.map(e => e.leadcount);
    let chartData2 = {
      canvas: document.getElementById('myChart2'),
      data: data,
      labels: labels,
      showLegend: false
    }

 
    console.log(chartData1);
    this.temBarCharts = this.chart.generateBarChart([chartData1]);
    this.temCharts = this.chart.generatePieChart([chartData2]);
    console.log(this.temCharts);

    this.showLabel = true;

  }


}
