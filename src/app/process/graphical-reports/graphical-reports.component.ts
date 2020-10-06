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
  savedReportSelect = {};
  reportIdUpdate = null;
  editState = false;
  graphBodyVisi = true;
  addFilterDropData = false;
  btnName = 'Filter Raw Data'
  checked:Boolean;
  active = 1;
  selectedChart = 'pie';
  processList = [];
  reportPreviewData = [];
  graphPieCharts = [];
  savedReports = [];
  // measure = ['Date','Count','Average','Sum','distinct count']
  assign = {
    x:[],
    y:[],
    filter: [],
    reportFileName:'',
    // chart: []
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
tableGraph = {
  data: {
    headings: {},
    columns: []
  },
  label:[],
  settings: {
    hideHeader: true
  }
}

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
  },
  {
    id:5,
    type:'table',
    url:"./assets/images/charts/table.webp"
  }
]

dropdownFilter = [];

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
    this.resetAssignForm();
    this.processId = processId;
    if(!this.processId){
      this.common.showError('Select Process')
    }else{
    this.getSideBarList();
    this.getSavedReportList();
  }
  }

  getSideBarList(){
    this.common.loading++;
    this.api.get(`Processes/getAllReportFieldsForNav?processId=${this.processId['_id']}`).subscribe(res => {
      this.common.loading--;
      if (!res['data']) return;
      this.resetSidebarData();
      this.resetAssignForm();
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
    });
  }

  getSavedReportList(){
    this.common.loading++;
    this.api.get(`Processes/getGraphicalReportListByProcess?processId=${this.processId['_id']}`).subscribe(res => {
      this.common.loading--;
      this.savedReports = [];
      if(res['code'] == 1){
      // if (!res['data']) return;
      this.savedReports = res['data']?res['data']:[];
      }else{
        this.common.showError(res['msg']);
      }
      console.log('savedData:',this.savedReports);

    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  resetSidebarData(){
    this.sideBarData = [
      {title:'Transaction Fields', children:[{title:'',children:'',isHide:false}]
      },
      {title:'Form Fields', children:[{title:'',children:'',isHide:false}]
      },
    ];
  }


  openPreviewModal(){
    let objectLength = Object.keys(this.savedReportSelect).length
  
    console.log(this.savedReportSelect,'preview data')
    if(objectLength >0){
    this.reportIdUpdate = this.savedReportSelect['_id'];
    this.assign.reportFileName = this.savedReportSelect['name'];
    this.graphBodyVisi = false;
    console.log('this.savedReportSelect:',this.savedReportSelect);
    this.assign.x = this.savedReportSelect['x'];
    this.assign.y = this.savedReportSelect['y'];
    this.assign.filter = this.savedReportSelect['report_filter'];
    this.getReportPreview();
  }else{
    this.reportIdUpdate = null;
    this.assign.reportFileName = ''
    this.graphBodyVisi = true;
    this.common.showError('Please Select Report')
  }
    // document.getElementById('graphPreview').style.display = 'block';

  }

  editGraph(){
    this.editState =true;
    this.graphBodyVisi = true;
    this.getReportPreview();
  }
  resetAssignForm(){
    this.assign = {
      x:[],
      y:[],
      filter: [],
      reportFileName:'',
    }
    this.tableGraph = {
      data: {
        headings: {},
        columns: []
      },
      label:[],
      settings: {
        hideHeader: true
      }
    }
    this.reportIdUpdate =null;
    this.reportPreviewData = [];
    this.graphPieCharts.forEach(ele => ele.destroy());
      document.getElementById('table').style.display ='none';
    // this.getReportPreview();
  }

  // closePreviewModal(){
  //   document.getElementById('graphPreview').style.display = 'none';
  // }

  // editPreviewReport(){
    
  // }


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
        // this.setMeasure(event.previousContainer.data[event.previousIndex])
        pushTo = 'y'
      }else if(event.container.id === "filter"){
        this.openFilterModal(event.previousContainer.data[event.previousIndex],null);
      }

      if(pushTo == 'x'){
      this.assign[pushTo].forEach(ele=> {
        if(ele.r_colid === event.previousContainer.data[event.previousIndex]['r_colid'] &&
        (ele.r_isdynamic === event.previousContainer.data[event.previousIndex]['r_isdynamic'] &&
        ele.r_ismasterfield === event.previousContainer.data[event.previousIndex]['r_ismasterfield'])){
            exists++;
        };
      })
      if(exists > 0) return; this.assign[pushTo].push(_.clone(event.previousContainer.data[event.previousIndex]));
      }else if(pushTo == 'y'){
        this.assign[pushTo].push(_.clone(event.previousContainer.data[event.previousIndex]));
      }
      
      console.log('stored:',this.assign)
    }
  }
  noReturnPredicate() {
    return false;
  }

  // setMeasure(data){
  //   let measureObject = _.clone(data);
  //   if(measureObject['r_coltype'] == "number"){
  //     this.measure =['distinct count','count','average','sum'];
  //     }else if(measureObject['r_coltype'] == "text" && measureObject['r_coltype'] == "auto"){
  //     this.measure =['distinct count','count'];
  //     }else if(measureObject['r_coltype'] == "boolean" && measureObject['r_coltype'] == "checkbox"){
  //     this.measure =['distinct count','count'];
  //     }else if(measureObject['r_coltype'] == "timestamp"){
  //     this.measure =['distinct count','count','Date'];
  //     }else{
  //     this.measure =['distinct count','count'];
  //     }
  // }

  openFilterModal(data,type){
    document.getElementById('rowFilter').style.display = 'none';
    document.getElementById('basicFilter').style.display = 'block';
    this.filterObject = _.clone(data);
    let params = {
      processId:this.processId['_id'],
      info:JSON.stringify(this.filterObject),
    }

    let checkCount = 0;
    this.dropdownFilter.map(ele=>{
      if(ele.status){
        checkCount++;
      }
    })
    if(checkCount == this.dropdownFilter.length){
      this.checked =true;
    }else{
      this.checked= false
    }

    this.common.loading++;
    this.api.post('Processes/getFilterList',params).subscribe(res=>{
      this.common.loading--;
      if(res['code'] == 1){
        this.dropdownFilter = res['data'];
        this.assignFilteredValue();
      }else{
        this.common.showError(res['msg'])
      }
      console.log(res['data'])
    },err=>{
      this.common.loading--;
      console.log('Error:',err)
    })
    
    if(this.filterObject['r_coltype'] === "number"){
      this.Operators =[
        { id:0, name:'='},
        { id:1, name:'<'},
        { id:2, name:'>'},
        { id:7, name:'<>'},
      ];
    }else if(this.filterObject['r_coltype'] === "text" && this.filterObject['r_coltype'] === "auto"){
      this.Operators =[
        { id:0, name:'='},
        { id:3, name:'ilike'},
        { id:4, name:'not ilike'},
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
        { id:7, name:'<>'},
      ];
    }else{
      this.Operators =[
        { id:0, name:'='},
        { id:1, name:'<'},
        { id:2, name:'>'},
        { id:3, name:'ilike'},
        { id:4, name:'not ilike'},
        { id:7, name:'<>'},
      ];
    }
    console.log('filter modal data test first',this.filterObject)
    if(!type){
      this.filterObject['filterdata'] = [];
      this.addFilterDropData = true;
    }
    // this.filterObject['filterdata'] = [{r_threshold:[{r_value:''}],r_operators:''}];
    console.log('filter modal data',data)
    this.btnName = 'Filter Raw Data'
    document.getElementById('filterModal').style.display = 'block';
  }

  assignFilteredValue(){
    if(this.filterObject['filterdata'] && this.filterObject['filterdata'].length){

    console.log(this.filterObject['filterdata'][0].r_operators)

    // this.filterObject['filterdata'].map(data=>{
    //   if(data.r_operators === 5 || data.r_operators ===6){

    //     this.btnName ='Filter Raw Data'
    //     document.getElementById('rowFilter').style.display = 'none';
    //     document.getElementById('basicFilter').style.display = 'block';
        
    //       console.log('datafiltered',this.filterObject['filterdata'])
    //       this.filterObject['filterdata'][0].r_threshold[0]['r_value'].forEach((data)=> {
    //         console.log('data edit filter',data)
    //         this.dropdownFilter.forEach(ele=>{
    //           if(ele.value === data.value){
    //             // console.log(ele)
    //             ele.status = data.status;
    //             console.log('data edit filter 1',data);
    //           }
    //         })
    //       })
    //     }else{
    //       this.btnName ='Cancel'
    //       document.getElementById('rowFilter').style.display = 'block';
    //       document.getElementById('basicFilter').style.display = 'none';
    //       return this.filterObject['filterdata'];
    //     }
    // })

    if(this.filterObject['filterdata'][0].r_operators === 5 ||
    this.filterObject['filterdata'][0].r_operators === 6){
      this.filterObject['filterdata'].map(data=>{
        if(data.r_operators === 5 || data.r_operators ===6){
  
          this.btnName ='Filter Raw Data'
          document.getElementById('rowFilter').style.display = 'none';
          document.getElementById('basicFilter').style.display = 'block';
          
            console.log('datafiltered',this.filterObject['filterdata'])
            this.filterObject['filterdata'][0].r_threshold[0]['r_value'].forEach((data)=> {
              console.log('data edit filter',data)
              this.dropdownFilter.forEach(ele=>{
                if(ele.value === data.value){
                  // console.log(ele)
                  ele.status = data.status;
                  console.log('data edit filter 1',data);
                }
              })
            })
          }
      });
    }else{
      this.btnName ='Cancel'
      document.getElementById('rowFilter').style.display = 'block';
      document.getElementById('basicFilter').style.display = 'none';
      return this.filterObject['filterdata'];
    }
    }
    this.filterObject['filterdata'] = [];
    this.manageCheckUncheckAll();
  }

  addFilter(){
      // if(this.filterObject['filterdata'].length>0){
      if(this.filterObject['filterdata'][this.filterObject['filterdata'].length-1].r_threshold[0].r_value[0].value &&
      this.filterObject['filterdata'][this.filterObject['filterdata'].length-1].r_operators)
      {
      this.filterObject['filterdata'].push({r_threshold:[{r_value:[{value:''}]}],r_operators:''});
      }else{
        this.common.showError('Insert values')
      } 
    // }
  }

  deletFilter(index){
    if(index === 0){
      return;
    }else{
    this.filterObject['filterdata'].splice(index,1)
    }
  }

  checkUncheckAll(event){
    const checked = event.target.checked;
      this.dropdownFilter.forEach(ele=>{
        ele.status = checked;
      })
  }

  manageCheckUncheckAll(){
    let count = 0;
    this.dropdownFilter.map(ele=>{
        if(ele.status){
          count++;
        }
    });
    if(count < this.dropdownFilter.length){
      this.checked = false;
    }else if(count == this.dropdownFilter.length){
      this.checked = true;
    }
  }

  rowFilter(btn){
    if(btn === 'Filter Raw Data'){
      this.addFilterDropData = false;
      document.getElementById('rowFilter').style.display = 'block';
      document.getElementById('basicFilter').style.display = 'none';
      this.filterObject['filterdata'] = [{r_threshold:[{r_value:[{value:''}]}],r_operators:''}];
      this.btnName = 'Cancel'
    }
    else if(btn === 'Cancel'){
      this.addFilterDropData = true;
      document.getElementById('rowFilter').style.display = 'none';
      document.getElementById('basicFilter').style.display = 'block';
      this.filterObject['filterdata'] = [];
      this.btnName ='Filter Raw Data'
    }
  }

  storeFilter(){
    let filterObject = _.clone(this.filterObject)
    let inEle = [];
    let notInEle = [];

    console.log('edit time filter object',this.filterObject)
    
    if(this.addFilterDropData){
      console.log('edit time',this.dropdownFilter)
      inEle = this.dropdownFilter.filter(ele=> ele.status)
    notInEle =this.dropdownFilter.filter(ele=> !ele.status)

    console.log('in',inEle,'notin:',notInEle)
    // if(inEle.length > notInEle.length){
      filterObject['filterdata'].push({r_threshold:[{r_value:notInEle.length>0 ? notInEle : [{value:''}]}],r_operators:6});
    // }else{
      filterObject['filterdata'].push({r_threshold:[{r_value:inEle.length>0 ? inEle : [{value:''}]}],r_operators:5});
    // }
    }
    let exists = 0;
    let index = null;
    this.assign.filter.forEach((ele,ind)=> {
      if(ele.r_colid === this.filterObject['r_colid'] &&
      (ele.r_isdynamic === this.filterObject['r_isdynamic'] &&
      ele.r_ismasterfield === this.filterObject['r_ismasterfield'])){
          exists++;
          index = ind;
      };
    })
    // console.log('check 3:',this.filterObject['filterdata'])
    if(exists > 0) {
      this.assign.filter.splice(index,1,filterObject);
    }else{
      this.assign.filter.push(filterObject);
    }

    // multiple insert:start
    // if(!this.filterType){
    //   this.assign.filter.push(filterObject);
    // }else{
    //   let index = parseInt(this.filterType.charAt(4));
    //   console.log('index',index)
    //   this.assign.filter.splice(index,1,filterObject);
    // }
    // console.log('check 4:',this.filterObject['filterdata'])
    // multiple insert:end
    this.closeFilterModal()
    console.log('data after filter add:',this.assign)
  }

  closeFilterModal(){
    document.getElementById('filterModal').style.display = 'none';
  }

  removeField(index,axis){
    this.assign[axis].splice(index,1)
    console.log('deleted:',index,'from:',this.assign)
  }

  editFilter(index){
    console.log('edit data:',this.assign.filter[index]);
    this.openFilterModal(this.assign.filter[index],'edit');
  }

  addMeasure(index,axis,measure){
        console.log('index:',index,'axis:',axis,'measure:',measure);
        if(measure === 'None'){
          this.assign[axis][index].measure=null;  
        }else{
        this.assign[axis][index].measure=measure;
      }
        console.log('measure inserted:',this.assign)

  }

  openSaveModal(){
      if(this.assign.x.length > 0 && this.assign.y.length > 0){
      document.getElementById('saveAs').style.display = 'block'
      if(!this.editState){
        this.assign.reportFileName = ''
      }
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
    let reqID = null;
    if(!this.editState){
      reqID = null;
    }else{
      reqID = this.reportIdUpdate;
    }

    let info = {x:this.assign.x,y:this.assign.y};
    let params = {
    processId:this.processId['_id'],
    reportFilter:this.assign.filter? JSON.stringify(this.assign.filter) : JSON.stringify([]),
    info:JSON.stringify(info),
    name: this.assign.reportFileName,
    reportId:null,
    isActive:true,
    requestId:reqID
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
    });
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
          if(res['code'] == 1){
            console.log('Response:',res);
            if(res['data']){
            this.reportPreviewData = res['data'];
            if(this.reportPreviewData.length>1){
              this.active = 2;
              this.selectedChart = 'bar';
            }else{
              this.active = 1;
              this.selectedChart = 'pie';}
            console.log('chart data',this.reportPreviewData)
            // this.showChart(this.reportPreviewData,'pie');
            this.getChartofType(this.selectedChart);
          }else{
            // this.resetAssignForm();
            this.common.showError('No Data to Display');
            this.graphPieCharts.forEach(ele => ele.destroy());
          }
          }else{
            this.common.showError(res['msg'])
          }
      },err=>{
        this.common.loading--;
        console.log('Error:',err)
      })
    }else{
        this.common.showError('please fill Mandatory fileds first');
        this.graphPieCharts.forEach(ele => ele.destroy());
        this.resetAssignForm();

      }
  }

  getChartofType(chartType){
    // if(this.reportPreviewData.length>0){
      if(chartType === 'table'){
        document.getElementById('table').style.display ='block';
        document.getElementById('graph').style.display ='none';
        this.getTable();
      }else{
        document.getElementById('table').style.display ='none';
        document.getElementById('graph').style.display ='block';
        this.showChart(this.reportPreviewData,chartType);
    }
    // }else{
    //   return;
    // }
  }

  getTable(){
    this.tableGraph.data = {
      headings:this.setHeaders(),
      columns: this.setColumns() 
    };
    return true;;
  }
  setHeaders(){
    let headers = [];
    this.reportPreviewData.map(ele=> {headers.push(ele.series['y_name'])});
    let head = headers;
    let headings = {};
    headings['Label'] = { title: 'Label',placeholder: 'Label'}
      for(let key in head){
        headings[head[key]] = { title: head[key],placeholder: head[key]}
      };
      return headings;
  }

  setColumns(){
    let columns = [];
    let labels = [];
    this.reportPreviewData[0].series.data.map(label=> {
      labels.push(_.clone(label.name))
    });
    
    console.log('preview of report',this.reportPreviewData);

    for(let key in this.setHeaders()){
    this.reportPreviewData.map((ele,index)=>{
      let column = {};
        console.log('key is',key,ele.y_name)
                if(key === ele.series.y_name)
                {
                  ele.series.data.map((data,subindex) => {
                          if(index == 0){
                            console.log('data in loop',data)
                            column[key] = { value: data['y']};
                            columns.push(_.clone(column));
                          }else{
                            columns[subindex][key] = _.clone({value: data['y']})
                          } 
                    })
                }
                // else if(key == 'Label'){
                //   ele.series.data.map(data => {
                //     column['Label'] = { value: this.common.formatTitle(data['name']), class: 'black font-weight-bold'};
                // })
                // }
              })
              console.log(labels,'labels for table')
    }
    labels.map((val,indexLabel)=>{
      columns[indexLabel]['Label'] = { value: val, class: 'black font-weight-bold'};
    })
    // this.reportPreviewData.map(ele=> {
    //   this.tableGraph.label.push(ele.series['y_name'])
    //   let column = {};
    //   console.log(ele)
    //   ele.series.data.map(data => {
    //       for(let key in this.setHeaders()){
    //         if(key === data.name)
    //         {
    //           column[key] = { value: data['y']};
    //         }
    //       }
    //   })
    //   column['Status'] = { value: this.common.formatTitle(ele.series['y_name']), class: 'black font-weight-bold'};
    //   columns.push(column);
    // });
    
    console.log('headings',this.tableGraph)
    return columns;
  }

  showChart(stateTableData,chartType) {
    this.graphPieCharts.forEach(ele => ele.destroy());
    console.log('data to send to chart module:',stateTableData);
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
    }else if(!stateTableData){
      chartDataSet = [];
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
                sub.data.push({x:data.x,y:data.y,r:(index+1)*4})
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
          }],
          xAxes: [{
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
