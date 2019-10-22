import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import * as _ from "lodash";


@Component({
  selector: 'ngx-segment-report',
  templateUrl: './segment-report.component.html',
  styleUrls: ['./segment-report.component.scss']
})
export class SegmentReportComponent implements OnInit {
  startDate = new Date();
  endDate = new Date();
  segmentName=[];
  segmentId='';
  stackData=[];
  segmentHours=[];
  nameData=[];

  constructor(public common:CommonService,
    public api:ApiService) {
      this.getAllSegment() 

     }
     segmentData=[];

  ngOnInit() {
  }

  getAllSegment() {
    this.common.loading++;

    this.api.get('Segment/getAllSegments')
      .subscribe(res => {
        this.common.loading--;
        this.segmentName = res['data'];
        console.log("list", this.segmentName);

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  changeSegment(event) {
    console.log("item", event)
    this.segmentId = event.id;
  }

  segmentReport(){
let params ="segmentId=" +this.segmentId + "&startDate=" + this.common.dateFormatter(this.startDate) +"&endDate=" +this.common.dateFormatter(this.endDate)

this.common.loading++;
this.api.get('Report/getReportWrtSegment?' + params).subscribe(res => {
  this.common.loading--;
  this.segmentData = res['data'];
  console.log("dataaaaaaa",this.segmentData)
  this.arrangement()
    this.common.showToast(res['msg'])

},
  err => {
    this.common.loading--;

    this.common.showError();
    console.log('Error: ', err);
  });
  }

  arrangement(){
    let StackGroups = _.groupBy(this.segmentData, 'name');
    console.log("stacccccccclllkk",StackGroups)
     Object.keys(StackGroups).map(key => {
      this.nameData.push({
        name: key,
     data: StackGroups[key],
       // Date:EmployeAttendanceGroups[key][0].Date
      });
      this.segmentHours.push({
        hour:StackGroups[key].map(hr=>
          hr.hr)
      });
      this.stackData.push({
        hour:StackGroups[key].map(stack=>
          stack.stack)
    }); 
  
  });
  this.stackData=this.stackData[0].hour
    console.log("----------------------",this.stackData)
    console.log("----------------------",this.segmentHours)


  }

}
