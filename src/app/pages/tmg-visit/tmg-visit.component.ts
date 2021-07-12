import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';

@Component({
  selector: 'ngx-tmg-visit',
  templateUrl: './tmg-visit.component.html',
  styleUrls: ['./tmg-visit.component.scss']
})
export class TmgVisitComponent implements OnInit {
  @Input() pageType: string = "Tmg-Task";
  @Input() deptId: string = null;

  chart1 = {
    type: '',
    data: {},
    options: {},
  };
  chart2 = {
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
  chart3 = {
    type: '',
    data: {},
    options: {},
  };

  visitsPerDays = [];
  visitPerClient = [];
  worst3UserVisitPresentDay = [];
  worst3MaxDrop30D = [];
  clientWiseVisitTop3 = [];
  userWiseVisitTop3 = [];
  top3UserExpensePerVisit = [];
  expenseIncreasedTop3 = [];
  mostExpensiveVisit30D = [];
  maxDeductionTop3 = [];

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
    this.getVisitsPerDays();
    this.getVisitPerClient();
    this.getWorst3UserVisitPresentDay();
    this.getWorst3MaxDrop30D();
    this.getClientWiseVisitTop3();
    this.getUserWiseVisitTop3();
    this.getTop3UserExpensePerVisit();
    this.getExpenseIncreasedTop3();
    this.getMostExpensiveVisit30D();
    this.getMaxDeductionTop3();
  }

  getVisitsPerDays() {
    this.visitsPerDays = [];
    let days = 180;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(0);
    let apiname = 'AdminTask/getVisitsPerDays?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(0);
        if (res['data']) {
          this.visitsPerDays = res['data'];
          this.handleChart1();
        }
      }, err => {
        this.hideLoader(0);
        console.log('Err:', err);
      });
  }
  getVisitPerClient() {
    this.visitPerClient = [];
    let days = 180;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(2);
    let apiname = 'AdminTask/getVisitPerClient?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(2);
        if (res['data']) {
          this.visitPerClient = res['data'];
          this.handleChart3();
        }
      }, err => {
        this.hideLoader(2);
        console.log('Err:', err);
      });

  }
  getWorst3UserVisitPresentDay() {
    this.worst3UserVisitPresentDay = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(3);
    let apiname = 'AdminTask/getWorst3UserVisitPresentDay?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(3);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.worst3UserVisitPresentDay.push(val);
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
  getWorst3MaxDrop30D() {
    this.worst3MaxDrop30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(4);
    let apiname = 'AdminTask/getWorst3MaxDrop30D?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(4);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.worst3MaxDrop30D.push(val);
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
  getClientWiseVisitTop3() {
    this.clientWiseVisitTop3 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(5);
    let apiname = 'AdminTask/getClientWiseVisitTop3?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(5);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.clientWiseVisitTop3.push(val);
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

  getUserWiseVisitTop3() {
    this.userWiseVisitTop3 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(6);
    let apiname = 'AdminTask/getUserWiseVisitTop3?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(6);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.userWiseVisitTop3.push(val);
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
  getTop3UserExpensePerVisit() {
    this.top3UserExpensePerVisit = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(7);
    let apiname = 'AdminTask/getTop3UserExpensePerVisit?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(7);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.top3UserExpensePerVisit.push(val);
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
  getExpenseIncreasedTop3() {
    this.expenseIncreasedTop3 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(8);
    let apiname = 'AdminTask/getExpenseIncreasedTop3?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(8);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.expenseIncreasedTop3.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(8);
        console.log('Err:', err);
      });

  }
  getMostExpensiveVisit30D() {
    this.mostExpensiveVisit30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(9);
    let apiname = 'AdminTask/getMostExpensiveVisit30D?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(9);
        res['data'] = [
          {
          visit:"V1",
          'km/visit':100,
          manual_expense:300,
          total:400,
        },
        {
          visit:"V2",
          'km/visit':80,
          manual_expense:250,
          total:330,
        },
        {
          visit:"V3",
          'km/visit':60,
          manual_expense:200,
          total:120,
        },
      ]
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.mostExpensiveVisit30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(9);
        console.log('Err:', err);
      });

  }

  getMaxDeductionTop3() {
    this.maxDeductionTop3 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(10);
    let apiname = 'AdminTask/getMaxDeductionTop3?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(10);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.maxDeductionTop3.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(10);
        console.log('Err:', err);
      });

  }

  xAxisData = [];
  yaxisObj1 = null;
  yaxisObj2 = null;
  getlabelValue(dataList = null) {
    this.xAxisData = [];
    this.yaxisObj1 = null;
    this.yaxisObj2 = null;
    if (dataList && dataList.length) {
      dataList.forEach((cmg) => {
        this.chart2.data.dataGraph1.push(cmg['Meeting(count)']);
        this.chart2.data.dataGraph2.push(cmg['duration(hours)']);
        this.xAxisData.push(cmg['Month']);
      });
    }
    this.handleChart2("line", "Hours", "line", "Count");
  }

  
  handleChart1() {
    console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.visitsPerDays.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['count']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    console.log("handleChart", xaxis, yaxis);
    this.chart1.type = 'line'
    this.chart1.data = {
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
      this.chart1.options = {
        responsive: true,
        legend: {
          label: 'sac',
          position: 'bottom',
          display: true
        },
        scaleLabel: {
          display: true,
          labelString: 'Count' +yaxisObj.yaxisLabel,
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
              labelString:   'Count' +yaxisObj.yaxisLabel,
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

  handleChart2(chartType1, label1, chartType2, label2) {
    this.yaxisObj1 = this.common.chartScaleLabelAndGrid(this.chart2.data.dataGraph1);
    this.yaxisObj2 = this.common.chartScaleLabelAndGrid(this.chart2.data.dataGraph2);
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

    this.chart2 = {
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



  handleChart3() {
    console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.visitPerClient.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['count']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    console.log("handleChart", xaxis, yaxis);
    this.chart3.type = 'bar'
    this.chart3.data = {
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
      this.chart3.options = {
        responsive: true,
        legend: {
          label: 'sac',
          position: 'bottom',
          display: true
        },
        scaleLabel: {
          display: true,
          labelString: 'Count' + yaxisObj.yaxisLabel,
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
              labelString: 'Count' + yaxisObj.yaxisLabel,
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
