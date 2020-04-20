import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { ShiftLogAddComponent } from '../shift-log-add/shift-log-add.component';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'ngx-attendance-monthly-summary',
  templateUrl: './attendance-monthly-summary.component.html',
  styleUrls: ['./attendance-monthly-summary.component.scss']
})
export class AttendanceMonthlySummaryComponent implements OnInit {

  endTime = new Date();
  startTime = new Date();
  attendanceSummaryList = [];
  filterData: any;
  filteredAttendanceSummaryList = [];


  constructor(public common: CommonService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public api: ApiService,
    public userService: UserService
  ) {
    this.common.handleModalSize('class', 'modal-lg', '1300', 'px', 0);
    this.startTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth(), 1);
    this.endTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 1, 0);
  }

  ngOnInit() {
  }


  getAttendanceMonthySummary() {
    this.filteredAttendanceSummaryList = [];
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);
    const params =
      "?startDate=" + startdate +
      "&endDate=" + enddate;
    // console.log(params);
    this.common.loading++;
    this.api.get('Admin/getAttendanceMonthlySummary' + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 3) {
          this.common.showError(res['data']);

        } else {
          this.attendanceSummaryList = res['data'] || [];
          console.log('res:', res);
          console.log('res:', this.attendanceSummaryList);
          this.filterData = _.groupBy(this.attendanceSummaryList, 'name');
          console.log(this.filterData);
          Object.keys(this.filterData).map(key => {
            this.filteredAttendanceSummaryList.push({ name: key, data: _.sortBy(this.filterData[key], 'date') });
          })
          console.log(this.filteredAttendanceSummaryList[0]['data']);
          console.log(this.filteredAttendanceSummaryList);

          // // this.filterData = _.groupBy(this.activityLogSummaryList, 'datetime');
          //   console.log(this.filterData);
          //   Object.keys(this.filterData).map(key => {
          //     this.filteredActivityLogSummaryList.push({date: key, data: _.sortBy(this.filterData[key], 'name')});
          //   })
          //   console.log(this.filteredActivityLogSummaryList[0]['data']);

        }
      }
        , err => {
          this.common.loading--;
          console.log(err);
        });
  }

  closeModal(response) {
    this.activeModal.close();
  }

  showShiftLogPopup(column) {
    console.log("column:", column);
    let date = new Date(this.startTime);
    date.setDate(column.date);
    let currentTime = new Date();
    date.setHours(9);
    date.setMinutes(30);
    // console.log("date:", date);
    if (date <= this.common.getDate() && (!column.present || column.present == "") && (this.userService._details.id == 34 || this.userService._details.id == 125 || this.userService._details.id == 120)) {

      this.common.params = { isAttendanceType: true, date: date, userId: column._userid, userName: column.name };
      const activeModal = this.modalService.open(ShiftLogAddComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          this.getAttendanceMonthySummary();
        }
      });
    }
  }

  checkPresentTypeColor(presetType) {
    let typeColor = "black";
    if (presetType == "P") {
      typeColor = "springgreen";
    } else if (presetType == "PH") {
      typeColor = "greenyellow";
    } else if (presetType == "L") {
      typeColor = "red";
    } else if (presetType == "OL") {
      typeColor = "darkred";
    }
    return typeColor;
  }

  checkHolidayTypeColor(hType) {
    let typeColor = "initial";
    if (hType == "1") {
      typeColor = "yellow";
    } else if (hType == "0") {
      typeColor = "lightyellow";
    }
    return typeColor;
  }

  checkHolidayTypeTitle(hType) {
    let title = "";
    if (hType == "1") {
      title = "Fixed Holiday";
    } else if (hType == "0") {
      title = "Optional Holiday";
    }
    return title;
  }

  deleteShiftLog(shift) {
    console.log("dbl click event");
    if (shift.date && shift._userid > 0) {
      let dateTemp = new Date(this.startTime);
      dateTemp.setDate(shift.date);
      // dateTemp.setHours(9);
      // dateTemp.setMinutes(30);
      let dateTemp2 = this.common.dateFormatter(dateTemp, 'YYYYMMDD', false);
      let params = {
        date: dateTemp2,
        empId: shift._userid
      }
      this.common.params = {
        title: 'Delete Shift',
        description: `<b>` + `User: ` + shift.name + `<br>Date: ` + dateTemp2 + `<br><br>` + 'Are you sure you want to delete this record ??' + `</b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Admin/deleteUserShiftByHr', params)
            .subscribe(res => {
              this.common.loading--;
              if (res['code'] > 0) {
                if (res['data'][0].y_id > 0) {
                  this.common.showToast(res['data'][0].y_msg);
                  this.getAttendanceMonthySummary();
                } else {
                  this.common.showError(res['data'][0].y_msg);
                }
              } else {
                this.common.showError(res['msg']);
              }

            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Date or User is missing");
    }
  }

}
