import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StackReportComponent } from '../../modals/stack-report/stack-report.component';
import * as _ from "lodash";

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
  stacks: any = [];
  reports: any = [];
  date: any = [];
  group: any = [];
  final: any = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal,
  ) {
    this.getEmployeeList();
    this.startDate = new Date(new Date().setDate(new Date(this.endDate).getDate() - 7));

  }

  ngOnInit() {
  }

  getEmployeeList() {
    this.common.loading++;
    this.api.get('Suggestion/getEmployeeList')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.employeeList = res['data'];
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  getEmployeeWiseReport() {
    let params = {
      userId: this.employeeId,
      startDate: this.common.dateFormatter(this.startDate),
      endDate: this.common.dateFormatter(this.endDate),
    };
    this.common.loading++;
    this.api.post('Report/getEmployeeReportWithPeriod', params)
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.stacks = [... new Set(Object.keys(_.groupBy(res['data'], 'stack')))];
        let reports = _.groupBy(res['data'], 'date');
        this.reports = Object.keys(reports).map(date => {
          let stacks = _.groupBy(reports[date], 'stack');
          Object.keys(stacks).map(stack => stacks[stack] = stacks[stack].map((stk) => { return stk.total; }));
          return {
            date,
            stacks,
            data: reports[date]
          }
        });
        console.log(this.reports);
      }, err => {
        this.common.loading--;
        console.log(err);
        this.common.showError();
      });
  }

  stackWiseReport(report, stack) {

    let { _sqdate, _stackid } = report.data.filter(ele => ele.stack == stack)[0];

    this.common.params = { stackDate: _sqdate, stackId: _stackid, empId: this.employeeId }
    this.modalService.open(StackReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });

  }
}
