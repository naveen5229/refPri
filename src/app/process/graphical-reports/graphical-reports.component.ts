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
  processList = [];
  reportPreviewData = [];
  graphPieCharts = [];
  assign = {
    data: {x:[],y:[]},
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
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log("if2:", event.previousContainer.data);
      
      let exists =0;
      let pushTo ='';
      if(event.container.id === "assignDataRow"){
        pushTo = 'x'
      }else if(event.container.id === "assignDataColumn"){
        pushTo = 'y'
      }
      this.assign.data[pushTo].forEach(ele=> {
        if(ele.r_colid === event.previousContainer.data[event.previousIndex]['r_colid'] &&
        (ele.r_isdynamic === event.previousContainer.data[event.previousIndex]['r_isdynamic'] &&
        ele.r_ismasterfield === event.previousContainer.data[event.previousIndex]['r_ismasterfield'])){
            exists++;
        };
      })
      if(exists > 0) return; this.assign.data[pushTo].push(event.previousContainer.data[event.previousIndex]);
      
      
      console.log('stored:',this.assign.data)
      // transferArrayItem(event.previousContainer.data,event.container.data,event.previousIndex,event.currentIndex);
    }
  }

  /* Predicate function that only allows even numbers to be dropped into a list. /
  evenPredicate(item: CdkDrag<number>) {
    return true;
  }

  /* Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate() {
    return false;
  }

  removeField(index,axis){
    this.assign.data[axis].splice(index,1)
    console.log('deleted:',index,'from:',this.assign.data)
  }
  addMeasure(index,axis,measure){
        console.log('index:',index,'axis:',axis,'measure:',measure);
        this.assign.data[axis][index].measure=measure;
        console.log('measure inserted:',this.assign.data)
  }

  getReportPreview(){
    this.assign.data.x.map(ele=> {
      if(!ele.measure){
        ele.measure = null;
      }
    });
    this.assign.data.y.map(ele=> {
      if(!ele.measure){
        ele.measure = null;
      }
    })
      let params = {
      processId:this.processId['_id'],
      reportFilter:null,
      info:JSON.stringify(this.assign.data)
    };
      this.common.loading++;
      this.api.post('Processes/getPreviewGraphicalReport',params).subscribe(res=>{
          this.common.loading--;
          console.log('Response:',res);
          this.reportPreviewData = res['data'];
          this.showdata(this.reportPreviewData);
      },err=>{
        this.common.loading--;
        console.log('Error:',err)
      })
  }

  showdata(stateTableData) {
    this.graphPieCharts.forEach(ele => ele.destroy());
    console.log('data to send to chart module:',stateTableData);
    stateTableData.map((key,e) => 
            {
              console.log('key:',key , 'element:',e)
            }
    );
    const labels = stateTableData.map((e) => e['Mobile No']);
    const data = stateTableData.map((e) => e['count']);

    let chartData2 = {
      canvas: document.getElementById('myChart1'),
      data: data,
      labels: labels,
      showLegend: true
    }
    this.graphPieCharts = this.chart.generatePieChartforCall([chartData2]);

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
