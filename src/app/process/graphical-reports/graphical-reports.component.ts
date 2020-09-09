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
  assign = {
    data: [],
    filter: [],
    chart: []
  }
sideBarData = [
  {  title : 'Action-1',
    hideMe: true,
    children:[
      { title : 'subtab1'},
      { title : 'subtab2'},
      { title : 'subtab3'},
      { title : 'subtab4'}
    ]
  },
    { title: 'Action-2',
    hideMe: true,
      children:[
        { title : 'subtab5'},
        { title : 'subtab6'},
        { title : 'subtab7jjjjjjjjjjjjjjjjjj'},
        { title : 'subtab8'}
      ]
    },{ title: 'Action-3',
    hideMe: true,
    children:[
      { title : 'subtab9'},
      { title : 'subtab10'},
      { title : 'subtab11'},
      { title : 'subtab12'}
    ]
  }
]

  constructor(
    public common: CommonService,
    public api: ApiService,) {
      this.getSideBarData();
     }

  ngOnInit() {
  }

  getSideBarData(){
    this.common.loading++;
    this.api.get('Processes/getAllReportFieldsForNav?processId=2').subscribe(res => {
      this.common.loading--;
      if (!res['data']) return;
      console.log('Data:',res['data']);

    }, err => {
      this.common.loading--;
      console.log(err);
    });
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
      this.assign.data.push(event.previousContainer.data[event.previousIndex]);
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
}
