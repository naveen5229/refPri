import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import _ from 'lodash';
import { Console } from 'console';

@Component({
  selector: 'tmg-task',
  templateUrl: './tmg-task.component.html',
  styleUrls: ['./tmg-task.component.scss','../tmg-dashboard/tmg-dashboard.component.scss']
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
  readingTatGraphData = [];
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

  doubleChart = {
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
  dataList9 = [];
  dataList10 = [];
  dataList11 = [];

  @Input() pageType: string = "Tmg-Task";
  @Input() deptId: string = null;
  // deptId = 9;
  TaskSnapchatTop3 = [];

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
    this.xAxisData = [];
    this.getChallansMonthGraph(0, 1);

    if (this.pageType == 'tmgCallDashboard') {
      this.getTaskSnapchat(1);
      this.getoverduetask(2);
      this.getuserwisereadtat(8);
      this.getMissedCallNotRevertedData(5);

    }
    else {
      this.getuserwisereadtat(1);
      if (this.pageType == 'Tmg-Task') {
        this.getreadingtatgraphdata(1);
      }
      this.getTaskSnapchat(2);
      this.getuncomplete(3);
      this.getHoldTask(4);
      this.getoverduetask(5);

      if (["Tmg-worklog", "tmgProcess"].includes(this.pageType)) {
        this.getChallansMonthGraph(7, 2);
        this.getChallansMonthGraph(8, 3);
      }
      if (this.pageType == 'tmgProcess') {
        // this.getdataList9(9);
        this.getdataList10(10);
        this.getdataList11(11);
      }
    }
    this.getlongestunreadhours(6);
  }

  getChallansMonthGraph(index, chrtIndex = 1) {
    this.challansMonthGraph = [];
    this.showLoader(index);
    let days = (['tmgProcess'].includes(this.pageType)) ? 30 : 120;
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
    } else if (this.pageType == "tmgProcess") {
      if (chrtIndex == 1) {
        apiname = 'AdminTask/getTmgProcessMonthgraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      } else if (chrtIndex == 2) {
        apiname = 'AdminTask/getTmgProcessCompletiontatGraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      } else if (chrtIndex == 3) {
        apiname = 'AdminTask/getTmgProcessCompletiontatGraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      }
    } else if (this.pageType == "tmgCallDashboard") {
      if (chrtIndex == 1) {
        apiname = 'AdminTask/getCallLogMonthgraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      } else if (chrtIndex == 2) {
        apiname = 'AdminTask/getCallLogMonthgraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      } else if (chrtIndex == 3) {
        apiname = 'AdminTask/getMissedCallMonthGraph?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
      }
    }
    this.api.get(apiname)
      .subscribe(res => {
        console.log('challansMonthGraph:', res);
        this.challansMonthGraph = res['data'];
        this.hideLoader(index);
        this.getlabelValue(this.challansMonthGraph, chrtIndex, this.pageType);
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
    let days = (['Tmg-worklog', 'tmgProcess'].includes(this.pageType)) ? 30 : 120;
    if (this.pageType == "tmgCallDashboard") {
      days = 7;
    }
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskSnapshot';
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgUserwiseWorkAvail?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    } else if (this.pageType == "tmgProcess") {
      apiname = 'AdminTask/getTmgProcessOpenTrxLivesnapshot?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    } else if (this.pageType == "tmgCallDashboard") {
      apiname = 'AdminTask/getCallSyncDefaults?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
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
          if (this.pageType !== "tmgProcess") {
            this.TaskSnapchatTop3 = _.uniqBy(this.TaskSnapchatTop3, 'name');
          }
        }
        console.log("TaskSnapchatTop3:",this.TaskSnapchatTop3);
        this.hideLoader(index);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getuncomplete(numindex) {
    this.uncomplete = [];
    let days = (['Tmg-worklog', 'tmgProcess'].includes(this.pageType)) ? 30 : 90;
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
    } else if (this.pageType == "tmgProcess") {
      apiname = 'AdminTask/getTmgProcessIncompleteActUserwise?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
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
          if (this.pageType !== "tmgProcess") {
            this.uncomplete = _.uniqBy(this.uncomplete, 'name');
          }
        }

        // this.hideLoader(index);
      }, err => {
        this.hideLoader(numindex);
        console.log('Err:', err);
      });
  }

  getHoldTask(index) {
    this.holdtask = [];
    let days = (['Tmg-worklog', 'tmgProcess'].includes(this.pageType)) ? 30 : 90;
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
    } else if (this.pageType == "tmgProcess") {
      apiname = 'AdminTask/getTmgProcessLongestPenState?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.holdtask.push(val);
              console.log('holdtask:' + index1 + "-", this.holdtask);
            }
          });
          console.log('holdtask:', this.holdtask);
          if (this.pageType !== "tmgProcess") {
            this.holdtask = _.uniqBy(this.holdtask, 'name');
          }
        }
        this.hideLoader(index);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getoverduetask(index) {
    this.overduetaskdata = [];
    this.showLoader(index);
    let days = (['Tmg-worklog', 'tmgProcess', 'tmgCallDashboard'].includes(this.pageType)) ? 30 : 90;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskUserwiseOverduelive';
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgWosrtThreeUserwisePh?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    } else if (this.pageType == "tmgProcess") {
      apiname = 'AdminTask/getTmgProcessUserwiseCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    } else if (this.pageType == "tmgCallDashboard") {
      apiname = 'AdminTask/getCallSyncDefaults?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    }
    this.api.get(apiname)
      .subscribe(res => {
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.overduetaskdata.push(val);
            }
          });
          console.log('overduetaskdata:', this.overduetaskdata);
          if (this.pageType !== "tmgProcess") {
            this.overduetaskdata = _.uniqBy(this.overduetaskdata, 'name');
          }
        }
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
    let apiname = 'AdminTask/getDashboardTaskUserwiseUnreadtat?startDate=' + params.fromdate + '&endDate=' + params.todate;
    // let apiname = 'AdminTask/getDashboardTaskMonthwiseUnreadTat?startDate=' + params.fromdate + '&endDate=' + params.todate;
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgActivitylogDefaulters?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    } else if (this.pageType == 'tmgProcess') {
      apiname = 'AdminTask/getTmgProcessLongestPenTransaction?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    }else if (this.pageType == 'tmgCallDashboard') {
      apiname = 'AdminTask/getMissedCallDefaults?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
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
        console.log('userwisereadavgtat:', this.userwisereadavgtat);
        if (this.pageType !== "tmgProcess") {
          this.userwisereadavgtat = _.uniqBy(this.userwisereadavgtat, 'name');
        }
        this.hideLoader(index);
        if (this.pageType == "Tmg-Task") {
          this.getsecondlabelValue();
        }
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getreadingtatgraphdata(index) {
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(index);
    let apiname = 'AdminTask/getDashboardTaskMonthwiseUnreadTat?startDate=' + params.fromdate + '&endDate=' + params.todate;
    this.api.get(apiname)
      .subscribe(res => {
        let readingTatGraphData = res['data'];
        if (readingTatGraphData) {
          readingTatGraphData.map((val, index1) => {
            if (index1 < 3) {
              this.readingTatGraphData.push(val);
            }
          });
        }
        console.log('readingTatGraphData:', this.readingTatGraphData);
        this.readingTatGraphData = _.uniqBy(this.readingTatGraphData, 'Month');
        this.hideLoader(index);
        if (this.pageType == "Tmg-Task") {
          this.handleChart();
        }
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getMissedCallNotRevertedData(index) {
    let days = 120;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(index);
    let apiname = 'AdminTask/getMissedCallMonthGraph?startDate=' + params.fromdate + '&endDate=' + params.todate+ '&deptId=' + this.deptId;
    this.api.get(apiname)
      .subscribe(res => {
        this.readingTatGraphData = res['data'];

        this.hideLoader(index);
        this.handleChart();
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getsecondlabelValue() {
    if (this.userwisereadavgtat) {
      this.handleChart();
    }
  }

  getlongestunreadhours(index) {
    this.longestunreadhoursdata = [];
    this.showLoader(index);
    let days = 30;
    if (this.pageType == 'tmgCallDashboard') {
      days = 7;
    }
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    let apiname = 'AdminTask/getDashboardTaskLongestUnreadhour';
    if (this.pageType == "Tmg-worklog") {
      apiname = 'AdminTask/getTmgUserwiseProductivity?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    } else if (this.pageType == "tmgProcess") {
      apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    }
    else if (this.pageType == "tmgCallDashboard") {
      apiname = 'AdminTask/getMissedCallDefaults?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;
    }
    this.api.get(apiname)
      .subscribe(res => {
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.longestunreadhoursdata.push(val);
            }
          });
          console.log('longestunreadhoursdata:', this.longestunreadhoursdata);
          if (this.pageType !== "tmgProcess") {
            this.longestunreadhoursdata = _.uniqBy(this.longestunreadhoursdata, 'name');
          }
        }
        this.hideLoader(index);
      }, err => {
        this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getlabelValue(dataList = null, type = 1, pageType) {
    if (dataList && dataList.length) {
      if (pageType == 'tmgCallDashboard') {
        this.challansMonthGraph.forEach((cmg) => {
          this.doubleChart.data.dataGraph1.push(cmg['count']);
          this.doubleChart.data.dataGraph2.push(cmg['call_duration']);
          this.xAxisData.push(cmg['Month']);
        });
        this.handleDoubleChart("bar", "Hours", "line", "Count");
      }
      else {
        this.handleChart1(dataList, type);
      }
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
    } else if (this.pageType == "tmgProcess") {
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


    // challansMonthGraph
    dataList.map(tlt => {
      xaxis.push(tlt['Month']);
      if (this.pageType == "tmgProcess") {
        if (type == 1) {
          yaxis.push(tlt['Completed']);
          zaxis.push(tlt['Added']);
        } else if (type == 2) {
          yaxis.push(tlt['hour']);
        } else if (type == 3) {
          yaxis.push(tlt['hour']);
        }
      } else if (this.pageType == "Tmg-worklog") {
        if (type == 1) {
          yaxis.push(tlt['Present']);
          zaxis.push((tlt['Activitylog']) ? tlt['Activitylog'] : 0);
          zaxis2.push((tlt['Worklog']) ? tlt['Worklog'] : 0);
        } else if (type == 2) {
          yaxis.push((tlt['Defaulter %']) ? tlt['Defaulter %'] : 0);
        } else if (type == 3) {
          yaxis.push((tlt['productivity']) ? tlt['productivity'] : 0);
        }
      }
      else if (this.pageType == "Tmg-worklog") {
        if (type == 1) {
          yaxis.push(tlt['count']);
          zaxis.push((tlt['call_duration']));
        } else if (type == 2) {
          yaxis.push(tlt['count']);
          zaxis.push((tlt['call_duration']));
        }
      }
      else {
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
    console.log("this.pageType ",this.pageType);
    let yaxis = [];
    let xaxis = [];
    let label = "Hour";
    if (this.pageType == "Tmg-worklog") {
      label = "Defaulter %";
    }
    else if(this.pageType == "tmgCallDashboard") {
      label = "call %";
    }
    console.log(this.userwisereadavgtat, this.readingTatGraphData)


    if (this.pageType == "Tmg-worklog") {
      this.userwisereadavgtat.map(tlt => {
        xaxis.push(tlt['Month']);
        yaxis.push(tlt['Defaulter %']);
      });
    } if (this.pageType == "tmgCallDashboard") {
      this.readingTatGraphData.map(tlt => {
        xaxis.push(tlt['Month']);
        yaxis.push(tlt['% Not reverted']);
      });
    }
    else {
      this.readingTatGraphData.map(tlt => {
        xaxis.push(tlt['Month']);
        yaxis.push(tlt['hour']);
      });
    }


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
          labelString: this.pageType == "tmgCallDashboard" ? 'Call %' :'Hour' + yaxisObj.yaxisLabel,
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
              labelString: this.pageType == "tmgCallDashboard" ? 'Call %' :'Hour' + yaxisObj.yaxisLabel,
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


  handleDoubleChart(chartType1, label1, chartType2, label2) {
    this.yaxisObj1 = this.common.chartScaleLabelAndGrid(this.doubleChart.data.dataGraph1);
    this.yaxisObj2 = this.common.chartScaleLabelAndGrid(this.doubleChart.data.dataGraph2);
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

    this.doubleChart = {
      data: {
        dataGraph1: [],
        dataGraph2: []
      },
      type: 'bar',
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
        labelString: leftSideLabel + this.yaxisObj1.yaxisLabel,
        fontSize: 16
      },
      ticks: { stepSize: this.yaxisObj1.gridSize }, //beginAtZero: true,min:0,
      suggestedMin: this.yaxisObj1.minValue,
      type: 'linear',
      display: true,
      position: 'left',
      id: 'y-axis-1',

    });
    options.scales.yAxes.push({
      scaleLabel: {
        display: true,
        labelString: rightSideLabel + this.yaxisObj2.yaxisLabel,
        fontSize: 16,
      },
      ticks: { stepSize: this.yaxisObj2.gridSize }, //beginAtZero: true,min:0,
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

  getdataList9(numindex) {
    this.dataList9 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(numindex);
    let apiname = 'AdminTask/getTmgProcessCompletionTat?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(numindex);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.dataList9.push(val);
            } else {
              return false;
            }
          });
          // this.dataList9 = _.uniqBy(this.dataList9, 'process');
          console.log('dataList9', this.dataList9);
        }
      }, err => {
        this.hideLoader(numindex);
        console.log('Err:', err);
      });
  }

  getdataList10(numindex) {
    this.dataList10 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(numindex);
    let apiname = 'AdminTask/getTmgProcessLongestAckPenTransaction?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(numindex);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.dataList10.push(val);
            } else {
              return false;
            }
          });
          console.log('dataList10', this.dataList10);
          // this.dataList10 = _.uniqBy(this.dataList10, 'trx');
        }
      }, err => {
        this.hideLoader(numindex);
        console.log('Err:', err);
      });
  }

  getdataList11(numindex) {
    this.dataList11 = [];
    let days = 30;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.showLoader(numindex);
    let apiname = 'AdminTask/getTmgProcessLongestPenAction?startDate=' + params.fromdate + '&endDate=' + params.todate + '&deptId=' + this.deptId;;
    this.api.get(apiname)
      .subscribe(res => {
        this.hideLoader(numindex);
        if (res['data']) {
          res['data'].map((val, index1) => {
            if (index1 < 3) {
              this.dataList11.push(val);
            } else {
              return false;
            }
          });
          console.log('dataList11', this.dataList11);
          // this.dataList11 = _.uniqBy(this.dataList11, 'action');
        }
      }, err => {
        this.hideLoader(numindex);
        console.log('Err:', err);
      });
  }
}
