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
  selectedDates = {
    start: '',
    end: ''
  };
  reportType = null;


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

  closeModal(response) {
    this.activeModal.close();
  }

  onSelectMonth() {
    console.log("selectedDates:", this.selectedDates);
    this.startTime = new Date(this.selectedDates.start);
    this.endTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 1, 0);
    console.log("startTime:", this.startTime);
    console.log("endTime:", this.endTime);
    // this.endTime.setHours(23);
    // this.endTime.setMinutes(59);
    // this.endTime.setSeconds(59);
  }


  getAttendanceMonthySummary(type = null) {
    console.log("selectedDates:", this.selectedDates);
    this.reportType = type;
    this.filteredAttendanceSummaryList = [];
    this.resetTableFinalAttendanceList();
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);
    const params =
      "?startDate=" + startdate +
      "&endDate=" + enddate;
    // console.log(params);
    let apiName = (type && type == "final") ? 'Admin/getAttendanceMonthlySummaryFinal' : 'Admin/getAttendanceMonthlySummary';
    this.common.loading++;
    this.api.get(apiName + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 3) {
          this.common.showError(res['data']);

        } else {
          if (type && type == "final") {
            this.finalAttendanceList = res['data'] || [];
            console.log("finalAttendanceList:", this.finalAttendanceList);
            (this.finalAttendanceList.length > 0) ? this.setTableFinalAttendanceList() : this.resetTableFinalAttendanceList()
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
          }

        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  showShiftLogPopup(column) {
    console.log("column:", column);
    let date = new Date(this.startTime);
    date.setDate(column.date);
    let currentTime = new Date();
    date.setHours(9);
    date.setMinutes(30);
    // console.log("date:", date);
    let accessUserIds = [34, 125, 120];
    let accessFoUserIds = [12373];
    if (date <= this.common.getDate() && (!column.present || column.present == "") && ((this.userService._loggedInBy == 'admin' && accessUserIds.includes(this.userService._details.id)) || this.userService._loggedInBy != 'admin' && accessFoUserIds.includes(this.userService._details.id))) {

      this.common.params = { isAttendanceType: true, date: date, userId: column._userid, userName: column.name };
      const activeModal = this.modalService.open(ShiftLogAddComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          this.getAttendanceMonthySummary(null);
        }
      });
    }
  }

  checkPresentTypeColor(e) {
    let presetType = e.present;
    let typeColor = "black";
    if (presetType == "P" && e._aduserid < 0) {
      typeColor = "springgreen";
    } else if (presetType == "PH" && e._aduserid < 0) {
      typeColor = "greenyellow";
    } else if ((presetType == "P" || presetType == "PH") && !(e._aduserid == e._userid)) {
      typeColor = "blue";
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
      typeColor = "Gold";
    } else if (hType == "0") {
      typeColor = "LightBlue";
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
    this.isMarkUnpaidLeave = false;
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
                  this.getAttendanceMonthySummary(null);
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

  isMarkUnpaidLeave = false;
  markUnpaidLeave(shift) {
    console.log("single click event");
    this.isMarkUnpaidLeave = true;
    setTimeout(() => {
      if (this.isMarkUnpaidLeave) {
        console.log("isMarkUnpaidLeave:", this.isMarkUnpaidLeave);
        this.isMarkUnpaidLeave = false;
        if (shift.date && shift._userid > 0) {
          let dateTemp = new Date(this.startTime);
          dateTemp.setDate(shift.date);
          let dateTemp2 = this.common.dateFormatter(dateTemp, 'YYYYMMDD', false);
          let params = {
            date: dateTemp2,
            empId: shift._userid
          }
          this.common.params = {
            title: 'Mark Unpaid Leave',
            description: `<b>` + `User: ` + shift.name + `<br>Date: ` + dateTemp2 + `<br><br>` + 'Are you sure you want to mark unpaid leave ??' + `</b>`,
          }

          const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
          activeModal.result.then(data => {
            if (data.response) {
              this.common.loading++;
              this.api.post('Admin/markUnpaidLeaveByHr', params)
                .subscribe(res => {
                  this.common.loading--;
                  if (res['code'] > 0) {
                    if (res['data'][0].y_id > 0) {
                      this.common.showToast(res['data'][0].y_msg);
                      this.getAttendanceMonthySummary(null);
                    } else {
                      this.common.showError(res['msg']);
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
    }, 500);
  }

  // start: report final
  finalAttendanceList = [];
  tableFinalAttendanceList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  resetTableFinalAttendanceList() {
    this.tableFinalAttendanceList.data = {
      headings: {},
      columns: []
    };
  }

  setTableFinalAttendanceList() {
    this.tableFinalAttendanceList.data = {
      headings: this.generateHeadingsFinalAttendanceList(),
      columns: this.getTableColumnsFinalAttendanceList()
    };
    return true;
  }

  generateHeadingsFinalAttendanceList() {
    let headings = {};
    for (var key in this.finalAttendanceList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    console.log("headings:", headings);
    return headings;
  }

  getTableColumnsFinalAttendanceList() {
    let columns = [];
    this.finalAttendanceList.map(shift => {
      let column = {};
      for (let key in this.generateHeadingsFinalAttendanceList()) {
        if (key == 'Action' || key == 'action') {
          // column[key] = {
          //   value: "",
          //   isHTML: true,
          //   action: null,
          //   icons: null
          // };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }
  // end: report final

  exportCSV() {
    if (this.reportType == 'final') {
      this.common.getCSVFromTableId('tableFinalAttendanceList')
    } else {
      this.common.getCSVFromTableId('attendanceSummary')
    }
  }

}
