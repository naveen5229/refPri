import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { GenericModelComponent } from '../../modals/generic-model/generic-model.component';
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
  today = new Date();
  continuityReport = [];
  selectedDepartment = { id: null, name: null }

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
  continuityDuration = {
    startDate: <any>this.common.getDate(-2),
    endDate: <any>this.common.getDate(),
  };


  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal, public mapService: MapService) {
    this.refresh();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
  }

  refresh() {
    this.getDepartmentList();
  }

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        console.log("data", res["data"]);
        if (res["code"] > 0) {
          let departmentList = res["data"] || [];
          this.departmentList = departmentList.map(department => { return { id: department.id, name: department.name } });
          this.selectedDepartment = departmentList[0];
          this.getContinuityReport();
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
    let startDate = this.common.dateFormatter(this.continuityDuration.startDate);
    let endDate = this.common.dateFormatter(this.continuityDuration.endDate);
    const params = '?startDate=' + startDate + '&endDate=' + endDate + '&deptId=' + this.selectedDepartment.id;
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
            icons: this.actionIcons(shift)
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

  actionIcons(shift) {
    let icons = [];
    icons.push({ class: "fas fa-info-circle", action: this.checkDetail.bind(this, shift), txt: "", title: "Detail", });
    return icons;
  }

  checkDetail(shift) {
    let date = new Date(shift.date);
    let dataparams = {
      view: {
        api: 'Admin/getContinuityReport',
        param: {
          startDate: this.common.dateFormatter(date),
          endDate: this.common.dateFormatter(date),
          deptId: this.selectedDepartment.id,
          isDetail: 1,
          userId: shift._id
        }
      },
      title: `Log Detail `,
      // type: "transtruck"
    }
    // this.common.handleModalSize('class', 'modal-lg', '1100');
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  exportCSV() {
    this.common.getCSVFromDataArray(this.continuityReport, this.headingForCsv, `continuityReport ${this.selectedDepartment.name}`)
  }
}
