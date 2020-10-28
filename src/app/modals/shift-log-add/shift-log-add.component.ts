import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'ngx-shift-log-add',
  templateUrl: './shift-log-add.component.html',
  styleUrls: ['./shift-log-add.component.scss']
})
export class ShiftLogAddComponent implements OnInit {
  today = new Date();
  dateExtendForAttendance = new Date();
  shiftForm = {
    startTime: null,
    endTime: null,
    user: {
      id: null,
      name: ""
    },
    addtime: null,
    type: 1,
    attendanceType: null,
    remark: null
  };
  adminList = [];
  shiftLogList = [];
  tableShiftLogList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  disableStartTime = false;
  shiftType = [
    { id: 1, name: 'Work' },
    // { id: 2, name: 'Break' },
    { id: 3, name: 'OT' }
  ];
  attendanceType = [
    { id: 2, name: 'Present' },
    { id: 1, name: 'Present half day' },
    { id: -2, name: 'Leave' },
    { id: -1, name: 'Optional-Leave' }
  ];
  isAttendanceType = false;
  endDateDis: Boolean = true;

  constructor(public activeModal: NgbActiveModal, public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    this.getAllAdmin();
    // this.dateExtendForAttendance.setDate(this.dateExtendForAttendance.getDate() + 1);
    console.log("param:", this.common.params);
    if (this.common.params && this.common.params.isAttendanceType) {
      this.endDateDis = false;
      this.isAttendanceType = this.common.params.isAttendanceType;
      this.shiftForm.user.id = this.common.params.userId;
      this.shiftForm.user.name = this.common.params.userName;
      this.shiftForm.startTime = new Date(this.common.params.date);
      this.shiftForm.endTime = new Date(this.common.params.date);
      this.shiftForm.endTime.setHours(18);
      this.shiftForm.endTime.setMinutes(30);
      // this.shiftForm.addtime = this.common.params.date;

      this.dateExtendForAttendance = new Date(this.shiftForm.endTime);
      this.dateExtendForAttendance.setDate(this.dateExtendForAttendance.getDate() + 1);
    } else {
      this.shiftForm.startTime = this.today;
      this.shiftForm.endTime = null;
    }
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        let adminList = res["data"] || [];
        this.adminList = adminList.map((x) => {
          return { id: x.id, name: x.name + " - " + x.department_name };
        });
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  // start: shift log list
  setTableShiftLog() {
    this.tableShiftLogList.data = {
      headings: this.generateHeadingsShiftLog(),
      columns: this.getTableColumnsShiftLog()
    };
    return true;
  }

  generateHeadingsShiftLog() {
    let headings = {};
    for (var key in this.shiftLogList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }
  getTableColumnsShiftLog() {
    let columns = [];
    this.shiftLogList.map(shift => {
      let column = {};
      for (let key in this.generateHeadingsShiftLog()) {
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
    return columns;
  }
  // end: shift log list
  actionIcons(shift) {
    let icons = [
      { class: "fas fa-trash-alt", action: this.deleteUserShift.bind(this, shift), txt: '', title: "Delete Shift" }
    ];
    if (!shift.end_time) {
      icons.push({ class: "fa fa-edit", action: this.editShit.bind(this, shift), txt: '', title: "End Shift" });
    }
    return icons;
  }

  editShit(shift) {
    this.shiftForm.startTime = new Date(shift._start_time);
    this.shiftForm.addtime = new Date(shift._addtime);
    this.shiftForm.endTime = new Date();
    this.shiftForm.type = shift._type;
    this.disableStartTime = true;
  }

  changeUsers(event) {
    this.shiftLogList = [];
    this.resetDate();
    if (event.id > 0) {
      this.shiftForm.user.id = event.id;
      this.shiftForm.user.name = event.name;
      this.getUserShiftDetailByDate();
    } else {
      this.shiftForm.user.id = null;
      this.shiftForm.user.name = "";
    }

  }

  getUserShiftDetailByDate() {
    this.tableShiftLogList = {
      data: {
        headings: {},
        columns: []
      },
      settings: {
        hideHeader: true
      }
    };
    let param = "?date=" + this.common.dateFormatter(this.common.getDate()) + "&userId=" + this.shiftForm.user.id;
    this.api.get("Admin/getUserShiftDetailByDate" + param).subscribe(res => {
      console.log("data", res['data']);
      if (res['code'] > 0) {
        this.shiftLogList = res['data'] || [];
        this.setTableShiftLog();
      } else {
        this.common.showError(res['msg']);
      }
    },
      err => {
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  saveUserShift() {
    console.log("saveUserShift", this.shiftForm);
    if (!this.shiftForm.user.id) {
      return this.common.showError("User is missing");
    } else if (!this.shiftForm.startTime) {
      return this.common.showError("Start Time is missing");
    } else if (this.shiftForm.endTime && this.shiftForm.endTime < this.shiftForm.startTime) {
      return this.common.showError("End Time must be greater than Start Time");
    } else if (this.shiftForm.startTime > this.common.getDate()) {
      return this.common.showError("Start Time must not be greater than current time");
    } else if ((this.disableStartTime || this.isAttendanceType) && !this.shiftForm.endTime) {
      return this.common.showError("End Time is missing");
    } else if (this.isAttendanceType && !this.shiftForm.attendanceType) {
      return this.common.showError("Attendance Type is missing");
    } else {
      this.common.loading++;
      let params = {
        userId: this.shiftForm.user.id,
        startTime: (this.shiftForm.startTime) ? this.common.dateFormatter(this.shiftForm.startTime) : null,
        endTime: (this.shiftForm.endTime) ? this.common.dateFormatter(this.shiftForm.endTime) : null,
        addtime: (this.shiftForm.addtime) ? this.common.dateFormatter(this.shiftForm.addtime) : null,
        type: this.shiftForm.type,
        attendanceType: this.shiftForm.attendanceType,
        remark: this.shiftForm.remark
      };
      // this.api.post("Admin/saveUserShift", params).subscribe(res => {
      this.api.post("Admin/saveUserShiftV2", params).subscribe(res => {
        console.log("data", res['data'])
        this.common.loading--;
        if (res['code'] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetDate();
            if (this.isAttendanceType) {
              this.closeModal(true);
            } else {
              this.getUserShiftDetailByDate();
            }
          } else {
            this.common.showError(res['data'][0].y_msg)
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    }
  }

  resetDate() {
    this.shiftForm.startTime = this.today;
    this.shiftForm.endTime = null;
    this.shiftForm.type = 1;
    this.shiftForm.addtime = null;
    this.disableStartTime = false;
  }

  deleteUserShift(shift) {
    if (shift._id) {
      let params = "?shiftId=" + shift._id;
      this.common.params = {
        title: 'Delete Shift Log ',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.get('Admin/deleteUserShiftById' + params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getUserShiftDetailByDate();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Invalid shift");
    }
  }

}
