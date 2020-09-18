import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, copyArrayItem } from '@angular/cdk/drag-drop';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { ChartService } from '../../Service/Chart/chart.service';
import * as _ from 'lodash';

@Component({
  selector: 'ngx-graphical-reports',
  templateUrl: './graphical-reports.component.html',
  styleUrls: ['./graphical-reports.component.scss']
})
export class GraphicalReportsComponent implements OnInit {
  reportFileName = '';
  active = 1;
  selectedChart = 'pie';
  processList = [];
  reportPreviewData = [];
  graphPieCharts = [];
  assign = {
    x:[],
    y:[],
    filter: [],
    chart: []
  }
  processId = '';
sideBarData = [
  {title:'Transaction Fields', children:[{title:'',children:'',isHide:false}]
  },
  {title:'Form Fields', children:[{title:'',children:'',isHide:false}]
  },
];
Operators =[];
filterObject = {};

chartTypes = [
  {
    id:1,
    type:'pie',
    url:"./assets/images/charts/piechart.jpg"
  },
  {
    id:2,
    type:'bar',
    url:"./assets/images/charts/barchart.png"
  },
  {
    id:3,
    type:'bubble',
    url:"./assets/images/charts/bubblechart.png"
  },
  {
    id:4,
    type:'line',
    url:"./assets/images/charts/linechart.png"
  }
]

  constructor(
    public common: CommonService,
    public api: ApiService,
    public chart: ChartService) {
      this.getProcessList();
     }

  ngOnInit() {
  }

  getProcessList() {
    this.common.loading++;
    this.api.get('Processes/getProcessList').subscribe(res => {
      this.common.loading--;
      if (!res['data']) return;
      this.processList = res['data'];

    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  getSideBarData(processId){
    this.processId = processId;
    if(!this.processId){
      this.common.showError('Select Process')
    }else{
    this.common.loading++;
    this.api.get(`Processes/getAllReportFieldsForNav?processId=${this.processId['_id']}`).subscribe(res => {
      this.common.loading--;
      if (!res['data']) return;
      this.resetSidebarData();
      let sideBarData = res['data'];
      sideBarData.map(ele=> {
        this.sideBarData.map(data=>{
          if(data.title == ele.reftype){
            data.children.push({title:ele.title,children:JSON.parse(ele.children),isHide:false})
          }
        })
      })
      console.log('Data:',this.sideBarData);

    }, err => {
      this.common.loading--;
      console.log(err);
    });}
  }

  resetSidebarData(){
    this.sideBarData = [
      {title:'Transaction Fields', children:[{title:'',children:'',isHide:false}]
      },
      {title:'Form Fields', children:[{title:'',children:'',isHide:false}]
      },
    ];
  }


  drop(event: CdkDragDrop<number[]>) {
    console.log("drop event:", event);
    if (event.previousContainer === event.container) {
      console.log("if1:", event.container.data);
      if (event.container.id == "menuList")
        return false;
    } else {
      console.log("if2:", event.previousContainer.data);
      
      let exists =0;
      let pushTo ='';
      if(event.container.id === "assignDataRow"){
        pushTo = 'x'
      }else if(event.container.id === "assignDataColumn"){
        pushTo = 'y'
      }else if(event.container.id === "filter"){
        this.openFilterModal(event.previousContainer.data[event.previousIndex]);
      }

      if(pushTo == 'x' || pushTo == 'y'){
      this.assign[pushTo].forEach(ele=> {
        if(ele.r_colid === event.previousContainer.data[event.previousIndex]['r_colid'] &&
        (ele.r_isdynamic === event.previousContainer.data[event.previousIndex]['r_isdynamic'] &&
        ele.r_ismasterfield === event.previousContainer.data[event.previousIndex]['r_ismasterfield'])){
            exists++;
        };
      })
      if(exists > 0) return; this.assign[pushTo].push(_.clone(event.previousContainer.data[event.previousIndex]));
      }
      
      console.log('stored:',this.assign)
    }
  }
  noReturnPredicate() {
    return false;
  }

  openFilterModal(data){
    this.filterObject = data;
    if(this.filterObject['r_coltype'] === "number"){
      this.Operators =[
        { id:0, name:'='},
        { id:1, name:'<'},
        { id:2, name:'>'},
        { id:5, name:'in'},
        { id:6, name:'not in'},
        { id:7, name:'<>'},
      ];
    }else if(this.filterObject['r_coltype'] === "text" && this.filterObject['r_coltype'] === "auto"){
      this.Operators =[
        { id:0, name:'='},
        { id:3, name:'ilike'},
        { id:4, name:'not ilike'},
        { id:5, name:'in'},
        { id:6, name:'not in'},
        { id:7, name:'<>'},
      ];
    }else if(this.filterObject['r_coltype'] === "boolean" && this.filterObject['r_coltype'] === "checkbox"){
      this.Operators =[
        { id:0, name:'='},
      ];
    }else if(this.filterObject['r_coltype'] === "timestamp"){
      this.Operators =[
        { id:0, name:'='},
        { id:1, name:'<'},
        { id:2, name:'>'},
        { id:5, name:'in'},
        { id:6, name:'not in'},
        { id:7, name:'<>'},
      ];
    }else{
      this.Operators =[
        { id:0, name:'='},
        { id:1, name:'<'},
        { id:2, name:'>'},
        { id:3, name:'ilike'},
        { id:4, name:'not ilike'},
        { id:5, name:'in'},
        { id:6, name:'not in'},
        { id:7, name:'<>'},
      ];
    }
    this.filterObject['filterdata'] = [{r_threshold:[{r_value:''}],r_operators:''}];
    console.log('filter modal data',data)
    document.getElementById('filterModal').style.display = 'block';
  }

  addFilter(){
      this.filterObject['filterdata'].push({r_threshold:[{r_value:''}],r_operators:''});
  }

  deletFilter(index){
    this.filterObject['filterdata'].splice(index,1)
  }

  storeFilter(){
    let exists = 0;
    this.assign.filter.forEach(ele=> {
      if(ele.r_colid === this.filterObject['r_colid'] &&
      (ele.r_isdynamic === this.filterObject['r_isdynamic'] &&
      ele.r_ismasterfield === this.filterObject['r_ismasterfield'])){
          exists++;
      };
    })

    if(exists > 0) return; this.assign.filter.push(_.clone(this.filterObject));
    this.closeSearchTaskModal()
    console.log('data after filter add:',this.assign)
  }

  closeSearchTaskModal(){
    document.getElementById('filterModal').style.display = 'none';
  }

  removeField(index,axis){
    this.assign[axis].splice(index,1)
    console.log('deleted:',index,'from:',this.assign)
  }
  addMeasure(index,axis,measure){
        console.log('index:',index,'axis:',axis,'measure:',measure);
        this.assign[axis][index].measure=measure;
        console.log('measure inserted:',this.assign)
  }

  openSaveModal(){
      if(this.assign.x.length > 0 && this.assign.y.length > 0){
      document.getElementById('saveAs').style.display = 'block'
      }else{
        this.common.showError('please fill Mandatory fileds first')
      }
  }
  closeSaveModal(){
    document.getElementById('saveAs').style.display = 'none'
  }
  saveGraphicReport(){
    this.assign.y.forEach(ele=> {
      if(!ele.measure){
        ele.measure = 'Count';
      }
    })

    let info = {x:this.assign.x,y:this.assign.y};
    let params = {
    processId:this.processId['_id'],
    reportFilter:JSON.stringify(this.assign.filter),
    info:JSON.stringify(info),
    name: this.reportFileName,
    reportId:null,
    isActive:true,
    requestId:null
  };

  if(params.name){
    this.common.loading++;
    this.api.post('Processes/saveGraphicalReport',params).subscribe(res=>{
      this.common.loading--;
        if(res['code'] == 1){
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.reportPreviewData = res['data'];
            // this.getChartofType(this.selectedChart);
            this.closeSaveModal();
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        
      }else{
        this.common.loading--;
        this.common.showError(res['msg']);
      }
    },err=>{
      this.common.loading--;
      console.log('Error:',err)
    })
  }else{
      this.common.showError('Please enter File Name')
    }
  }

  getReportPreview(){
    this.assign.y.forEach(ele=> {
      if(!ele.measure){
        ele.measure = 'Count';
      }
    })
    // console.log('data to send',this.assign.data)
    // return;
    let info = {x:this.assign.x,y:this.assign.y};
      let params = {
      processId:this.processId['_id'],
      reportFilter:JSON.stringify(this.assign.filter),
      info:JSON.stringify(info),
    };

    if(this.assign.x.length && this.assign.y.length){
      this.common.loading++;
      this.api.post('Processes/getPreviewGraphicalReport',params).subscribe(res=>{
          this.common.loading--;
          console.log('Response:',res);
          this.reportPreviewData = res['data'];
          console.log('chart data',this.reportPreviewData)
          // this.showChart(this.reportPreviewData,'pie');
          this.getChartofType(this.selectedChart);
      },err=>{
        this.common.loading--;
        console.log('Error:',err)
      })
    }else{
        this.common.showError('please fill Mandatory fileds first')
      }
  }

  getChartofType(chartType){
    if(this.reportPreviewData.length>0){
      this.showChart(this.reportPreviewData,chartType);
    }else{
      return;
    }
  }

  showChart(stateTableData,chartType) {
    this.graphPieCharts.forEach(ele => ele.destroy());
    console.log('data to send to chart module:',stateTableData);
    stateTableData.map((key,e) => 
            {
              console.log('key:',key , 'element:',e)
            }
    );

    // const labels = stateTableData.map((e) => JSON.parse(e['xAxis']));
    // const data = stateTableData.map((e) => e['series']);

    let labels =[];
    let dataSet = [];
    let chartDataSet = [];
    
    if(stateTableData.length == 1){
    stateTableData.map(e=>{
      labels =[];
      e.series.data.map(label=>{
        labels.push(label.name)
      })
    });
    
    stateTableData.map(e=> {
      dataSet.push({label:e.series.y_name,data:[],bgColor:[]});
        dataSet.map(sub=>{
          if(sub.label === e.series.y_name){
            e.series.data.map(data => {
              sub.data.push(data.y)
            })
          }
        })
    });
    }
    else{
      stateTableData.map(e=>{
        labels =[];
        e.series.data.map(label=>{
          labels.push(label.name)
        })
      });
      
      stateTableData.map((e,index)=> {
        dataSet.push({label:e.series.y_name,data:[],bgColor:['#1F618D', '#1E8449', '#A04000', '#B03A2E', '#922B21',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF']});
          dataSet.map(sub=>{
            if(sub.label === e.series.y_name){
              e.series.data.map(data => {
                sub.data.push({x:data.x,y:data.y,r:index*3})
              })
            }
          })
      });

      console.log('DataSet from graphics',dataSet)
    }

    // start:managed service data
    if(chartType === 'line'){
      dataSet.map((data,index)=>{
        chartDataSet.push({
            label: data.label,
            data: data.data,
            borderWidth: 1,
            lineTension:0,
            borderColor:data.bgColor[index] ? data.bgColor[index] : '#1AB399',
            fill: false
          })
      });
    }else{
        dataSet.map((data,index)=>{
          chartDataSet.push({
              label: data.label,
              data: data.data,
              backgroundColor: data.bgColor[index] ? data.bgColor[index] : ['#1F618D', '#1E8449', '#A04000', '#B03A2E', '#922B21',
              '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
              '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF',
                '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
                '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
                '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'],
              borderWidth: 1
            })
        });}
        // end:managed service data
    
    
    let chartData:any; 
    if(chartType === 'pie'){
    chartData = {
      canvas: document.getElementById('Graph'),
      data: chartDataSet,
      labels: labels,
      showLegend: true
    };
    }else{
      chartData = {
        canvas: document.getElementById('Graph'),
        data: chartDataSet,
        labels: labels,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 1
            }
          }]
        },
        showLegend: true
      };
    }
    this.graphPieCharts = this.chart.generateChart([chartData],chartType);

  }

  onHideShow(head,index){
    this.sideBarData.forEach(element => {
      let i=0;
      if(element.children && element.children.length){
        element.children.forEach(element2 => {
          if(element2.isHide && index !=i){
            element2.isHide = false;
          }
          i++;
        });
      }
    });
    console.log("head:",head);
    setTimeout(() => {
      head.isHide = !head.isHide;
    }, 10);
  }
}
