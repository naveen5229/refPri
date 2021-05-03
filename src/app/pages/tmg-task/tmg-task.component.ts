import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import _ from 'lodash';

@Component({
  selector: 'tmg-task',
  templateUrl: './tmg-task.component.html',
  styleUrls: ['./tmg-task.component.scss']
})
export class TmgTaskComponent implements OnInit {
  challansMonthGraph = [];
  longestunreadhoursdata = [];
  TaskSnapchat = [];
  uncomplete = [];
  holdtask = [];
  overduetaskdata = [];
  xAxisData = [];
  yaxisObj1 = null;
  yaxisObj2 = null;
  userwisereadavgtat = [];
  userwisereadavgtatfulldata = [];
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

  @Input() pageType: string = "Tmg-Task";
  @Input() deptId: string = null;
  // deptId = 9;
  TaskSnapchatTop3 = [];

  constructor(public api: ApiService,
    public common: CommonService,
    private modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnDestroy() { }
  ngOnInit() { }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    // this.refresh();
  }

  ngOnChanges(changes) {
    console.log("ngOnChanges deptId:", this.deptId);
    this.refresh();
  }

  refresh() {
    this.xAxisData = [];
    this.getChallansMonthGraph(0, 1);
    this.getuserwisereadtat(1);
    this.getTaskSnapchat(2);
    this.getuncomplete(3);
    this.getHoldTask(4);
    this.getoverduetask(5);
    this.getlongestunreadhours(6);
    if (this.pageType == "Tmg-worklog") {
      this.getChallansMonthGraph(7, 2);
      this.getChallansMonthGraph(8, 3);
    }
  }

  getChallansMonthGraph(index, chrtIndex = 1) {
    this.challansMonthGraph = [];
    this.showLoader(index);
    let days = 120;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskMonthgraph?startDate=' + params.fromdate + '&endDate=' + params.todate;
    if (this.pageType == "Tmg-worklog") {
      if (chrtIndex == 1) {
        apiname = 'AdminTask/getTmgWorkhourMonthgraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      } else if (chrtIndex == 2) {
        apiname = 'AdminTask/getTmgAttenDefaultergraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      } else if (chrtIndex == 3) {
        apiname = 'AdminTask/getTmgMonthwiseProductivity?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      }

    }
    this.api.get(apiname)
      .subscribe(res => {
        console.log('challansMonthGraph:', res);
        this.challansMonthGraph = res['data'];
        this.hideLoader(index);
        this.getlabelValue(this.challansMonthGraph, chrtIndex);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getTaskSnapchat(index) {
    this.TaskSnapchat = [];
    this.TaskSnapchatTop3 = [];
    this.showLoader(index);
    // let params = { totalrecord: 3 };
    let days = (this.pageType == "Tmg-worklog") ? 30 : 120;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskSnapshot';
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgUserwiseWorkAvail?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        this.TaskSnapchat = res['data'][0];
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.TaskSnapchatTop3.push(val);
            } else {
              return false;
            }
          });
          this.TaskSnapchatTop3 = _.uniqBy(this.TaskSnapchatTop3, 'name');
        }
        this.hideLoader(index);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getuncomplete(numindex) {
    this.uncomplete = [];
    let days = (this.pageType == "Tmg-worklog") ? 30 : 90;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(numindex);
    let apiname = 'AdminTask/getDashboardTaskUserwiseUncomplete?startDate=' + params.fromdate + '&endDate=' + params.todate;
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgWorklogDefaulters?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        console.log('uncomplete:', numindex, res['data']);
        this.hideLoader(numindex);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.uncomplete.push(val);
            } else {
              return false;
            }
            console.log('index1', index1);
          });
          this.uncomplete = _.uniqBy(this.uncomplete, 'name');
        }

        // this.hideLoader(index);
      }, err => {
        this.hideLoader(numindex);
        console.log('Err:', err);
      });
  }

  getHoldTask(index) {
    this.holdtask = [];
    let days = (this.pageType == "Tmg-worklog") ? 30 : 90;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(index);
    let apiname = 'AdminTask/getDashboardTaskUserwisehold?startDate=' + params.fromdate + '&endDate=' + params.todate;
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgWosrtThreeDefaulters?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.holdtask.push(val);
            }
          });
          this.holdtask = _.uniqBy(this.holdtask, 'name');
        }
        console.log('holdtask:', this.holdtask);
        this.hideLoader(index);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getoverduetask(index) {
    this.overduetaskdata = [];
    this.showLoader(index);
    let days = (this.pageType == "Tmg-worklog") ? 30 : 90;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskUserwiseOverduelive';
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgWosrtThreeUserwisePh?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.overduetaskdata.push(val);
            }
          });
          this.overduetaskdata = _.uniqBy(this.overduetaskdata, 'name');
        }
        console.log('holdtask:', this.overduetaskdata);
        this.hideLoader(index);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }
  getuserwisereadtat(index) {
    this.userwisereadavgtat = [];
    this.userwisereadavgtatfulldata = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(index);
    // let apiname = 'AdminTask/getDashboardTaskUserwiseUnreadtat?startDate=' + params.fromdate + '&endDate=' + params.todate;
    let apiname = 'AdminTask/getDashboardTaskMonthwiseUnreadTat?startDate=' + params.fromdate + '&endDate=' + params.todate;
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgActivitylogDefaulters?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        this.userwisereadavgtatfulldata = res['data'];
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.userwisereadavgtat.push(val);
            }
          });
        }
        this.userwisereadavgtat = _.uniqBy(this.userwisereadavgtat, 'Month');
        this.hideLoader(index);
        if (this.pageType == "Tmg-Task") {
          this.getsecondlabelValue();
        }
        console.log('holdtask:', this.userwisereadavgtat);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getsecondlabelValue() {
    if (this.userwisereadavgtat) {
      // this.userwisereadavgtat.forEach((cmg) => {
      //   this.chart.data.line.push(cmg['name']);
      //   this.chart.data.bar.push(cmg['hour']);
      //   this.xAxisData.push(cmg['hour']);
      // });

      this.handleChart();
    }
  }

  getlongestunreadhours(index) {
    this.longestunreadhoursdata = [];
    this.showLoader(index);
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskLongestUnreadhour';
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgUserwiseProductivity?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    }
    this.api.get(apiname)
      .subscribe(res => {
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.longestunreadhoursdata.push(val);
            }
          });
          this.longestunreadhoursdata = _.uniqBy(this.longestunreadhoursdata, 'name');
        }
        this.hideLoader(index);
        console.log('holdtask:', this.longestunreadhoursdata);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getlabelValue(dataList = null, type = 1) {
    if (dataList && dataList.length) {
      // this.challansMonthGraph.forEach((cmg) => {
      //   this.chart.data.line.push(cmg['Month']);
      //   this.chart.data.bar.push(cmg['Completed']);
      //   this.xAxisData.push(cmg['Added']);
      // });

      this.handleChart1(dataList, type);
    }
  }
  handleChart1(dataList, type) {
    let yaxis = [];
    let xaxis = [];
    let zaxis = [];
    let zaxis2 = [];
    let lable1 = "Completed";
    let lable2 = "Added";
    let lable3 = "";
    if (this.pageType == "Tmg-worklog") {
      if (type == 1) {
        lable1 = "Present";
        lable2 = "Activitylog";
        lable3 = "Worklog";
      } else {
        lable1 = "";
        lable2 = "";
        lable3 = "";
      }
    }
    // challansMonthGraph
    dataList.map(tlt => {
      xaxis.push(tlt['Month']);
      if (this.pageType == "Tmg-worklog") {
        if (type == 1) {
          yaxis.push(tlt['Present']);
          zaxis.push((tlt['Activitylog']) ? tlt['Activitylog'] : 0);
          zaxis2.push((tlt['Worklog']) ? tlt['Worklog'] : 0);
        } else if (type == 2) {
          yaxis.push((tlt['Defaulter %']) ? tlt['Defaulter %'] : 0);
        } else if (type == 3) {
          yaxis.push((tlt['productivity']) ? tlt['productivity'] : 0);
        }
      } else {
        yaxis.push(tlt['Completed']);
        zaxis.push(tlt['Added']);
      }
    });
    console.log('trip loading time : ', dataList);
    console.log('y axis data:', yaxis);

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    let zaxisObj = (zaxis && zaxis.length) ? this.common.chartScaleLabelAndGrid(zaxis) : null;
    let zaxis2Obj = (zaxis2 && zaxis2.length) ? this.common.chartScaleLabelAndGrid(zaxis2) : null;
    console.log("handleChart1", xaxis, yaxis);
    // this.chart1.type = chartType
    // this.chart1.data = chartData;
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
        // {
        //   label: lable2,
        //   data: zaxisObj.scaleData,
        //   backgroundColor: '#FFA500',
        //   borderColor: '#FFA500',
        //   fill: false,
        //   pointHoverRadius: 8,
        //   pointHoverBackgroundColor: '#FFA500',
        //   borderWidth: 3,
        // }
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
      // scales: {
      //   yAxes: [{
      //     scaleLabel: {
      //       display: true,
      //       labelString: 'Time (in Hrs.)' + yaxisObj.yaxisLabel
      //     },
      //     ticks: { stepSize: yaxisObj.gridSize },//beginAtZero: true,min:0,
      //     suggestedMin: yaxisObj.minValue,
      //   }
      //   ],
      //   xAxes: [{
      //     scaleLabel: {
      //       display: true,
      //       labelString: 'Completed (yello line)  ' + 'Added (Blue line)' 

      //     },
      //     ticks: { stepSize: yaxisObj.gridSize },//beginAtZero: true,min:0,
      //     suggestedMin: yaxisObj.minValue,
      //   }
      //   ]
      // },
      tooltips: {
        enabled: true,
        mode: 'single',
        callbacks: {
          label: function (tooltipItems, data) {
            console.log("tooltipItems", tooltipItems, "data", data);
            // let tti = ('' + tooltipItems.yLabel).split(".");
            // let min = tti[1] ? String(parseInt(tti[1]) * 6).substring(0, 2) : '00';
            // return tooltipItems.xLabel + " ( " + tti[0] + ":" + min + " Hrs. )";
            let x = tooltipItems.yLabel;
            // let z = (parseFloat(x.toFixed()) + parseFloat((x % 1).toFixed(10)) * 0.6).toString();
            // z = z.slice(0, z.indexOf('.') + 3).split('.').join(':');
            //   return tooltipItems.xLabel + " ( " + z + " Hrs. )";
            //let z = (parseFloat((x % 1).toFixed(10)) * 0.6).toString();
            // z = z.slice(0, z.indexOf('.') + 3).split('.').join(':') ;
            // let final = x.toString().split('.')[0] +':'+ z.split(':')[1];

            return tooltipItems.xLabel + " ( " + Math.floor(x * 100) + " )";
          }
        }
      },
      // scales: {
      //   yAxes: [{
      //     ticks: { stepSize: 50000},
      //     suggestedMin : 0,
      //     max : 100
      //   }]
      //  },

    };

    if (type == 1) {
      this.chart1.type = chartType
      this.chart1.data = chartData;
      this.chart1.options = chartOptions;
    } else if (type == 2) {
      this.chart2.type = chartType
      this.chart2.data = chartData;
      this.chart2.options = chartOptions;
    } else if (type == 3) {
      this.chart3.type = chartType
      this.chart3.data = chartData;
      this.chart3.options = chartOptions;
    }

  }
  handleChart() {
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    if (this.pageType == "Tmg-worklog") {
      label = "Defaulter %";
    }
    console.log(this.userwisereadavgtat)
    this.userwisereadavgtat.map(tlt => {
      if (this.pageType == "Tmg-worklog") {
        xaxis.push(tlt['Month']);
        yaxis.push(tlt['Defaulter %']);
      } else {
        // xaxis.push(tlt['name']);
        xaxis.push(tlt['Month']);
        yaxis.push(tlt['hour']);
      }
    });
    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    console.log("handleChart", xaxis, yaxis);
    // this.chart.type = 'bar'
    this.chart.type = 'line';
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
          display: false
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
              labelString: 'Hour' + yaxisObj.yaxisLabel
            },
            ticks: {
              beginAtZero: true,
              stepSize: yaxisObj.gridSize
            },//beginAtZero: true,min:0, 
            suggestedMin: yaxisObj.minValue,
          },


          ]
        }
        // scales: {
        //   yAxes: [{
        //     ticks: { stepSize: 50000},
        //   }]
        //  },

      };


  }

  setChartOptions() {
    let options = {
      responsive: true,
      hoverMode: 'index',
      stacked: false,
      legend: {
        position: 'bottom',
        display: true
      },
      // tooltips: {
      //   mode: 'index',
      //   intersect: 'true'
      // },

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
            labelString: 'Months',
            fontSize: 17
          },
        }],
      }
    }

    console.log('this.yaxisObj1.minValue', this.yaxisObj1.minValue);
    console.log('this.yaxisObj2.minValue', this.yaxisObj2.minValue);

    options.scales.yAxes.push({
      // scaleLabel: {
      //   display: true,
      //   labelString: 'Count of Challans'+this.yaxisObj1.yaxisLabel,
      //   fontSize: 16
      // },
      ticks: { stepSize: (this.yaxisObj1.gridSize), min: this.yaxisObj1.minValue - this.yaxisObj1.gridSize > 0 ? this.yaxisObj1.minValue - this.yaxisObj1.gridSize : 0 }, //beginAtZero: true,min:0,
      // suggestedMin : this.yaxisObj1.minValue,
      type: 'linear',
      display: true,
      position: 'left',
      id: 'y-axis-1',

    });
    options.scales.yAxes.push({
      // scaleLabel: {
      //   display: true,
      //   labelString: 'Challan Amount '+this.yaxisObj2.yaxisLabel,
      //   fontSize: 16,
      // },
      ticks: { stepSize: (this.yaxisObj2.gridSize), beginAtZero: true }, //beginAtZero: true,min:0,
      suggestedMin: this.yaxisObj2.minValue,
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

  getDetials(url, params, value = 0, type = 'days') {
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