// Author By Lalit

import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import * as _ from "lodash";

@Component({
  selector: 'ngx-module-report',
  templateUrl: './module-report.component.html',
  styleUrls: ['./module-report.component.scss']
})
export class ModuleReportComponent implements OnInit {
  moduleList = [];
  moduleId = null;
  endDate = new Date();
  startDate = new Date(new Date().setDate(new Date().getDate() - 7));
  moduleData: any = [];
  isSubmit = false;
  formattedModuleData = [];
  formattedSegments: any = [];


  constructor(public common: CommonService,
    public api: ApiService) {
    this.common.refresh = this.refresh.bind(this);
    this.getModuleList();
  }

  ngOnInit() {
  }
  refresh() {
    this.getModuleList();
  }
  getModuleId(event) {
    this.moduleId = event.module_id;
  }

  getModuleList() {
    this.api.get('Suggestion/getModules')
      .subscribe(res => {
        this.moduleList = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  getModuleReport() {
    let startDate = this.common.dateFormatter(this.startDate);
    let endDate = this.common.dateFormatter(this.endDate);
    if (!this.moduleId || !this.startDate || !this.endDate) {
      return this.common.showError("Please Fill All Field ");
    }
    if (this.startDate > this.endDate) {
      return this.common.showError("Start Date Should Be Less Then End Date");
    }

    const params = {
      moduleId: this.moduleId,
      startDate: startDate,
      endDate: endDate
    }
    console.log("params", params);
    this.common.loading++;
    this.api.post("Report/getModuleSegmentWrtPeriod", params)
      .subscribe(res => {
        this.common.loading--;
        this.moduleData = res['data'] || [];
        this.isSubmit = true;
        this.dataFormatted();
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }
  dataFormatted() {
    this.formattedModuleData = [];
    this.formattedSegments = [];
    let employeeGroups = _.groupBy(this.moduleData, 'EmpName');
    console.log("employeeGroup", employeeGroups)
    Object.keys(employeeGroups).map(key => {
      let segments = _.groupBy(employeeGroups[key], 'SegmentName');
      Object.keys(segments).map(segment => segments[segment] = segments[segment].reduce((sum, seg) => { return sum += parseInt(seg.Hour) }, 0));
      this.formattedModuleData.push({
        name: key,
        data: segments,
      });

      this.formattedSegments.push(...employeeGroups[key].map(segment =>
        segment.SegmentName)
      );

    });

    this.formattedSegments = [...new Set(this.formattedSegments)]
    console.log('formattedSegments', this.formattedSegments);
    console.log('formattedModuleData', this.formattedModuleData);

    return this.formattedModuleData;

  }






}
