import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { ShiftLogAddComponent } from '../shift-log-add/shift-log-add.component';

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

}
