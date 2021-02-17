import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import * as _ from "lodash";
import { keyframes } from '@angular/animations';

@Component({
  selector: 'ngx-component-report',
  templateUrl: './component-report.component.html',
  styleUrls: ['./component-report.component.scss']
})
export class ComponentReportComponent implements OnInit {
  components=[];
  componentId='';
  componentData=[]
  startDate = new Date();
  endDate = new Date();
  stackData=[];
  nameData=[];
  segmentHours=[]
  constructor( public common:CommonService,
    public api:ApiService) {
      this.getComponents();
      this.startDate = new Date(new Date().setDate(new Date(this.endDate).getDate() - 7));

     }

  ngOnInit() {
  }

  getComponents() {
    this.common.loading++;
    this.api.get("Components/getAllComponents")
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.components = res['data'];
      },err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }



  componentReport(){
    let params ="componentId=" +this.componentId + "&startDate=" + this.common.dateFormatter(this.startDate) +"&endDate=" +this.common.dateFormatter(this.endDate);
    this.common.loading++;
    this.api.get('Report/getReportWrtComponent?' + params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.componentData = res['data'];
      this.componentDatas();
      this.common.showToast(res['msg']);
    },err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

componentDatas(){
  this.stackData=[];
  this.nameData=[];
  this.segmentHours=[]
        let componrntGroups = _.groupBy(this.componentData, 'name');
        console.log("stacccccccclllkk",componrntGroups)
         Object.keys(componrntGroups).map(key => {
          this.nameData.push({
            name: key,
         data: componrntGroups[key],
           // Date:EmployeAttendanceGroups[key][0].Date
          });
          this.segmentHours.push({
            hour:componrntGroups[key].map(hr=>
              hr.hr)
          });
          this.stackData.push({
            stack:componrntGroups[key].map(stack=>
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
