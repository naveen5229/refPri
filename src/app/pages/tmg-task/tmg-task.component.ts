import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';

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
  yaxisObj2=null;
  userwisereadavgtat=[];
  userwisereadavgtatfulldata=[];
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

  constructor(public api: ApiService,
    public common: CommonService,
    private modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnDestroy(){}
ngOnInit() {
  }
  ngAfterViewInit() {
    this.refresh();
  }


  refresh() {
    this.xAxisData = [];
    this.getChallansMonthGraph(0);
    this.getuserwisereadtat(1);
     this.getTaskSnapchat(2);
     this.getuncomplete(3);
     this.getHoldTask(4);
     this.getoverduetask(5);
     this.getlongestunreadhours(6);
     
  }

  getChallansMonthGraph(index) {
    this.challansMonthGraph = [];
     this.showLoader(index);
     let days = 120;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
    this.api.get('AdminTask/getDashboardTaskMonthgraph?startDate='+params.fromdate+'&endDate='+params.todate)
      .subscribe(res => {
        console.log('challansMonthGraph:', res);
        this.challansMonthGraph = res['data'];
        this.hideLoader(index);
        this.getlabelValue();
        
      }, err => {
         this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getTaskSnapchat(index) {
    this.TaskSnapchat = [];
     this.showLoader(index);
    let params = { totalrecord: 3 };
    this.api.get('AdminTask/getDashboardTaskSnapshot')
      .subscribe(res => {
        this.TaskSnapchat = res['data'][0];
        console.log('challansMostAged:',res['data']);

        this.hideLoader(index);
      }, err => {
         this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getuncomplete(numindex) {
    this.uncomplete = [];
    let days = 90;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
     this.showLoader(numindex);
    this.api.get('AdminTask/getDashboardTaskUserwiseUncomplete?startDate='+params.fromdate+'&endDate='+params.todate)
      .subscribe(res => {
        console.log('uncomplete:',numindex, res['data']);
        this.hideLoader(numindex);
        res['data'].map((val,index1)=>{
          if(index1 < 3){
          this.uncomplete.push(val);
          }else{
            return false;
          }
          console.log('index1',index1);
        });
        
       // this.hideLoader(index);
      }, err => {
         this.hideLoader(numindex);
        console.log('Err:', err);
      });
  }

  getHoldTask(index) {
    this.holdtask = [];
    let days = 90;
    let startDate = new Date(new Date().setDate(new Date().getDate() - days));
    let endDate = new Date();
    let params = {
      fromdate: this.common.dateFormatter1(startDate),
      todate: this.common.dateFormatter1(endDate)
    };
   
     this.showLoader(index);
    this.api.get('AdminTask/getDashboardTaskUserwisehold?startDate='+params.fromdate+'&endDate='+params.todate)
      .subscribe(res => {
       
        res['data'].map((val,index1)=>{
          if(index1 < 3){
          this.holdtask.push(val);
          }
          

        });
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
    this.api.get('AdminTask/getDashboardTaskUserwiseOverduelive')
      .subscribe(res => {
        res['data'].map((val,index1)=>{
          if(index1 < 3){
          this.overduetaskdata.push(val);
          }
        });
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
    this.api.get('AdminTask/getDashboardTaskUserwiseUnreadtat?startDate='+params.fromdate+'&endDate='+params.todate)
      .subscribe(res => {
        this.userwisereadavgtatfulldata= res['data'];
        res['data'].map((val,index1)=>{
          if(index1 < 3){
          this.userwisereadavgtat.push(val);
          }
          
        });
        this.hideLoader(index);
          this.getsecondlabelValue();
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
   
    this.api.get('AdminTask/getDashboardTaskLongestUnreadhour')
      .subscribe(res => {
       

        res['data'].map((val,index1)=>{
          if(index1 < 3){
          this.longestunreadhoursdata.push(val);
          }
         

        });
        console.log('holdtask:', this.longestunreadhoursdata);

        this.hideLoader(index);
      }, err => {
         this.hideLoader(index);
        console.log('Err:', err);
      });
  }

  getlabelValue() {
    if (this.challansMonthGraph) {
      // this.challansMonthGraph.forEach((cmg) => {
      //   this.chart.data.line.push(cmg['Month']);
      //   this.chart.data.bar.push(cmg['Completed']);
      //   this.xAxisData.push(cmg['Added']);
      // });

      this.handleChart1();
    }
  }
  handleChart1() {
    let yaxis = [];
    let xaxis = [];
    let zaxis = [];
    this.challansMonthGraph.map(tlt => {
      xaxis.push(tlt['Month']);
      yaxis.push(tlt['Completed']);
      zaxis.push(tlt['Added']);
    });


    console.log('trip loading time : ', this.challansMonthGraph);
    console.log('y axis data:', yaxis);

    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    let zaxisObj = this.common.chartScaleLabelAndGrid(zaxis);
    console.log("handleChart1", xaxis, yaxis);
    this.chart1.type = 'line'
    this.chart1.data = {
      labels: xaxis,
      datasets: [
        {
          //label: 'Time (in Hrs.)',
          data: yaxisObj.scaleData,
          borderColor: '#3d6fc9',
          backgroundColor: '#3d6fc9',
          fill: false,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#FFEB3B',
        },
        {
         // label: 'Time (in Hrs.)',
          data: zaxisObj.scaleData,
          borderColor: '#FFA500',
          backgroundColor: '#FFA500',
          fill: false,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#FFA500',
        },
      ]
    },
      this.chart1.options = {
        responsive: true,
        legend: {
          position: 'bottom',
          display: false
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
              labelString: 'Time (in Hrs.)' + yaxisObj.yaxisLabel
            },
            ticks: { stepSize: yaxisObj.gridSize },//beginAtZero: true,min:0,
            suggestedMin: yaxisObj.minValue,
          }
          ],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Completed (yello line)  ' + 'Added (Blue line)' 
              
            },
            ticks: { stepSize: yaxisObj.gridSize },//beginAtZero: true,min:0,
            suggestedMin: yaxisObj.minValue,
          }
          ]
        },
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
  
                return tooltipItems.xLabel + " ( " +  Math.floor(x * 100) + " )";
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

  }
  handleChart() {
    let yaxis = [];
    let xaxis = [];
    this.userwisereadavgtat.map(tlt => {
      xaxis.push(tlt['name']);
      yaxis.push(tlt['hour']);
    });
    let yaxisObj = this.common.chartScaleLabelAndGrid(yaxis);
    console.log("handleChart", xaxis, yaxis);
    this.chart.type = 'bar'
    this.chart.data = {
      labels: xaxis,
      datasets: [
        {
          label: 'Hour',
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
            ticks: { stepSize: yaxisObj.gridSize },//beginAtZero: true,min:0, 
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

    console.log('this.yaxisObj1.minValue',this.yaxisObj1.minValue);
    console.log('this.yaxisObj2.minValue',this.yaxisObj2.minValue);

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
           ticks: { stepSize: (this.yaxisObj2.gridSize) ,  beginAtZero: true}, //beginAtZero: true,min:0,
          suggestedMin : this.yaxisObj2.minValue,
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

  getDetials(url, params, value = 0,type='days') {
    let dataparams = {
      view: {
        api: url,
        param: params,
        type: 'post'
      },
  
      title: 'Details'
    }
    if (value) {
      let startDate = type == 'months'? new Date(new Date().setMonth(new Date().getMonth() - value)): new Date(new Date().setDate(new Date().getDate() - value));
      let endDate = new Date();
      dataparams.view.param['startDate'] = this.common.dateFormatter(startDate);
      dataparams.view.param['endDate'] = this.common.dateFormatter(endDate);
    }
    console.log("dataparams=", dataparams);
    this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  showLoader(index) {
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