import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { scheduled } from 'rxjs';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'ngx-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit { //user for two forms 1. leave,2. broadcast
  title = "Apply Leave";
  userList = [];
  btn = 'Apply';
  currentDate = this.common.getDate();
  nextDate = this.common.getDate(1);

  leaveArray = {
    startDate: this.currentDate,
    endDate: this.currentDate,
    To: null,
    cc: [],
    reason: '',
    type: 0
  }

  formType = null; //null=leave,1=broadcast
  broadcast = {
    subject: null,
    desc: null,
    to: null,
    cc: [],
    endDate: this.common.getDate(2),
    type: 4,
    chatFeature: false
  }

  userGroupList = [];
  userWithGroup = [];
  bGConditions = [
    {
      key: 'groupId',
      class: 'highlight-blue',
      isExist: true
    }
  ];

  meetingForm = {
    subject: null,
    desc: null,
    cc: [],
    roomId: null,
    type: 0,
    link: null,
    host: { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name },
    time: this.common.getDate(2),
    duration: null,
    buzz: true,
    reqId: null
  }
  meetingRoomList = [];


  selectedTime = { hh: '', mm: '' };
  showHours = false;
  hours = [];
  minutes = [];
  busySchedules = [];

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {

    this.userList = this.common.params.userList.map(x => { return { id: x.id, name: x.name, groupId: null, groupuser: null } });
    this.userGroupList = this.common.params.groupList;
    if (this.userGroupList) {
      this.userWithGroup = this.userGroupList.concat(this.userList);
    } else {
      this.userWithGroup = this.userList.concat(this.userGroupList);
    }

    this.formType = (this.common.params.formType > 0) ? this.common.params.formType : null;
    this.title = (this.common.params.title) ? this.common.params.title : "Apply Leave";
    this.btn = (this.common.params.btn) ? this.common.params.btn : "Apply";
    if (!this.formType) {
      this.getLastLeaveRequestData();
    } else if (this.formType == 2) {
      this.getMeetingRoomList();
      if (this.common.params.meetingData) {
        let durationtime = new Date();
        let timeduration = (this.common.params.meetingData.duration).split(':');
        durationtime.setHours(timeduration[0]);
        durationtime.setMinutes(timeduration[1]);

        let scheduledTimeHr = new Date(this.common.params.meetingData.schedule_time).getHours();
        let scheduledTimeMin = new Date(this.common.params.meetingData.schedule_time).getMinutes();
        this.selectedTime = {
          hh: (scheduledTimeHr.toString().length == 1) ? `0${scheduledTimeHr}` : `${scheduledTimeHr}`,
          mm: (scheduledTimeMin.toString().length == 1) ? `0${scheduledTimeMin}` : `${scheduledTimeMin}`
        };

        this.meetingForm = {
          subject: this.common.params.meetingData.subject,
          desc: this.common.params.meetingData._desc,
          cc: this.common.params.meetingData._user,
          roomId: this.common.params.meetingData._room_id,
          type: this.common.params.meetingData._room_id ? 0 : 1,
          link: this.common.params.meetingData._link,
          host: { id: this.common.params.meetingData._host, name: this.common.params.meetingData.host },
          time: new Date(this.common.params.meetingData.schedule_time),
          duration: durationtime,
          buzz: this.common.params.meetingData._buzz,
          reqId: this.common.params.meetingData._refid
        }
      }
      console.log('after', this.meetingForm)
    }

    this.setTimeValues();
  }

  ngOnInit() {
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  datereset() {
    this.leaveArray.startDate = this.currentDate;
    this.leaveArray.endDate = this.currentDate;
  }

  setTimeValues() {
    this.hours = [];
    this.minutes = [];
    for (let i = 1; i <= 24; i++) {
      if (i.toString().length > 1) {
        this.hours.push({ isValidate: true, val: `${i}` });
      } else {
        this.hours.push({ isValidate: true, val: '0' + i });
      }
    }
    for (let i = 0; i < 60; i++) {
      if (i % 5 == 0) {
        if (i.toString().length > 1) {
          this.minutes.push({ isValidate: true, val: `${i}` });
        } else {
          this.minutes.push({ isValidate: true, val: '0' + i });
        }
      }
    }
  }

  getMeetingRoomList() {
    this.meetingRoomList = [];
    this.common.loading++;
    this.api.get("Admin/getMeetingRoomList").subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        this.meetingRoomList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getLastLeaveRequestData() {
    this.common.loading++;
    this.api.get("AdminTask/getLastLeaveRequestData").subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let lastDetail = (res['data'] && res['data'][0]) ? res['data'][0] : null;
        if (lastDetail) {
          let toUser = null;
          let ccUsers = [];
          if (this.userList.length > 0 && lastDetail.assignee_user_id) {
            toUser = this.userList.find(x => x.id == lastDetail.assignee_user_id);
          }
          if (this.userList.length > 0 && lastDetail.cc_users) {
            let ccUserIds = lastDetail.cc_users.split(",");
            ccUserIds.forEach(element => {
              let ccUser = this.userList.find(x => x.id == element);
              if (ccUser) {
                ccUsers.push(ccUser);
              }
            });
          }

          this.leaveArray.To = toUser;
          this.leaveArray.cc = ccUsers;
          console.log("leaveArray111:", this.leaveArray);
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

  requestLeave() {
    console.log("leaveArray:", this.leaveArray)
    let startDate = null;
    let endDate = null;
    if (this.leaveArray.type == 1) {
      startDate = this.leaveArray.startDate;
      endDate = this.leaveArray.endDate;
    } else {
      startDate = this.leaveArray.startDate;
      endDate = this.leaveArray.startDate;
    }

    if (!startDate || !endDate) {
      return this.common.showError("Start/End date is missing");
    } else if (startDate && startDate < this.common.getDate()) {
      return this.common.showError("Start date must be future date");
    }
    else if (endDate && endDate < startDate) {
      return this.common.showError("End date must be grater than start date");
    }

    let Datato = null;
    if (this.leaveArray.To) {
      Datato = this.leaveArray.To.id;
    }

    let CC = [];
    if (this.leaveArray.cc) {
      this.leaveArray.cc.map(ele => {
        CC.push({ user_id: ele.id });
      })
    }

    let params = {
      startDate: this.common.dateFormatter(startDate),
      endDate: this.common.dateFormatter(endDate),
      to: Datato,
      cc: JSON.stringify(CC),
      reason: this.leaveArray.reason,
      type: this.leaveArray.type
    }

    this.common.loading++;
    this.api.post('AdminTask/addLeaveRequest', params).subscribe(res => {
      console.log(res);
      this.common.loading--;
      if (res['code'] === 1) {
        if (res['data'][0]['y_id'] > 0) {
          // this.resetTask();
          this.common.showToast(res['data'][0].y_msg);
          this.closeModal(true);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    })
    console.log(params, 'updated');
  }

  addBroadcast() {
    if (!this.broadcast.subject) {
      return this.common.showError("Subject is missing");
    }
    if (!this.broadcast.endDate) {
      return this.common.showError("Date is missing");
    } else if (this.broadcast.endDate && this.broadcast.endDate < this.common.getDate()) {
      return this.common.showError("Date must be Current/future date");
    } else if (!this.broadcast.cc || !this.broadcast.cc.length) {
      return this.common.showError("User is missing");
    }

    let CC = [];
    if (this.broadcast.cc) {
      this.broadcast.cc.map(ele => {
        if (ele.groupId != null) {
          ele.groupuser.forEach(x2 => {
            CC.push({ user_id: x2._id });
          })
        } else {
          CC.push({ user_id: ele.id });
        }
      })
    }

    let params = {
      date: this.common.dateFormatter(this.broadcast.endDate),
      to: this.userService.loggedInUser.id,
      cc: JSON.stringify(CC),
      subject: this.broadcast.subject,
      desc: this.broadcast.desc,
      type: this.broadcast.type,
      chatFeature: this.broadcast.chatFeature
    }

    this.common.loading++;
    this.api.post('AdminTask/addBroadcast', params).subscribe(res => {
      console.log(res);
      this.common.loading--;
      if (res['code'] === 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeModal(true);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    })
  }

  selectedMeetingUser(event) {
    console.log("event:", event[event.length - 1]);
    if (event && event.length && !event[event.length - 1].groupId) {
      this.getUserPresence(event[event.length - 1].id);
    }
  }

  getUserPresence(userId) {
    this.common.loading++;
    this.api.get("Admin/getUserPresence.json?empId=" + userId).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        let userPresence = (res['data'] && res['data'].length) ? res['data'] : null;
        this.adduserConfirm(userPresence, userId)
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  adduserConfirm(userPresence, userId) {
    // console.log("userPresence:",userPresence);
    if (!userPresence) {
      this.common.params = {
        title: 'User Presence',
        description: '<b>The user has not started the shift for today.<br> Are you sure to add this user ?<b>'
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (!data.response) {
          this.meetingForm.cc = this.meetingForm.cc.filter(x => x.id !== userId);
        }
      });
    }
  }

  addMeeting() {
    // console.log("addmeeting:",this.meetingForm);
    if (!this.meetingForm.subject) {
      return this.common.showError("Subject is missing");
    } else if (!this.meetingForm.cc || !this.meetingForm.cc.length) {
      return this.common.showError("User is missing");
    } else if (!this.meetingForm.host.id) {
      return this.common.showError("Host user is missing");
    } else if (!this.meetingForm.time) {
      return this.common.showError("Meeting time is missing");
    } else if (this.meetingForm.time && this.meetingForm.time < this.common.getDate()) {
      return this.common.showError("Meeting time must be Current/future date");
    } else if (!this.meetingForm.duration) {
      return this.common.showError("Meeting duration is missing");
    } else if (!this.selectedTime.hh && this.selectedTime.hh.trim() == '') {
      return this.common.showError("Please check for available time slot");
    }

    
    this.meetingForm.time.setHours(parseInt(this.selectedTime.hh));
    this.meetingForm.time.setMinutes(parseInt(this.selectedTime.mm));

    let CC = [];
    if (this.meetingForm.cc) {
      this.meetingForm.cc.map(ele => {
        if (ele.groupId != null) {
          ele.groupuser.forEach(x2 => {
            CC.push({ id: x2._id });
          })
        } else {
          CC.push({ id: ele.id });
        }
      })
    }

    let params = {
      subject: this.meetingForm.subject,
      detail: this.meetingForm.desc,
      roomId: this.meetingForm.roomId,
      link: this.meetingForm.link,
      host: this.meetingForm.host.id,
      userId: JSON.stringify(CC),
      type: this.meetingForm.type,
      time: this.common.dateFormatter(this.meetingForm.time),
      duration: this.common.timeFormatter(this.meetingForm.duration),
      buzz: this.meetingForm.buzz,
      requestId: (this.meetingForm.reqId) ? this.meetingForm.reqId : null
    }
    // console.log("add meeting:",params); return false;
    if ((this.meetingForm.type == 1 && (!this.meetingForm.link || this.meetingForm.link.trim() == "")) || (!this.meetingForm.type || this.meetingForm.type == 0) && !this.meetingForm.roomId) {
      this.common.params = {
        title: 'Alert',
        description: `<b>${(this.meetingForm.type == 1) ? 'Meeting Link' : 'Meeting Room'} not available.<br>Create Anyway..`
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.saveMeeting(params);
        }
      });
    } else {
      this.saveMeeting(params);
    }

  }

  saveMeeting(params) {
    // return console.log('inside add meeting:', params);
    this.common.loading++;
    this.api.post('Admin/saveMeetingDetail', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] === 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.closeModal(true);
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    })
  }

  checkAvailability() {
    if (!this.meetingForm.cc || !this.meetingForm.cc.length) {
      return this.common.showError("User is missing");
    } else if (!this.meetingForm.host.id) {
      return this.common.showError("Host user is missing");
    } else if (!this.meetingForm.time) {
      return this.common.showError("Meeting time is missing");
    } else if ((!this.meetingForm.type || this.meetingForm.type == 0) && !this.meetingForm.roomId) {
      return this.common.showError("Meeting Room is missing");
    }

    let CC = [];
    if (this.meetingForm.cc) {
      this.meetingForm.cc.map(ele => {
        if (ele.groupId != null) {
          ele.groupuser.forEach(x2 => {
            CC.push({ id: x2._id });
          })
        } else {
          CC.push({ id: ele.id });
        }
      })
    }

    let params = {
      requestId: this.meetingForm.reqId,
      roomId: this.meetingForm.roomId,
      host: this.meetingForm.host.id,
      users: JSON.stringify(CC),
      date: this.common.dateFormatter1(this.meetingForm.time),
    }


    this.common.loading++;
    this.api.post('Admin/getMeetingSchedule', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] === 1) {
        console.log(res);
        console.log(this.hours, this.minutes);
        // this.selectedTime = { hh: '', mm: '' };
        this.busySchedules = (res['data'] && res['data'].length > 0) ? res['data'].map(timeranges => {
          let from = timeranges.meeting_time.split('T')[1];
          let to = timeranges.meeting_end_time.split('T')[1];
          return { slotFrom: { hh: from.split(':')[0], mm: from.split(':')[1] }, slotTo: { hh: to.split(':')[0], mm: to.split(':')[1] } }
        }) : [];

        console.log('slot recorded:', this.busySchedules);
        this.validateAvailability();
        this.showHours = true;
        document.getElementById('timePickerModalCustom').style.display = 'block';
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    })
  }

  validateAvailability() {
    console.log("selected time", this.selectedTime);
    this.setTimeValues();
    if (this.busySchedules && this.busySchedules.length) {
      // modified area else part : start
      this.busySchedules.forEach(schedule => {
        if (schedule.slotFrom['hh'] == schedule.slotTo['hh'] && schedule.slotTo['mm'] > 55) {
          let index = this.hours.findIndex(ele => ele.val == schedule.slotFrom['hh']);
          this.hours[index].isValidate = false;
          this.hours[index].scheduleOf = schedule.scheduleOf;
        } else if (schedule.slotFrom['hh'] < schedule.slotTo['hh']) {
          for (let i = schedule.slotFrom['hh']; i < schedule.slotTo['hh']; i++) {
            let index = this.hours.findIndex(ele => ele.val == i);
            this.hours[index].isValidate = false;
            this.hours[index].scheduleOf = schedule.scheduleOf;
          }

          if (schedule.slotTo['mm'] > 55) {
            let index = this.hours.findIndex(ele => ele.val == schedule.slotTo['hh']);
            this.hours[index].isValidate = false;
            this.hours[index].scheduleOf = schedule.scheduleOf;
          }
        }
      })
      // modified area else part : end

      if (this.selectedTime.hh && this.selectedTime.hh.trim() != '') {
        this.busySchedules.forEach(schedule => {
          if (schedule.slotFrom['hh'] == this.selectedTime.hh && schedule.slotFrom['hh'] == schedule.slotTo['hh']) {
            this.minutes.forEach(minute => {
              if (schedule.slotTo['mm'] >= minute.val && schedule.slotFrom['mm'] <= minute.val) {
                minute.isValidate = false;
                minute.scheduleOf = schedule.scheduleOf;
              }
            })
          } else if (schedule.slotTo['hh'] == this.selectedTime.hh) {
            console.log('schedule', schedule)
            this.minutes.forEach(minute => {
              console.log(schedule.slotTo['mm'], minute.val)
              if (schedule.slotTo['mm'] > minute.val) {
                minute.isValidate = false;
                minute.scheduleOf = schedule.scheduleOf;
              }
            })
          } else {
            // this.setTimeValues();
          }
        })
      } else {
        // let the code remain same ;don't touch it

        // this.busySchedules.forEach(schedule => {
        //   if (schedule.slotFrom['hh'] == schedule.slotTo['hh'] && schedule.slotTo['mm'] > 55) {
        //     let index = this.hours.findIndex(ele => ele.val == schedule.slotFrom['hh']);
        //     this.hours[index].isValidate = false;
        //     this.hours[index].scheduleOf = schedule.scheduleOf;
        //   } else if (schedule.slotFrom['hh'] < schedule.slotTo['hh']) {
        //     for (let i = schedule.slotFrom['hh']; i < schedule.slotTo['hh']; i++) {
        //       let index = this.hours.findIndex(ele => ele.val == i);
        //       this.hours[index].isValidate = false;
        //       this.hours[index].scheduleOf = schedule.scheduleOf;
        //     }

        //     if (schedule.slotTo['mm'] > 55) {
        //       let index = this.hours.findIndex(ele => ele.val == schedule.slotTo['hh']);
        //       this.hours[index].isValidate = false;
        //       this.hours[index].scheduleOf = schedule.scheduleOf;
        //     }
        //   }
        // })
      }
    }
    console.log(this.hours, this.minutes);
  }

  // setExptTimeFromCustomSelection(value, type) {
  //   if (type === 'hr') {
  //     this.validateAvailability();
  //     // this.meetingForm.time.setHours(value);
  //     this.showHours = false;
  //   }
  //   if (type === 'min') {
  //     // this.meetingForm.time.setMinutes(value);
  //     this.closeTimePickerModal();
  //   }
  // }
  closeTimePickerModal() {
    document.getElementById('timePickerModalCustom').style.display = 'none';
  }

}
