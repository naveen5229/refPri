import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';

@Component({
  selector: 'ngx-tmg-meeting',
  templateUrl: './tmg-meeting.component.html',
  styleUrls: ['./tmg-meeting.component.scss','../tmg-dashboard/tmg-dashboard.component.scss']
})
export class TmgMeetingComponent implements OnInit {
  @Input() pageType: string = "Tmg-Task";
  @Input() deptId: string = null;

  chart = {
    type: '',
    data: {},
    options: {},
  };
  chart1 = {
    data: {
      dataGraph1: [],
      dataGraph2: []
    },
    type: '',
    dataSet: {
      labels: [],
      datasets: []
    },
    options: null
  };

  trends = [];
  deptMeetings = [];
  meetingPlans = [];
  worst3Cancel30days = [];
  reportingUserWorstMeetingCounts = [];
  top3UserLast30Days = [];
  worst3UserDropFromLastMonths = [];
  worst3User30DayMeetingNotManaged = [];

  constructor(public api: ApiService,
    public common: CommonService,
    private modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    console.log("page type", this.pageType);
  }

  ngOnDestroy() { }
  ngOnInit() { }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    // this.refresh();
  }

  ngOnChanges(changes) {
    console.log("ngOnChanges deptId:", this.deptId, changes);
    this.refresh();
  }

  refresh() {
    this.getTrends();
    this.getDeptMeetings();
    this.getMeetingPlans();
    this.getWorst3Cancel30days();
    this.getReportingUserWorstMeetingCounts();
    this.getTop3UserLast30Days();
    this.getWorst3UserDropFromLastMonths();
    this.getWorst3User30DayMeetingNotManaged();
  }

  getTrends() {
    this.trends = [];
    let days = 180;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(0);
    let apiname = 'AdminTask/getTmgMeetingTrends?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(0);
        if (res['data']) {
          this.getlabelValue(res['data']);

        }
      }, err => {
        this.hideLoader(0);
        console.log('Err:', err);
      });
  }
  getDeptMeetings() {
    this.deptMeetings = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(1);
    let apiname = 'AdminTask/getDeptMeetings?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(1);
        if (res['data']) {
          this.deptMeetings= res['data'];
         this.handleChart();

        }
      }, err => {
        this.hideLoader(1);
        console.log('Err:', err);
      });

  }
  getMeetingPlans() {
    this.meetingPlans = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(2);
    let apiname = 'AdminTask/getMeetingPlans?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(2);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.meetingPlans.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(2);
        console.log('Err:', err);
      });

  }
  getWorst3Cancel30days() {
    this.worst3Cancel30days = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(3);
    let apiname = 'AdminTask/getMeetingWorst3Cancel30days?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(3);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.worst3Cancel30days.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(3);
        console.log('Err:', err);
      });

  }
  getReportingUserWorstMeetingCounts() {
    this.reportingUserWorstMeetingCounts = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(4);
    let apiname = 'AdminTask/getReportingUserWorstMeetingCounts?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(4);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.reportingUserWorstMeetingCounts.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(4);
        console.log('Err:', err);
      });

  }
  getTop3UserLast30Days() {
    this.top3UserLast30Days = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(5);
    let apiname = 'AdminTask/getMeetingTop3UserLast30Days?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(5);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.top3UserLast30Days.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(5);
        console.log('Err:', err);
      });

  }
  getWorst3UserDropFromLastMonths() {
    this.worst3UserDropFromLastMonths = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(6);
    let apiname = 'AdminTask/getMeetingWorst3UserDropFromLastMonths?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(6);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.worst3UserDropFromLastMonths.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(6);
        console.log('Err:', err);
      });

  }
  getWorst3User30DayMeetingNotManaged() {
    this.worst3User30DayMeetingNotManaged = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(7);
    let apiname = 'AdminTask/getWorst3User30DayMeetingNotManaged?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(7);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.worst3User30DayMeetingNotManaged.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(7);
        console.log('Err:', err);
      });

  }

  xAxisData= [];
  yaxisObj1 = null;
  yaxisObj2 = null;
  getlabelValue(dataList = null) {
    this.xAxisData= [];
    this.yaxisObj1 = null;
    this.yaxisObj2 = null;
    if (dataList && dataList.length) {
      dataList.forEach((cmg) => {
        this.chart1.data.dataGraph1.push(cmg['Meeting(count)']);
        this.chart1.data.dataGraph2.push(cmg['duration(hours)']);
        this.xAxisData.push(cmg['Month']);
    });
  }
  this.handleChart1("line", "Hours", "line", "Count");
}

handleChart1(chartType1, label1, chartType2, label2) {
  this.yaxisObj1 = this.common.chartScaleLabelAndGrid(this.chart1.data.dataGraph1);
  this.yaxisObj2 = this.common.chartScaleLabelAndGrid(this.chart1.data.dataGraph2);
  console.log("this.yaxisObj1", this.yaxisObj1, "this.yaxisObj2", this.yaxisObj2);
  let data = {
    labels: this.xAxisData,
    datasets: []
  };

  data.datasets.push({
    type: chartType1,
    label: label1,
    borderColor: '#ed7d31',
    backgroundColor: '#ed7d31',
    pointHoverRadius: 8,
    pointHoverBackgroundColor: '#FFEB3B',
    fill: false,
    data: this.yaxisObj2.scaleData,
    yAxisID: 'y-axis-2'
  });

  data.datasets.push({
    type: chartType2,
    label: label2,
    borderColor: '#386ac4',
    backgroundColor: '#386ac4',
    fill: false,
    data: this.yaxisObj1.scaleData.map(value => { return value.toFixed(2) }),
    pointHoverRadius: 8,
    pointHoverBackgroundColor: '#FFEB3B',
    yAxisID: 'y-axis-1',
  });

  this.chart1 = {
    data: {
      dataGraph1: [],
      dataGraph2: []
    },
    type: 'linear',
    dataSet: data,
    options: this.setChartOptions("Calls Count", "Hours", "Month")
  };

}

  setChartOptions(leftSideLabel, rightSideLabel, xaxisString) {
    let options = {
      responsive: true,
      hoverMode: 'index',
      stacked: false,
      legend: {
        position: 'bottom',
        display: true
      },


      maintainAspectRatio: false,
      title: {
        display: true,
      },
      display: true,
      elements: {
        line: {
          tension: 0
        }
      },
      scales: {
        yAxes: [],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: xaxisString,
            fontSize: 17
          },
        }],
      }
    }

    options.scales.yAxes.push({
      scaleLabel: {
        display: true,
        fontSize: 16
      },
      type: 'linear',
      display: true,
      position: 'left',
      id: 'y-axis-1',

    });
    options.scales.yAxes.push({
      scaleLabel: {
        display: true,
        fontSize: 16,
      },
      // max : 100
      type: 'linear',
      display: true,
      position: 'right',
      id: 'y-axis-2',
      gridLines: {
        drawOnChartArea: false,
      },
    });
    return options;

  }


  handleChart() {
    console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.deptMeetings.map(tlt => {
      xaxis.push(tlt['department']);
      yaxis.push(tlt['Meeting(count)']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    console.log("handleChart", xaxis, yaxis);
    this.chart.type = 'bar'
    this.chart.data = {
      labels: xaxis,
      datasets: [
        {
          label: label,
          data: yaxisObj.scaleData,
          borderColor: '#3d6fc9',
          backgroundColor: '#3d6fc9',
          fill: false,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#FFEB3B',
        },
      ]
    },
      this.chart.options = {
        responsive: true,
        legend: {
          label: 'sac',
          position: 'bottom',
          display: true
        },
        scaleLabel: {
          display: true,
          labelString: 'Hour' + yaxisObj.yaxisLabel,
          fontSize: 17,
        },

        maintainAspectRatio: false,
        title: {
          display: true,
        },
        display: true,
        elements: {
          line: {
            tension: 0
          }
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Hour' + yaxisObj.yaxisLabel,
            },
            ticks: {
              beginAtZero: true,
              stepSize: yaxisObj.gridSize
            },//beginAtZero: true,min:0,
            suggestedMin: yaxisObj.minValue,
          },


          ]
        }
      };


  }


  getDetails(url, params, value = 0, type = 'days') {
    let dataparams = {
      view: {
        api: url,
        param: params,
        type: 'post'
      },

      title: 'Details'
    }
    if (value) {
      let startDate = type == 'months' ? new Date(new Date().setMonth(new Date().getMonth() - value)) : new Date(new Date().setDate(new Date().getDate() - value));
      let endDate = new Date();
      dataparams.view.param['startDate'] = this.common.dateFormatter(startDate);
      dataparams.view.param['endDate'] = this.common.dateFormatter(endDate);
      dataparams.view.param['deptId'] = this.deptId;
    }
    console.log("dataparams=", dataparams);
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  showLoader(index) {
    // if(document.getElementsByClassName("outer")[index].getElementsByClassName('loader')[0]) return;
    try {
      let outers = document.getElementsByClassName("outer");
      let ele = outers[index].getElementsByClassName('loader')[0];
      if (ele) return;
    } catch (e) {
      console.log('Exception', e);
    }
    setTimeout(() => {
      let outers = document.getElementsByClassName("outer");
      let loader = document.createElement('div');
      loader.className = 'loader';
      outers[index].appendChild(loader);
    }, 50);
  }

  hideLoader(index) {
    try {
      let outers = document.getElementsByClassName("outer");
      let ele = outers[index].getElementsByClassName('loader')[0];
      outers[index].removeChild(ele);
    } catch (e) {
      console.log('Exception', e);
    }
  }

}
