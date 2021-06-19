import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { ErrorReportComponent } from '../../modals/error-report/error-report.component';

@Component({
  selector: 'ngx-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss']
})
export class HolidaysComponent implements OnInit {
  holidayList: any;
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  holidayCsv = null;
  allHolidayList = [];

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    this.getHolidayCalendar();
  }
  ngOnInit() { }

  refresh() {
    this.getHolidayCalendar();
  }

  getHolidayCalendar() {
    this.resetTable();
    this.common.loading++;
    this.api.get('Admin/getHolidayCalendar')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (res['data'] && res['data']) {
          this.allHolidayList = res['data'] || [];
          this.holidayList = res['data'] || [];
          this.holidayList.length ? this.setTable() : this.resetTable();
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
    for (var key in this.holidayList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
        if (key == 'date') {
          headings[key]["type"] = "date";
        }
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.holidayList.map(shift => {
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

  handleFileSelection(event) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0])
      .then(res => {
        this.common.loading--;
        let file = event.target.files[0];
        console.log("file-type:", file.type);
        if (file.type == "application/vnd.ms-excel" || file.type == "text/csv") {
        }
        else {
          alert("valid Format Are : csv");
          return false;
        }

        res = res.toString().replace('vnd.ms-excel', 'csv');
        this.holidayCsv = res;
      }, err => {
        this.common.loading--;
        console.error('Base Err: ', err);
      })
  }

  uploadCsv() {
    let params = {
      holidayCsv: this.holidayCsv
    };
    if (!params.holidayCsv) {
      return this.common.showError("CSV is missing");
    }
    this.common.loading++;
    this.api.post("Admin/importHolidayCsv", params)
      .subscribe(res => {
        this.common.loading--;
        if (res["code"] > 0) {
          this.common.showToast(res["msg"]);
          let successData = res['data']['success'];
          let errorData = res['data']['fail'];
          alert(res["msg"]);
          this.common.params = { successData, errorData, title: 'csv Uploaded Data' };
          const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
          activeModal.result.then(data => {
            if (data.response) {
              // this.activeModal.close({ response: true });
              this.holidayCsv = null;
              this.getHolidayCalendar();
            }
          });
        } else {
          this.common.showError(res["msg"]);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  onSelectFilter(e) {
    this.resetTable();
    let selectedList = null;
    if (e) {
      console.log("e:", e);
      if (this.allHolidayList && this.allHolidayList.length > 0) {
        if (e == 1) {
          selectedList = this.allHolidayList.filter(x => x._type == 1);
        } else if (e == 2) {
          selectedList = this.allHolidayList.filter(x => x._type == 0);
        } else if (e == 3) {
          selectedList = this.allHolidayList.filter(x => !(x.name == 'Sunday' || x.name == 'sunday'));
        }
      }
    } else {
      selectedList = this.allHolidayList;
    }
    this.holidayList = selectedList;
    this.setTable();
    console.log("selectedList:", selectedList);
  }

  sampleCsv() {
    window.open(this.api.I_URL + "sample/holidaySample.csv");
  }

}
