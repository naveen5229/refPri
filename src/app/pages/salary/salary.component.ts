import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  tableSalaryList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  constructor(public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    // this.getEmployeeSalary();
    this.common.refresh = this.refresh.bind(this);
  }
  ngOnInit() {
  }

  refresh() {
    this.getEmployeeSalary();
  }

  getEmployeeSalary() {
    this.salaryList = [];
    this.resetTable();
    let params = "?date=" + this.selectedDates.start;//this.common.dateFormatter(this.date);
    this.common.loading++;
    this.api.get('Admin/getEmpolyeeSalery.json' + params).subscribe(res => {
      this.common.loading--;
      // console.log('res:', res);
      this.salaryList = res['data'] || [];
      console.log("salaryList:", this.salaryList);
      this.salaryList.length ? this.setTable() : this.resetTable();
    }, err => {
      this.common.loading--;
      console.log("error:", err);
    });
  }

  resetTable() {
    this.tableSalaryList.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.tableSalaryList.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    console.log("tableSalaryList:", this.tableSalaryList);
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.salaryList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    // console.log(this.generateHeadings());
    let columns = [];
    this.salaryList.map(ticket => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(pending)
          };
        } else {
          column[key] = { value: ticket[key], class: '', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }

}
