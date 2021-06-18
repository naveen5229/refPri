import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { scheduled } from 'rxjs';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { AvailableTimeSlotComponent } from '../available-time-slot/available-time-slot.component';
import { ConfirmComponent } from '../confirm/confirm.component';
import _ from 'lodash';
import * as moment from 'moment';
import { TaskMessageComponent } from '../task-message/task-message.component';

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
    parentId: null,
    subject: null,
    desc: null,
    cc: [],
    roomId: null,
    type: 0,
    link: null,
    host: { id: this.userService.loggedInUser.id, name: this.userService.loggedInUser.name },
    fromTime: this.common.getDate(),
    toTime: this.common.getDate(),
    duration: null,
    buzz: true,
    reqId: null
  }
  meetingRoomList = [];

  selectedTime = { from: { hh: null, mm: null }, to: { hh: null, mm: null } };
  showHours = false;
  hours = [];
  minutes = [];
  busySchedules = [];
  isSaveWithChat = null;

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
      if (this.common.params.meetingData && this.common.params.isEdit) {
        let durationtime = null;
        if (this.common.params.meetingData.duration && this.common.params.meetingData.schedule_time) {
          let timeduration = (this.common.params.meetingData.duration).split(':');
          durationtime = new Date();
          durationtime.setHours(timeduration[0]);
          durationtime.setMinutes(timeduration[1]);
          let scheduledTimeTO = moment(new Date(this.common.params.meetingData.schedule_time));
          scheduledTimeTO.add(parseInt(timeduration[0]), 'hours').hours();
          scheduledTimeTO.add(parseInt(timeduration[1]), 'minutes').minutes();
          console.log('toTime:', scheduledTimeTO);

          let scheduledTimeFromHr = new Date(this.common.params.meetingData.schedule_time).getHours();
          let scheduledTimeFromMin = new Date(this.common.params.meetingData.schedule_time).getMinutes();
          this.selectedTime = {
            from: {
              hh: `${scheduledTimeFromHr}`,
              mm: `${scheduledTimeFromMin}`
            },
            to: {
              hh: `${scheduledTimeTO.format('HH')}`,
              mm: `${scheduledTimeTO.format('mm')}`
            }
          };
        }

        console.log('Duration:', durationtime, 'selectedTime:', this.selectedTime)

        this.meetingForm = {
          parentId: null,
          subject: this.common.params.meetingData.subject,
          desc: this.common.params.meetingData._desc,
          cc: JSON.parse(JSON.stringify(this.common.params.meetingData._user)),
          roomId: this.common.params.meetingData._room_id,
          type: this.common.params.meetingData._room_id ? 0 : 1,
          link: this.common.params.meetingData._link,
          host: { id: this.common.params.meetingData._host, name: this.common.params.meetingData.host },
          fromTime: (this.common.params.meetingData.schedule_time) ? new Date(this.common.params.meetingData.schedule_time) : null,
          toTime: (this.common.params.meetingData.schedule_time) ? new Date(this.common.params.meetingData.schedule_time) : this.common.getDate(),
          duration: durationtime,
          buzz: this.common.params.meetingData._buzz,
          reqId: this.common.params.meetingData._refid
        }
        console.log(this.meetingForm)
      } else if (this.common.params.meetingData && !this.common.params.isEdit) {
        this.meetingForm.parentId = this.common.params.meetingData._refid;
        this.meetingForm.subject = this.common.params.meetingData.subject;
        this.meetingForm.desc = this.common.params.meetingData._desc;
        this.meetingForm.cc = this.common.params.meetingData._user;
        this.meetingForm.roomId = this.common.params.meetingData._room_id;
        this.meetingForm.type = this.common.params.meetingData._room_id ? 0 : 1;
        this.meetingForm.link = this.common.params.meetingData._link;
        this.meetingForm.host = { id: this.common.params.meetingData._host, name: this.common.params.meetingData.host };
        this.meetingForm.buzz = this.common.params.meetingData._buzz;
      }
      console.log('after', this.meetingForm)
    }

    this.setTimeValues();
  }

  ngOnInit() {
  }

  eventPropogate(event) {
    event.stopPropagation();
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
        this.hours.push({ isValidate: true, val: `${i}`, roomId: false });
      } else {
        this.hours.push({ isValidate: true, val: '0' + i, roomId: false });
      }
    }
    for (let i = 0; i < 60; i++) {
      if (i % 5 == 0) {
        if (i.toString().length > 1) {
          this.minutes.push({ isValidate: true, val: `${i}`, roomId: false });
        } else {
          this.minutes.push({ isValidate: true, val: '0' + i, roomId: false });
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

  addMeeting(isChat = null) {
    this.isSaveWithChat = isChat;
    console.log("addmeeting:", this.meetingForm);
    if (this.meetingForm.fromTime && this.selectedTime.from.hh) {
      this.meetingForm.fromTime.setHours(parseInt(this.selectedTime.from.hh));
      this.meetingForm.fromTime.setMinutes(parseInt(this.selectedTime.from.mm));
      this.meetingForm.toTime.setHours(parseInt(this.selectedTime.to.hh));
      this.meetingForm.toTime.setMinutes(parseInt(this.selectedTime.to.mm));
    }
    if (!this.meetingForm.subject) {
      return this.common.showError("Subject is missing");
    } else if (!this.meetingForm.cc || !this.meetingForm.cc.length) {
      return this.common.showError("User is missing");
    } else if (!this.meetingForm.host.id) {
      return this.common.showError("Host user is missing");
    } else if (this.meetingForm.fromTime && !this.selectedTime.from.hh && (!this.selectedTime.from.hh || this.selectedTime.from.hh.trim() == '')) {
      return this.common.showError("Please check for available time slot");
    } else if (this.meetingForm.fromTime && this.meetingForm.fromTime < new Date()) {
      return this.common.showError("Meeting time must be Current/future time");
    }
    //  else if (!this.meetingForm.duration) {
    //   return this.common.showError("Meeting duration is missing");
    // } 
    //  else if (!this.meetingForm.fromTime) {
    //   return this.common.showError("Meeting time is missing");
    // }

    console.log('before setting time:', this.selectedTime)
    // if (this.meetingForm.fromTime) {
    //   this.meetingForm.fromTime.setHours(parseInt(this.selectedTime.from.hh));
    //   this.meetingForm.fromTime.setMinutes(parseInt(this.selectedTime.from.mm));
    //   this.meetingForm.toTime.setHours(parseInt(this.selectedTime.to.hh));
    //   this.meetingForm.toTime.setMinutes(parseInt(this.selectedTime.to.mm));
    // }

    let CC = [];
    if (this.meetingForm.cc) {
      this.meetingForm.cc.map(ele => {
        if (ele.groupId != null) {
          ele.groupuser.forEach(x2 => {
            CC.push({ id: x2._id, name: x2.name });
          })
        } else {
          CC.push({ id: ele.id, name: ele.name });
        }
      })
    }

    let params = {
      checkPresent: 1,
      parentId: this.meetingForm.parentId,
      subject: this.meetingForm.subject,
      detail: this.meetingForm.desc,
      roomId: this.meetingForm.roomId,
      link: this.meetingForm.link,
      host: this.meetingForm.host.id,
      userId: JSON.stringify(CC),
      type: this.meetingForm.type,
      time: this.meetingForm.fromTime ? this.common.dateFormatter(this.meetingForm.fromTime) : null,
      duration: this.meetingForm.duration ? this.common.timeFormatter(this.meetingForm.duration) : null,
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
          if (this.isSaveWithChat == 1) {
            let ticketEditData = {
              ticketData: null,
              ticketId: res['data'][0]['y_tktid'],
              statusId: 0,
              lastSeenId: null,
              taskId: null,
              taskType: 110,
              tabType: null,
            };
            let subTitle = params.subject + ":<br>" + params.detail;
            this.ticketMessage(ticketEditData, subTitle);
          }
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else if (res['code'] === -99) {
        this.common.params = {
          title: 'User Availability',
          description: `<b>${res['msg']}`
        }
        const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
        activeModal.result.then(data => {
          if (data.response) {
            params.checkPresent = 0;
            this.saveMeeting(params);
          }
        });
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    })
  }

  checkAvailability() {
    console.log("checkAvailability:", this.meetingForm)
    if (!this.meetingForm.cc || !this.meetingForm.cc.length) {
      return this.common.showError("User is missing");
    } else if (!this.meetingForm.host.id) {
      return this.common.showError("Host user is missing");
    } else if ((!this.meetingForm.type || this.meetingForm.type == 0) && !this.meetingForm.roomId) {
      return this.common.showError("Meeting Room is missing");
    } else if (!this.meetingForm.fromTime) {
      return this.common.showError("Meeting Date is missing");
    }
    this.meetingForm.toTime.setDate(this.meetingForm.fromTime.getDate());
    this.meetingForm.toTime.setMonth(this.meetingForm.fromTime.getMonth());
    this.meetingForm.toTime.setFullYear(this.meetingForm.fromTime.getFullYear());

    let CC = [];
    if (this.meetingForm.cc) {
      this.meetingForm.cc.map(ele => {
        if (ele.groupId != null) {
          ele.groupuser.forEach(x2 => {
            CC.push({ id: x2._id, name: x2.name });
          })
        } else {
          CC.push({ id: ele.id, name: ele.name });
        }
      })
    }
    console.log('CC inserted............', CC);

    let params = {
      requestId: this.meetingForm.reqId,
      roomId: this.meetingForm.roomId,
      host: this.meetingForm.host.id,
      users: JSON.stringify(CC),
      date: this.common.dateFormatter1(this.meetingForm.fromTime),
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
          return { userid: (timeranges.userid) ? timeranges.userid : timeranges.room_id, slotFrom: { hh: from.split(':')[0], mm: from.split(':')[1] }, slotTo: { hh: to.split(':')[0], mm: to.split(':')[1] }, roomId: timeranges.room_id, name: timeranges.user_name, is_todo: timeranges.is_todo }
        }) : [];


        let preBookedScheduler: any = [];
        let userHostUsersList = JSON.parse(JSON.stringify(CC));
        if (this.meetingForm.roomId) {
          this.meetingRoomList.map(data => {
            if (data._id == this.meetingForm.roomId) userHostUsersList.push({ id: data._id, name: data.room_name })
          });
        }
        console.log('userHostUsersList.........', userHostUsersList);
        userHostUsersList.push(this.meetingForm.host);
        let uniqueUsers = this.common.arrayUnique(userHostUsersList, 'id');
        if (this.busySchedules && this.busySchedules.length > 0) {
          let groupUser = _.groupBy(this.busySchedules, 'name');
          console.log(groupUser)
          Object.keys(groupUser).map(key => {
            console.log(key);
            if (groupUser[key] && groupUser[key].length > 0) {
              console.log(groupUser[key]);
              preBookedScheduler.push({ userid: groupUser[key][0].userid, name: key, schedule: [], option: { floor: 7, ceil: 22, step: 0.05, showTicks: true, disabled: true }, detaildIcon:true });
              console.log(preBookedScheduler);
              groupUser[key].map(schedule => {
                let slotFrom = null;
                let slotTo = null;
                switch (schedule.slotFrom['mm']) {
                  case '15': slotFrom = (schedule.slotFrom['hh'] + '.25'); break;
                  case '30': slotFrom = (schedule.slotFrom['hh'] + '.50'); break;
                  case '45': slotFrom = (schedule.slotFrom['hh'] + '.75'); break;
                  default: slotFrom = schedule.slotFrom['hh'];
                }
                switch (schedule.slotTo['mm']) {
                  case '15': slotTo = (schedule.slotTo['hh'] + '.25'); break;
                  case '30': slotTo = (schedule.slotTo['hh'] + '.50'); break;
                  case '45': slotTo = (schedule.slotTo['hh'] + '.75'); break;
                  default: slotTo = schedule.slotTo['hh'];
                }
                console.log(slotFrom, slotTo);
                preBookedScheduler.forEach(data => {
                  if (data.name === key) data.schedule.push({ fromTime: slotFrom, toTime: slotTo, is_todo: schedule.is_todo })
                });
              })
            }
          });

          if (preBookedScheduler && uniqueUsers && preBookedScheduler.length < uniqueUsers.length) {
            let presentStatus = [];
            preBookedScheduler.map(data => presentStatus.push(data.userid));
            console.log(presentStatus, uniqueUsers);
            uniqueUsers.map(user => {
              if (presentStatus.includes(user['id'])) return;
              preBookedScheduler.push({ userid: user['id'], name: user['name'].split('-')[0], schedule: [{ fromTime: null, toTime: null, is_todo: 0 }], option: { floor: 7, ceil: 22, step: 0.05, showTicks: true, disabled: true }, detaildIcon:true });
            })
          }
        } else {
          uniqueUsers.map(user => {
            preBookedScheduler.push({ userid: user['id'], name: user['name'].split('-')[0], schedule: [{ fromTime: null, toTime: null, is_todo: 0 }], option: { floor: 7, ceil: 22, step: 0.05, showTicks: true, disabled: true }, detaildIcon:true });
          });
        }

        console.log('preBookedScheduler:', preBookedScheduler);
        preBookedScheduler.map(data => data.option.translate = (value: number): string => {
          switch (value - parseInt(JSON.stringify(value))) {
            case 0.25: return `${parseInt(JSON.stringify(value))}.15`; break;
            case 0.5: return `${parseInt(JSON.stringify(value))}.30`; break;
            case 0.75: return `${parseInt(JSON.stringify(value))}.45`; break;
            default: return `${parseInt(JSON.stringify(value))}`;
          }
        })

        this.availableSlot(preBookedScheduler);

        console.log('slot recorded:', preBookedScheduler, this.busySchedules);
        // this.validateAvailability();
        // this.showHours = true;
        // document.getElementById('timePickerModalCustom').style.display = 'block';
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
    })
  }

  // validateAvailability() {
  //   console.log("selected time", this.selectedTime);
  //   this.setTimeValues();
  //   if (this.busySchedules && this.busySchedules.length) {
  //     // modified area else part : start
  //     this.busySchedules.forEach(schedule => {
  //       if (schedule.slotFrom['hh'] == schedule.slotTo['hh'] && schedule.slotFrom['mm'] == 0 && schedule.slotTo['mm'] > 55) {
  //         console.log(`schedule.slotFrom['hh'] == schedule.slotTo['hh'] && schedule.slotFrom['mm'] == 0 && schedule.slotTo['mm'] > 55`);
  //         let index = this.hours.findIndex(ele => ele.val == schedule.slotFrom['hh']);
  //         this.hours[index].isValidate = false;
  //         this.hours[index].roomId = (schedule.roomId) ? true : false;
  //       } else if (schedule.slotFrom['hh'] < schedule.slotTo['hh']) {
  //         if (schedule.slotFrom['mm'] == 0) {
  //           console.log(`schedule.slotFrom['hh'] < schedule.slotTo['hh'] && schedule.slotFrom['mm'] == 0`);
  //           for (let i = schedule.slotFrom['hh']; i < schedule.slotTo['hh']; i++) {
  //             let index = this.hours.findIndex(ele => ele.val == i);
  //             this.hours[index].isValidate = false;
  //             this.hours[index].roomId = (schedule.roomId) ? true : false;
  //           }
  //         } else if ((parseInt(schedule.slotTo['hh']) - parseInt(schedule.slotFrom['hh'])) > 1 && schedule.slotFrom['mm'] > 0) {
  //           console.log(`schedule.slotFrom['hh'] < schedule.slotTo['hh'] && schedule.slotFrom['mm'] > 0`);
  //           for (let i = parseInt(schedule.slotFrom['hh']) + 1; i < schedule.slotTo['hh']; i++) {
  //             let index = this.hours.findIndex(ele => ele.val == i);
  //             this.hours[index].isValidate = false;
  //             this.hours[index].roomId = (schedule.roomId) ? true : false;
  //           }
  //         }

  //         if (schedule.slotTo['mm'] > 55) {
  //           let index = this.hours.findIndex(ele => ele.val == schedule.slotTo['hh']);
  //           this.hours[index].isValidate = false;
  //           this.hours[index].roomId = (schedule.roomId) ? true : false;
  //         }
  //       }
  //     })
  //     // modified area else part : end

  //     if (this.selectedTime.hh && this.selectedTime.hh.trim() != '') {
  //       this.busySchedules.forEach(schedule => {
  //         if (schedule.slotFrom['hh'] == this.selectedTime.hh && schedule.slotFrom['hh'] == schedule.slotTo['hh']) {
  //           console.log(`schedule.slotFrom['hh'] == this.selectedTime.hh && schedule.slotFrom['hh'] == schedule.slotTo['hh']`);
  //           this.minutes.forEach(minute => {
  //             if (schedule.slotTo['mm'] >= minute.val && schedule.slotFrom['mm'] <= minute.val) {
  //               minute.isValidate = false;
  //               minute.roomId = (schedule.roomId) ? true : false;
  //             }
  //           })
  //         } else if (schedule.slotFrom['hh'] == this.selectedTime.hh && schedule.slotFrom['hh'] < schedule.slotTo['hh']) {
  //           if (schedule.slotFrom['hh'] == 0) {
  //             console.log(`schedule.slotFrom['hh'] == this.selectedTime.hh && schedule.slotFrom['hh'] < schedule.slotTo['hh'] && schedule.slotFrom['hh'] == 0`);
  //             this.minutes.forEach(minute => {
  //               minute.isValidate = false;
  //               minute.roomId = (schedule.roomId) ? true : false;
  //             })
  //           } else {
  //             console.log(`schedule.slotFrom['hh'] == this.selectedTime.hh && schedule.slotFrom['hh'] < schedule.slotTo['hh'] && schedule.slotFrom['hh'] > 0`);
  //             this.minutes.forEach(minute => {
  //               if (schedule.slotTo['mm'] < minute.val) {
  //                 minute.isValidate = false;
  //                 minute.roomId = (schedule.roomId) ? true : false;
  //               }
  //             })
  //           }
  //         } else if (schedule.slotFrom['hh'] < this.selectedTime.hh && schedule.slotTo['hh'] > this.selectedTime.hh) {
  //           console.log(`schedule.slotFrom['hh'] < this.selectedTime.hh && schedule.slotTo['hh'] > this.selectedTime.hh`);
  //           this.minutes.forEach(minute => {
  //             minute.isValidate = false;
  //             minute.roomId = (schedule.roomId) ? true : false;
  //           })
  //         } else if (schedule.slotTo['hh'] == this.selectedTime.hh) {
  //           console.log('end date selected', schedule)
  //           this.minutes.forEach(minute => {
  //             console.log(schedule.slotTo['mm'], minute.val)
  //             if (schedule.slotTo['mm'] > minute.val) {
  //               minute.isValidate = false;
  //               minute.roomId = (schedule.roomId) ? true : false;
  //             }
  //           })
  //         } else {
  //           // this.setTimeValues();
  //         }
  //       })
  //     } else {
  //       // let the code remain same ;don't touch it

  //       // this.busySchedules.forEach(schedule => {
  //       //   if (schedule.slotFrom['hh'] == schedule.slotTo['hh'] && schedule.slotTo['mm'] > 55) {
  //       //     let index = this.hours.findIndex(ele => ele.val == schedule.slotFrom['hh']);
  //       //     this.hours[index].isValidate = false;
  //       //     this.hours[index].scheduleOf = schedule.scheduleOf;
  //       //   } else if (schedule.slotFrom['hh'] < schedule.slotTo['hh']) {
  //       //     for (let i = schedule.slotFrom['hh']; i < schedule.slotTo['hh']; i++) {
  //       //       let index = this.hours.findIndex(ele => ele.val == i);
  //       //       this.hours[index].isValidate = false;
  //       //       this.hours[index].scheduleOf = schedule.scheduleOf;
  //       //     }

  //       //     if (schedule.slotTo['mm'] > 55) {
  //       //       let index = this.hours.findIndex(ele => ele.val == schedule.slotTo['hh']);
  //       //       this.hours[index].isValidate = false;
  //       //       this.hours[index].scheduleOf = schedule.scheduleOf;
  //       //     }
  //       //   }
  //       // })
  //     }
  //   }
  //   console.log(this.hours, this.minutes);
  // }

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

  availableSlot(preBookedScheduler) {
    console.log('today', this.common.getDate().getDate(), 'selected date', this.meetingForm.fromTime.getDate())
    this.common.params = {
      title: 'User Availability',
      preBookedScheduler: preBookedScheduler,
      selectedTime: this.selectedTime,
      timeRestrict: (this.meetingForm.fromTime.getDate() <= this.common.getDate().getDate()) ? true : false,
    }
    const activeModal = this.modalService.open(AvailableTimeSlotComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        console.log('modal Works', data);
        this.selectedTime.from = data.range.from;
        this.selectedTime.to = data.range.to;

        let duration = new Date();
        duration.setHours(data.range.duration.hh);
        duration.setMinutes(data.range.duration.mm);
        this.meetingForm.duration = duration;
        // this.saveMeeting(params);
      }
    });
  }

  ticketMessage(ticketEditData, subTitle) {
    this.common.params = {
      ticketEditData,
      title: "Meeting Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.userList,
      groupList: this.userGroupList,
    };
    const activeModal = this.modalService.open(TaskMessageComponent, { size: "xl", container: "nb-layout", backdrop: "static" });
  }

}
