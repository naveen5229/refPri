import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import * as _ from "lodash";


@Component({
  selector: 'ngx-segment-stack-report',
  templateUrl: './segment-stack-report.component.html',
  styleUrls: ['./segment-stack-report.component.scss']
})
export class SegmentStackReportComponent implements OnInit {
  startDate =new  Date();
  endDate = new Date();
  stackData = [];
  segmentHours = [];
  nameData = [];
  segmentData = []
  constructor(public common: CommonService,
    public api: ApiService) {
      this.startDate = new Date(new Date().setDate(new Date(this.endDate).getDate() - 7));

     }

  ngOnInit() {
  }

  segmentReport() {
    let params = "startDate=" + this.common.dateFormatter(this.startDate) + "&endDate=" + this.common.dateFormatter(this.endDate)

    this.common.loading++;
    this.api.get('Report/getStackSegmentWrtPeriod?' + params).subscribe(res => {
      this.common.loading--;
      this.segmentData = res['data'];
      console.log("dataaaaaaa", this.segmentData)
      this.arrangement()
      this.common.showToast(res['msg'])

    },
      err => {
        this.common.loading--;

        this.common.showError();
        console.log('Error: ', err);
      });
  }

  arrangement() {
    this.stackData = [];
    this.segmentHours = [];
    this.nameData = [];
    let StackGroups = _.groupBy(this.segmentData, 'segmentname');
    console.log("stacccccccclllkk", StackGroups)
    Object.keys(StackGroups).map(key => {
      let stacks = _.groupBy(StackGroups[key], 'stack');
      Object.keys(stacks).map(stack => stacks[stack] = stacks[stack].reduce((sum, stk) => {return sum += parseInt(stk.hr)}, 0));
      this.nameData.push({
        name: key,
        data: stacks,
        // Date:EmployeAttendanceGroups[key][0].Date
      });
      // this.segmentHours.push(StackGroups[key].map(hr =>
      //     hr.hr)
      // );
      this.stackData.push(...StackGroups[key].map(stack =>
        stack.stack)
      );
      this.segmentHours.push({
        hour: StackGroups[key].map(hr =>
          hr.hr),
        stack: StackGroups[key].map(hr =>
          hr.stack),
      });

    });
    // this.stackData=  _.groupBy(this.segmentData, 'stack');
    this.segmentHours = this.segmentHours;
    this.stackData = [...new Set(this.stackData)]

    console.log("----------------------", this.stackData)
    console.log("----------------------", this.segmentHours)
    console.log("----------------------", this.nameData)



  }
}
