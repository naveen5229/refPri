import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';

@Component({
  selector: 'ngx-tmg-ticket',
  templateUrl: './tmg-ticket.component.html',
  styleUrls: ['./tmg-ticket.component.scss','../tmg-dashboard/tmg-dashboard.component.scss']
})

export class TmgTicketComponent implements OnInit {
  @Input() pageType: string = "Tmg-Task";
  @Input() deptId: string = null;
  @Input() tpId: string = null;
  constructor(public api: ApiService,
    public common: CommonService,
    private modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    console.log("page type", this.pageType);
  }
  ticketTrend = [];
  openTicketCount = [];
  incompleteUserWise30D = [];
  completetionTatPeriod = [];
  completetionTatUserWise = [];
  completetionTatProcess30D = [];
  longestPendingTicket = [];
  callingTatPeriod = [];
  callingTatUser30D = [];
  callingTatProcess30D = [];
  longestCallingPending = [];
  claimTatPeriod = [];
  claimTatUser30D = [];
  claimTatProcess30D = [];
  longestClaimPending = [];
  acknowledgeTatPeriod = [];
  acknowledgeTatUser30D = [];
  acknowledgeTatProcess30D = [];
  longestAcknowledgePending = [];

  ngOnDestroy() { }
  ngOnInit() { }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    // this.refresh();
  }

  ngOnChanges(changes) {
    console.log("ngOnChanges deptId:", this.deptId, changes);
    console.log("ngOnChanges tpId:", this.tpId, changes);
    this.refresh();
  }

  chart = {
    type: '',
    data: {},
    options: {},
  };

  chart1 = {
    type: '',
    data: {},
    options: {},
  };

  chart2 = {
    type: '',
    data: {},
    options: {},
  };

  chart3 = {
    type: '',
    data: {},
    options: {},
  };

  chart4 = {
    type: '',
    data: {},
    options: {},
  };

  refresh() {
    this.getTicketTrend();
    this.getOpenTicketCount();
    this.getIncompleteUserWise30D();
    this.getCompletetionTatPeriod();
    this.getCompletetionTatUserWise();
    this.getCompletetionTatProcess30D()
    this.getLongestPendingTicket();
    this.getCallingTatPeriod();
    this.getCallingTatUser30D();
    this.getCallingTatProcess30D();
    // this.getLongestCallingPending();
    this.getClaimTatPeriod();
    this.getClaimTatUser30D();
    this.getClaimTatProcess30D();
    // this.getLongestClaimPending();
    this.getAcknowledgeTatPeriod();
    this.getAcknowledgeTatUser30D();
    this.getAcknowledgeTatProcess30D();
    // this.getLongestAcknowledgePending();
  }

  xAxisData= [];
  yaxisObj1 = null;
  yaxisObj2 = null;
  getlabelValue(ticketTrend = null, type = 1) {
    this.xAxisData= [];
    this.yaxisObj1 = null;
    this.yaxisObj2 = null;
    if (ticketTrend && ticketTrend.length) {
    //   dataList.forEach((cmg) => {
    //     this.chart.data.dataGraph1.push(cmg['Meeting(count)']);
    //     this.chart.data.dataGraph2.push(cmg['duration(hours)']);
    //     this.xAxisData.push(cmg['Month']);
    // });
    this.handleChart(ticketTrend, type);
  }

}

handleChart(ticketTrend, type) {
  let yaxis = [];
  let xaxis = [];
  let zaxis = [];
  let zaxis2 = [];
  let lable1 = "Completed";
  let lable2 = "Added";
  let lable3 = "";
  if (this.pageType == "tmgTicketDashboard") {
    if (type == 1) {
      lable1 = "Completed";
      lable2 = "Added";
      lable3 = "";
    } else {
      lable1 = "";
      lable2 = "";
      lable3 = "";
    }
  }
  ticketTrend.map(tlt => {
    xaxis.push(tlt['Month']);
    yaxis.push(tlt['completed']);
    zaxis.push(tlt['added']);
  });
  console.log('trip loading time : ', ticketTrend);
  console.log('y axis data:', yaxis);

  let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
  let zaxisObj = (zaxis && zaxis.length) ? this.common.chartScaleLabelAndGrid(zaxis) : null;
  let zaxis2Obj = (zaxis2 && zaxis2.length) ? this.common.chartScaleLabelAndGrid(zaxis2) : null;
  console.log("handleChart", xaxis, yaxis);
  let chartType = 'line'
  let chartData = {
    labels: xaxis,
    datasets: [
      {
        label: lable1,
        data: yaxisObj.scaleData,
        backgroundColor: '#3d6fc9',
        borderColor: '#3d6fc9',
        fill: false,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#FFEB3B',
        borderWidth: 3,
      },

    ]
  };
  if (zaxisObj && zaxisObj.scaleData.length) {
    chartData['datasets'].push({
      label: lable2,
      data: zaxisObj.scaleData,
      backgroundColor: '#FFA500',
      borderColor: '#FFA500',
      fill: false,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#FFA500',
      borderWidth: 3,
    })
  }
  if (zaxis2Obj && zaxis2Obj.scaleData.length) {
    chartData['datasets'].push({
      label: lable3,
      data: zaxis2Obj.scaleData,
      backgroundColor: '#c9c2de',
      borderColor: '#c9c2de',
      fill: false,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#c9c2de',
      borderWidth: 3,
    })
  }
  let chartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
      display: (type == 1) ? true : false
    },
    scaleLabel: {
      display: true,
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

    tooltips: {
      enabled: true,
      mode: 'single',
      callbacks: {
        label: function (tooltipItems, data) {
          console.log("tooltipItems", tooltipItems, "data", data);
          let x = tooltipItems.yLabel;
          return tooltipItems.xLabel + " ( " + Math.floor(x * 100) + " )";
        }
      }
    },


  };

  if (type == 1) {
    this.chart.type = chartType
    this.chart.data = chartData;
    this.chart.options = chartOptions;
  }

}



  handleChart1() {
    // console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.completetionTatPeriod.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['hour']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    // console.log("handleChart1", xaxis, yaxis);
    this.chart1.type = 'bar'
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

  handleChart2() {
    // console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.callingTatPeriod.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['hour']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    // console.log("handleChart2", xaxis, yaxis);
    this.chart2.type = 'bar'
    this.chart2.data = {
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
      this.chart2.options = {
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

  handleChart3() {
    // console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.claimTatPeriod.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['hour']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    // console.log("handleChart3", xaxis, yaxis);
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

  handleChart4() {
    // console.log("this.pageType ", this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    this.acknowledgeTatPeriod.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['hour']);
    });

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    // console.log("handleChart4", xaxis, yaxis);
    this.chart4.type = 'bar'
    this.chart4.data = {
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
      this.chart4.options = {
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

  getTicketTrend() {
    this.ticketTrend = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(0);
    let apiname = 'AdminTask/getTmgTicketTrend?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(0);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.ticketTrend.push(val);
              this.getlabelValue(this.ticketTrend,1);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(0);
        console.log('Err:', err);
      });
  }

  getOpenTicketCount() {
    this.openTicketCount = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(1);
    let apiname = 'AdminTask/getTmgOpenTicketCount?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(1);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.openTicketCount.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(1);
        console.log('Err:', err);
      });
  }

  getIncompleteUserWise30D() {
    this.incompleteUserWise30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(2);
    let apiname = 'AdminTask/getTmgTicketIncompleteUserwise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(2);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.incompleteUserWise30D.push(val);
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

  getCompletetionTatPeriod() {
    this.completetionTatPeriod = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(4);
    let apiname = 'AdminTask/getTmgTicketCompletionTatPeriod?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(4);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.completetionTatPeriod.push(val);
              this.handleChart1();
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

  getCompletetionTatUserWise() {
    this.completetionTatUserWise = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(5);
    let apiname = 'AdminTask/getTmgTicketCompletionTatUserwise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(5);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.completetionTatUserWise.push(val);
              console.log('completion tat user wise', this.completetionTatUserWise);
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

  getCompletetionTatProcess30D() {
    this.completetionTatProcess30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(6);
    let apiname = 'AdminTask/getTmgTicketCompletionTatProcesswise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(6);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.completetionTatProcess30D.push(val);
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

  getLongestPendingTicket() {
    this.longestPendingTicket = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(7);
    let apiname = 'AdminTask/getTmgLongestPendingTicket?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(7);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.longestPendingTicket.push(val);
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

  getCallingTatPeriod() {
    this.callingTatPeriod = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(8);
    let apiname = 'AdminTask/getTmgTicketCallingTatPeriod?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(8);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.callingTatPeriod.push(val);
              this.handleChart2();
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

  getCallingTatUser30D() {
    this.callingTatUser30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(10);
    let apiname = 'AdminTask/getTmgTicketCallingTatUserwise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(10);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.callingTatUser30D.push(val);
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

  getCallingTatProcess30D() {
    this.callingTatProcess30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(11);
    let apiname = 'AdminTask/getTmgTicketCallingTatProcesswise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(11);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.callingTatProcess30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(11);
        console.log('Err:', err);
      });
  }

  getLongestCallingPending() {
    this.longestCallingPending = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(12);
    let apiname = 'AdminTask/getTmgTicketLongestPendingCalling?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(12);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.longestCallingPending.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(12);
        console.log('Err:', err);
      });
  }

  getClaimTatPeriod() {
    this.claimTatPeriod = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(13);
    let apiname = 'AdminTask/getTmgTicketClaimTatPeriod?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(13);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.claimTatPeriod.push(val);
              this.handleChart3();
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(13);
        console.log('Err:', err);
      });
  }

  getClaimTatUser30D() {
    this.claimTatUser30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(14);
    let apiname = 'AdminTask/getTmgTicketClaimTatUserwise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(14);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.claimTatUser30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(14);
        console.log('Err:', err);
      });
  }

  getClaimTatProcess30D() {
    this.claimTatProcess30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(15);
    let apiname = 'AdminTask/getTmgTicketClaimTatProcesswise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(15);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.claimTatProcess30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(15);
        console.log('Err:', err);
      });
  }

  getLongestClaimPending() {
    this.longestClaimPending = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(16);
    let apiname = 'AdminTask/getTmgTicketLongestPendingClaim?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(16);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.longestClaimPending.push(val);
            } else {
              return false;
            }
          });

        }

      }, err => {
        this.hideLoader(16);
        console.log('Err:', err);
      });
  }

  getAcknowledgeTatPeriod() {
    this.acknowledgeTatPeriod = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(17);
    let apiname = 'AdminTask/getTmgTicketAcknowledgeTatPeriod?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(17);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.acknowledgeTatPeriod.push(val);
              this.handleChart4();
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(17);
        console.log('Err:', err);
      });
  }

  getAcknowledgeTatUser30D() {
    this.acknowledgeTatUser30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(18);
    let apiname = 'AdminTask/getTmgTicketAcknowledgeTatUserwise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(18);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.acknowledgeTatUser30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(18);
        console.log('Err:', err);
      });
  }

  getAcknowledgeTatProcess30D() {
    this.acknowledgeTatProcess30D = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(19);
    let apiname = 'AdminTask/getTmgTicketAcknowledgeTatProcesswise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&tpId=' + this.tpId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(19);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.acknowledgeTatProcess30D.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(19);
        console.log('Err:', err);
      });
  }

  getLongestAcknowledgePending() {
    this.longestAcknowledgePending = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(20);
    let apiname = 'AdminTask/getTmgTicketLongestUnAckPending?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(20);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.longestAcknowledgePending.push(val);
            } else {
              return false;
            }
          });

        }
      }, err => {
        this.hideLoader(20);
        console.log('Err:', err);
      });
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
      dataparams.view.param['tpId'] = this.tpId;
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
