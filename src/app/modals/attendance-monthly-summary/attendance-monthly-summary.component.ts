import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { ShiftLogAddComponent } from '../shift-log-add/shift-log-add.component';
import { ConfirmComponent } from '../confirm/confirm.component';
import { GenericModelComponent } from '../generic-model/generic-model.component';

@Component({
  selector: 'ngx-attendance-monthly-summary',
  templateUrl: './attendance-monthly-summary.component.html',
  styleUrls: ['./attendance-monthly-summary.component.scss']
})
export class AttendanceMonthlySummaryComponent implements OnInit {
  currentDate = new Date();
  weekdate = { startDate: this.common.getDate(-6), endDate: this.common.getDate() }
  endTime = new Date();
  startTime = new Date();
  // attendanceSummaryList = [];
  filterData: any;
  filteredAttendanceSummaryList = [];
  selectedDates = {
    start: '',
    end: ''
  };
  reportType = null;
  groupList = [];
  selectedGroup = -1;

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
  leaveRequestList = [];
  tableLeaveRequestList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  weeklyList = [];
  tableWeeklyList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService,
    public modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public api: ApiService,
    public userService: UserService
  ) {
    this.common.handleModalSize('class', 'modal-lg', '1300', 'px', 0);
    this.startTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth(), 1);
    this.endTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 1, 0);
    this.groupList = (this.common.params.groupList) ? this.common.params.groupList : [];
  }

  ngOnInit() { }

  closeModal(response) {
    this.activeModal.close();
  }

  onSelectMonth() {
    this.startTime = new Date(this.selectedDates.start);
    this.endTime = new Date(this.startTime.getFullYear(), this.startTime.getMonth() + 1, 0);
  }

  getAttendanceMonthySummary(type = null) {
    if (!type) {
      this.reportType = 'summary';
    } else {
      this.reportType = type;
    }
    this.filteredAttendanceSummaryList = [];
    this.resetTableFinalAttendanceList();
    let startdate = this.common.dateFormatter(this.startTime);
    let enddate = this.common.dateFormatter(this.endTime);
    let params;
    if (type == 'weekly') {
      let startWeekDate;
      let endWeekDate;
      if (!this.weekdate.startDate && !this.weekdate.endDate) {
        startWeekDate = null; endWeekDate = null
      } else {
        startWeekDate = this.common.dateFormatter(this.weekdate.startDate);
        endWeekDate = this.common.dateFormatter(this.weekdate.endDate);
      }
      params =
        "?startDate=" + startWeekDate +
        "&endDate=" + endWeekDate + "&groupId=" + this.selectedGroup;
    } else {
      params =
        "?startDate=" + startdate +
        "&endDate=" + enddate + "&groupId=" + this.selectedGroup;
    }
    let apiName;
    if (type && type == "final") {
      apiName = 'Admin/getAttendanceMonthlySummaryFinal';
    } else if (type && type == "leave") {
      apiName = 'Admin/getLeaveRequestSummary';
    } else if (type && type == 'weekly') {
      apiName = 'Admin/getAttendanceWeeklySummary';
    } else {
      apiName = 'Admin/getAttendanceMonthlySummary';
    }
    this.common.loading++;
    this.api.get(apiName + params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        if (res['code'] == 3) {
          this.common.showError(res['data']);
        } else {
          if (type && type == "final") {
            this.finalAttendanceList = res['data'] || [];
            (this.finalAttendanceList.length > 0) ? this.setTableFinalAttendanceList() : this.resetTableFinalAttendanceList()
          } else if (type && type == "leave") {
            this.leaveRequestList = res['data'] || [];
            (this.leaveRequestList.length > 0) ? this.setTableLeaveRequestList() : this.resetTableFinalAttendanceList()
          } else if (type && type == "weekly") {
            this.weeklyList = res['data'] || [];
            (this.weeklyList.length > 0) ? this.setTableWeeklyList() : this.resetTableFinalAttendanceList()
          } else {
            // this.attendanceSummaryList = res['data'] || [];
            this.filterData = (res['data'] && res['data'].length > 0) ? _.groupBy(res['data'], '_userid') : [];
            Object.keys(this.filterData).map(key => {
              this.filteredAttendanceSummaryList.push({ name: this.filterData[key][0].name, data: _.sortBy(this.filterData[key], 'date') });
            });
            this.filteredAttendanceSummaryList = _.sortBy(this.filteredAttendanceSummaryList, 'name');
            console.log('greeneffect', this.filteredAttendanceSummaryList)
          }

        }
      }, err => {
        this.common.loading--;
        this.common.showError();
      });
  }

  showShiftLogPopup(column) {
    let date = new Date(this.startTime);
    date.setDate(column.date);
    let currentTime = new Date();
    date.setHours(9);
    date.setMinutes(30);
    let accessUserIds = [34, 125, 236, 257, 120, 194];
    let accessFoUserIds = [12373, 27780];
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
    } else if (['PH', 'PH1', 'PH2'].includes(presetType) && e._aduserid < 0) {
      typeColor = "greenyellow";
    } else if (['P', 'PH', 'PH1', 'PH2'].includes(presetType) && !(e._aduserid == e._userid)) {
      typeColor = "blue";
    } else if (presetType == "L") {
      typeColor = "red";
    } else if (presetType == "OL") {
      typeColor = "darkred";
    }
    return typeColor;
  }

  checkHolidayTypeColor(hType) {
    let typeColor = "#c0b2b2";
    if (hType == "2") {
      typeColor = "red";
    } else if (hType == "1") {
      typeColor = "orange";
    } else if (hType == "0") {
      typeColor = "palegreen";
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
              this.common.showError();
            });
        }
      });
    } else {
      this.common.showError("Date or User is missing");
    }
  }

  isMarkUnpaidLeave = false;
  markUnpaidLeave(shift) {
    this.isMarkUnpaidLeave = true;
    setTimeout(() => {
      if (this.isMarkUnpaidLeave) {
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
                  this.common.showError();
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


  resetTableFinalAttendanceList() {
    this.tableFinalAttendanceList.data = {
      headings: {},
      columns: []
    };
    this.tableLeaveRequestList.data = {
      headings: {},
      columns: []
    };
    this.tableWeeklyList.data = {
      headings: {},
      columns: []
    }
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
    return headings;
  }

  getTableColumnsFinalAttendanceList() {
    let columns = [];
    this.finalAttendanceList.map(shift => {
      let column = {};
      for (let key in this.generateHeadingsFinalAttendanceList()) {
        if (key == 'Action' || key == 'action') {
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    return columns;
  }
  // end: report final

  setTableLeaveRequestList() {
    this.tableLeaveRequestList.data = {
      headings: this.generateHeadingsLeaveRequestList(),
      columns: this.getTableColumnsLeaveRequestList()
    };
    return true;
  }

  generateHeadingsLeaveRequestList() {
    let headings = {};
    for (var key in this.leaveRequestList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsLeaveRequestList() {
    let columns = [];
    this.leaveRequestList.map(shift => {
      let column = {};
      for (let key in this.generateHeadingsLeaveRequestList()) {
        if (key == 'Action' || key == 'action') {
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      if (!shift['_task_id'] && shift['_id']) {
        column['style'] = { 'background': 'antiquewhite' };
      } else if (shift['_task_id'] && !shift['_id'] && shift['_status'] == 5) {
        column['style'] = { 'background': 'pink' };
      } else if (shift['_task_id'] && !shift['_id'] && shift['_status'] == -1) {
        column['style'] = { 'background': 'red' };
      } else {
        column['style'] = { 'background': '#fff' };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: leave list

  exportCSV() {
    if (this.reportType == 'final') {
      this.common.getCSVFromTableId('tableFinalAttendanceList')
    } else if (this.reportType == 'leave') {
      this.common.getCSVFromTableId('tableLeaveRequestList')
    } else if (this.reportType == 'weekly') {
      this.common.getCSVFromTableId('tableWeeklyList')
    } else {
      this.common.getCSVFromTableId('attendanceSummary')
    }
  }

  downloadAttendanceExcel() {
    let params = {
      startDate: (this.weekdate.startDate) ? this.common.dateFormatter(this.weekdate.startDate) : null,
      endDate: (this.weekdate.endDate) ? this.common.dateFormatter(this.weekdate.endDate) : null,
      userId: -1
    }
    this.common.loading++;
    this.api.get(`Admin/getWorkHourDetail?startDate=${params.startDate}&endDate=${params.endDate}&userId=${params.userId}`)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] > 0) {
          if (res['data'] && res['data'].length > 0) {
            let headings = {};
            for (var key in res['data'][0]) {
              if (key.charAt(0) != "_") {
                headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
              }
            }
            this.common.getCSVFromDataArray(res['data'], headings, 'Work Hour Report')
          } else {
            this.common.showError('No Data Available');
          }
        };
        console.log('download res:', res)
      })
  }

  // start: weekly list
  setTableWeeklyList() {
    this.tableWeeklyList.data = {
      headings: this.generateHeadingsWeeklyList(),
      columns: this.getTableColumnsWeeklyListList()
    };
    return true;
  }

  generateHeadingsWeeklyList() {
    let headings = {};
    for (var key in this.weeklyList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsWeeklyListList() {
    let columns = [];
    this.weeklyList.map(shift => {
      let column = {};
      for (let key in this.generateHeadingsWeeklyList()) {
        if (key == 'Action' || key == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(shift, 0)
          };
        } else {
          column[key] = { value: shift[key], class: 'black', action: '' };
        }
      }
      if (!shift['_task_id'] && shift['_id']) {
        column['style'] = { 'background': 'antiquewhite' };
      } else if (shift['_task_id'] && !shift['_id'] && shift['_status'] == 5) {
        column['style'] = { 'background': 'pink' };
      } else if (shift['_task_id'] && !shift['_id'] && shift['_status'] == -1) {
        column['style'] = { 'background': 'red' };
      } else {
        column['style'] = { 'background': '#fff' };
      }
      columns.push(column);
    });
    return columns;
  }
  // end: weekly list

  actionIcons(shift, type) {
    let icons = [
      { class: "fas fa-info-circle", action: this.viewWorkHourDetail.bind(this, shift, type), txt: "", title: "view detail", },
    ];
    return icons;
  }

  viewWorkHourDetail(shift, type) {
    let dataparams = {
      view: {
        api: 'Admin/getWorkHourDetail',
        param: {
          startDate: (this.weekdate.startDate) ? this.common.dateFormatter(this.weekdate.startDate) : null,
          endDate: (this.weekdate.endDate) ? this.common.dateFormatter(this.weekdate.endDate) : null,
          userId: shift._aduserid
        }
      },
      title: "Work Hour Detail",
      isExcelDownload: true
    }
    this.common.params = { data: dataparams };
    const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  markAltSat() {
    this.common.params = {
      title: 'Confirm',
      description: `<b>` + 'Are you sure to mark 2 & 4 Saturday attendance of all IT Employees',
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        this.markWeekDay()
      }
    });
  }

  markWeekDay() {
    let params = {
      startDate: this.common.dateFormatter2(this.startTime),
      endDate: this.common.dateFormatter2(this.endTime)
    }
    console.log('params for sat sun att. mark',params);
    this.common.loading++;
    this.api.post('Admin/markSaturdayAttendance', params).subscribe(res => {
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
    }), err => {
      this.common.loading--;
      this.common.showError();
    }
  }
}
