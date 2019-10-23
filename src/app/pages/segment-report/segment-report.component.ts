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
  segmentData=[];

  segmentId='';
  stackData=[];
  segmentHours=[];
  nameData=[];

  constructor(public common:CommonService,
    public api:ApiService) {
      this.getAllSegment() ;
      this.startDate = new Date(new Date().setDate(new Date(this.endDate).getDate() - 7));


     }

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
    this.stackData=[];
  this.segmentHours=[];
  this.nameData=[];
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
        stack:StackGroups[key].map(stack=>
          stack.stack)
    }); 
  
  });
  this.segmentHours=this.segmentHours[0].hour;
  this.stackData=this.stackData[0].stack

    console.log("----------------------",this.stackData)
    console.log("----------------------",this.segmentHours)
    console.log("----------------------",this.nameData)



  }

}
