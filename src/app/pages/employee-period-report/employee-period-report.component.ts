import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';

@Component({
  selector: 'ngx-employee-period-report',
  templateUrl: './employee-period-report.component.html',
  styleUrls: ['./employee-period-report.component.scss']
})
export class EmployeePeriodReportComponent implements OnInit {

  employeeList = [];
  employeeReport = [];
  employeeId = null;
  startDate = new Date();
  endDate = new Date();
  stack = [];
  date = [];
  group = [];
  final = [];
  constructor(public common: CommonService,
    public api: ApiService) {
    this.getEmployeeList();
  }

  ngOnInit() {
  }

  getEmployeeList() {
    this.common.loading++;
    this.api.get('Suggestion/getEmployeeList')
      .subscribe(res => {
        this.common.loading--;
        console.log("res", res['data']);
        this.employeeList = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  getEmployeeWiseReport() {
    this.stack = [];
    this.date = [];
    this.group = [];
    this.final = [];
    this.employeeReport = [];
    let params = {
      userId: this.employeeId,
      startDate: this.common.dateFormatter(this.startDate),
      endDate: this.common.dateFormatter(this.endDate),
    };
    this.common.loading++;
    this.api.post('WorkLogs/getEmployeeReportWithPeriod', params)
      .subscribe(res => {
        this.common.loading--;
        this.employeeReport = res['data'];
        for (let i = 0; i < this.employeeReport.length; i++) {
          this.stack.push(this.employeeReport[i]['Stack']);
          this.date.push(this.employeeReport[i]['Date']);
        }
        console.log("date", this.date);
        for (let j = 0; j < this.stack.length - 1; j++) {
          for (let k = 1; k < this.stack.length; k++) {
            if (this.stack[j] == this.stack[k]) {
              this.stack.splice(k, 1);
            }
          }
        }
        for (let j = 0; j < this.date.length - 1; j++) {
          for (let k = 1; k < this.date.length; k++) {
            if (this.date[j] == this.date[k]) {
              this.date.splice(k, 1);
            }
          }
        }

        for (let i = 0; i < this.date.length; i++) {
          for (let j = 0; j < this.employeeReport.length; j++) {
            if (this.date[i] == this.employeeReport[j]['Date']) {
              this.group.push(this.employeeReport[j]);
            }

          }
          this.final.push({ date: this.date[i], data: this.group });
          this.group = [];
        }
        console.log("stack", this.stack, this.date, this.final);
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

}
