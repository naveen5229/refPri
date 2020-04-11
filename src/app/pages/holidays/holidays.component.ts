import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

  constructor(public common: CommonService, public user: UserService, public api: ApiService, public activeModal: NgbActiveModal, public modalService: NgbModal) {
    this.getHolidayCalendar();
  }
  ngOnInit() { }

  getHolidayCalendar() {
    this.resetTable();
    this.common.loading++;
    this.api.get('Admin/getHolidayCalendar')
      .subscribe(res => {
        this.common.loading--;
        console.log('res:', res);
        if (res['data'] && res['data']) {
          this.holidayList = res['data'] || [];
          this.holidayList.length ? this.setTable() : this.resetTable();
        }
      }, err => {
        this.common.loading--;
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
        this.common.showToast(res["msg"]);

        let successData = res['data']['success'];
        let errorData = res['data']['fail'];
        console.log("error: ", errorData);
        alert(res["msg"]);
        this.common.params = { successData, errorData, title: 'csv Uploaded Data' };
        const activeModal = this.modalService.open(ErrorReportComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
        activeModal.result.then(data => {
          if (data.response) {
            this.activeModal.close({ response: true });
          }
        });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

}
