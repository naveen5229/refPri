import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { MapService } from '../../Service/map/map.service';

@Component({
  selector: 'ngx-continuity-report',
  templateUrl: './continuity-report.component.html',
  styleUrls: ['./continuity-report.component.scss']
})
export class ContinuityReportComponent implements OnInit {
  departmentList = [];
  date = new Date();
  today = new Date();
  continuityReport = [];
  selectedDepartment = { id: -1, name: 'All' }

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  headingForCsv = {};


  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal, public mapService: MapService) {
    this.refresh();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.getDepartmentList();
    this.getContinuityReport();
    this.selectedDepartment = { id: -1, name: 'All' }
  }

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          let departmentList = res["data"] || [];
          this.departmentList = departmentList.map(department => { return { id: department.id, name: department.name } });
          this.departmentList.splice(0, 0, { id: -1, name: 'All' });
        } else {
          this.common.showError(res["msg"]);
        }
      },
      (err) => {
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  getContinuityReport() {
    let date = this.common.dateFormatter(this.date);
    const params = '?date=' + date + '&deptId=' + this.selectedDepartment.id;
    console.log(params);
    this.common.loading++;
    this.api.get('Admin/getContinuityReport' + params)
      .subscribe(res => {
        this.common.loading--;
        // if (res['code'] === 0) { this.common.showError(res['msg']); return false; }; 
        if (res['code'] > 0) {
          this.continuityReport = res['data'] || [];
          this.continuityReport.length ? this.setTable() : this.resetTable();
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }


  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.continuityReport[0]) {
      console.log(key.charAt(0));

      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    this.headingForCsv = headings;
    return headings;
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }


  getTableColumns() {
    let columns = [];
    this.continuityReport.map(shift => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            // icons: this.actionIcons(inventory)
          };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    console.log(columns);
    return columns;

  }

  exportCSV() {
    this.common.getCSVFromDataArray(this.continuityReport, this.headingForCsv, `continuityReport ${this.selectedDepartment.name}`)
  }
}
