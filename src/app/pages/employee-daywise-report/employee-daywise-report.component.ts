import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-employee-daywise-report',
  templateUrl: './employee-daywise-report.component.html',
  styleUrls: ['./employee-daywise-report.component.scss']
})
export class EmployeeDaywiseReportComponent implements OnInit {
  currentDate = new Date(new Date().setDate(new Date().getDate() - 1));;

  employeeData = [];

  constructor(public common: CommonService,
    public api: ApiService) {
    this.getDaywiseReport();
  }

  ngOnInit() {
  }

  getDaywiseReport() {
    let params = {
      startDate: this.common.dateFormatter1(this.currentDate)
    }
    this.common.loading++;
    this.api.post('Report/getEmpDayWiseReport', params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.employeeData = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

}
