import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalaryDetailComponent } from '../../modals/salary-detail/salary-detail.component';

@Component({
  selector: 'ngx-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit {
  objectKeys = Object.keys;
  salaryList = [];
  today = new Date();
  selectedDates = {
    start: '',
    end: ''
  };

  totalDays = 0;
  employerPfPercent = 13;
  employeePfPercent = 12;
  employerEsicPercent = 3.25;
  employeeEsicPercent = 0.75;
  basicPercent = 65;

  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.common.refresh = this.refresh.bind(this);
  }
  ngOnInit() {
  }

  refresh() {
    this.getEmployeeSalary();
  }

  getEmployeeSalary() {
    this.salaryList = [];
    let params = "?date=" + this.selectedDates.start;
    this.common.loading++;
    this.api.get('Admin/getEmpolyeeSalery.json' + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        let r = res['data'];
        this.totalDays = r['totalDays'];
        this.basicPercent = r['basicPercent'];
        this.employerPfPercent = r['employerPfPercent'];
        this.employeePfPercent = r['employeePfPercent']
        this.employerEsicPercent = r['employerEsicPercent'];
        this.employeeEsicPercent = r['employeeEsicPercent'];
        this.salaryList = r['salaryList'] || [];
        if (!this.salaryList.length) {
          this.common.showError("No Record Found");
        }
      } else {
        this.common.showError(res["msg"]);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("error:", err);
    });
  }

  getSalaryCalculation() {
    let params = {
      date: this.selectedDates.start,
      totalDays: this.totalDays,
      employerPfPercent: this.employerPfPercent,
      employeePfPercent: this.employeePfPercent,
      employerEsicPercent: this.employerEsicPercent,
      employeeEsicPercent: this.employeeEsicPercent,
      basicPercent: this.basicPercent,
      salaryList: JSON.stringify(this.salaryList)
    };
    this.common.loading++;
    this.api.post('Admin/getSalaryCalculation.json', params).subscribe(res => {
      this.common.loading--;
      console.log('res:', res);
      if (res["code"] == 1) {
        let r = res['data'];
        this.totalDays = r['totalDays'];
        this.basicPercent = r['basicPercent'];
        this.employerPfPercent = r['employerPfPercent'];
        this.employeePfPercent = r['employeePfPercent']
        this.employerEsicPercent = r['employerEsicPercent'];
        this.employeeEsicPercent = r['employeeEsicPercent'];
        this.salaryList = r['salaryList'];

      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("error:", err);
    });
  }

  saveEmployeeSalary() {
    let params = {
      date: this.selectedDates.start,
      totalDays: this.totalDays,
      employerPfPercent: this.employerPfPercent,
      employeePfPercent: this.employeePfPercent,
      employerEsicPercent: this.employerEsicPercent,
      employeeEsicPercent: this.employeeEsicPercent,
      basicPercent: this.basicPercent,
      salaryList: JSON.stringify(this.salaryList)
    };
    this.common.loading++;
    this.api.post('Admin/saveEmployeeSalary.json', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
        this.getEmployeeSalary();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log("error:", err);
    });
  }

  showSalaryDetailModal() {
    this.common.params = null;
    const activeModal = this.modalService.open(SalaryDetailComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
  }

}
