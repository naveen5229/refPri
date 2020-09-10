import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, copyArrayItem } from '@angular/cdk/drag-drop';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-graphical-reports',
  templateUrl: './graphical-reports.component.html',
  styleUrls: ['./graphical-reports.component.scss']
})
export class GraphicalReportsComponent implements OnInit {
  processList = [];
  assign = {
    data: [],
    filter: [],
    chart: []
  }
  processId = '';
sideBarData = [
  {title:'Transaction Fields', children:[{title:'',children:''}]
  },
  {title:'Form Fields', children:[{title:'',children:''}]
  },
];

  constructor(
    public common: CommonService,
    public api: ApiService,) {
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
            data.children.push({title:ele.title,children:JSON.parse(ele.children)})
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
      {title:'Transaction Fields', children:[{title:'',children:''}]
      },
      {title:'Form Fields', children:[{title:'',children:''}]
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
      this.assign.data.forEach(ele=> {
        if(ele.r_colid === event.previousContainer.data[event.previousIndex]['r_colid'] &&
        (ele.r_isdynamic === event.previousContainer.data[event.previousIndex]['r_isdynamic'] &&
        ele.r_ismasterfield === event.previousContainer.data[event.previousIndex]['r_ismasterfield'])){
            exists++;
        };
      })
      if(exists > 0) return; this.assign.data.push(event.previousContainer.data[event.previousIndex]);
      
      
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

  removeField(index){
    this.assign.data.splice(index,1)
    console.log('deleted:',index,'from:',this.assign.data)
  }

  getReportPreview(){
      let params = {
      processId:this.processId['_id'],
      reportFilter:null,
      info:JSON.stringify(this.assign.data)
    };
      this.common.loading++;
      this.api.post('Processes/getPreviewGraphicalReport',params).subscribe(res=>{
          this.common.loading--;
          console.log('Response:',res);
      },err=>{
        this.common.loading--;
        console.log('Error:',err)
      })
  }
}
