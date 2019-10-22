// Author By Lalit

import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-module-report',
  templateUrl: './module-report.component.html',
  styleUrls: ['./module-report.component.scss']
})
export class ModuleReportComponent implements OnInit {
  moduleList = [];
  moduleId = null;
  startDate = new Date();
  endDate = new Date();

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
        console.log("api Data", res);
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

}
