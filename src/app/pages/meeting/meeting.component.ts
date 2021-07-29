import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApplyLeaveComponent } from '../../modals/apply-leave/apply-leave.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { TaskMessageComponent } from '../../modals/task-message/task-message.component';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/angular';
import * as moment from 'moment';
import { param } from 'jquery';

@Component({
  selector: 'ngx-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit {
  scheduleType:any = '0';
  searchTerm = '';
  windowType = 'meetings';
  currentDate = new Date();
  filterEnabled:boolean = false;
  schedule = {
    time: moment(),
    endTime: moment().add(30, 'days'),
    user: { id: this.userService._details.id, name: this.userService._details.name },
    room: { id: null, name: null }
  }
  TODAY_STR = new Date().toISOString().replace(/T.*$/, '');
  // INITIAL_EVENTS: EventInput[] = [
  //   {
  //     id: this.createEventId(),
  //     title: 'All-day event',
  //     start: this.TODAY_STR
  //   },
  //   {
  //     id: this.createEventId(),
  //     title: 'Timed event',
  //     start: this.TODAY_STR + 'T12:00:00'
  //   }
  // ];
  currentEvents: EventApi[] = [];
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridDay',
    weekends: true,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'timeGridDay,dayGridMonth,timeGridWeek'
    },
    slotMinTime: '09:00:00',
    slotMaxTime: '24:00:00',
    // initialEvents: this.INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    events: [],
    // editable: true,
    // selectable: true,
    // selectMirror: true,
    // dayMaxEvents: true,
    // select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
     eventMouseEnter: this.handleMouseEnter.bind(this),
    eventMouseLeave: this.handleMouseLeave.bind(this)
  };



  colorCodes = {
    background: ['#B0E0E6', '#FFE4E1', '#98FB98', '#FFB6C1'],
  }
  isSearch = false;
  loggedInUser = null;
  adminList = [];
  groupList = [];
  departmentList = [];
  meetingData = {
    startDate: this.common.getDate(-2),
    endDate: this.common.getDate(),
    pastData: [],
    upcomingData: []
  }

  meetingDataForFilter = {
    pastData: [],
    upcomingData: []
  }
  roomList = [];
  meetingAttendiesList = [];
  holdForFollowUp = {};
  entityTypes = [];
  allEntities = [];
  filteredEnitity = [];
  advFldForMtngCmplt = { is_external: false, mapped_refid: null }
  selectAvailability = "Select User";
  @HostListener('document:click', ['$event'])
  clickout(event) {
    console.log('event triggered:', event);
    if ((event.target.innerText >= 1 && event.target.innerText <= 10000) || event.target.innerText == 'Cancel' || event.target.innerText == 'Set' || ['feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].includes(event.target.innerText.toLowerCase())) return;
    if (document.getElementById('pastfilterPop')) document.getElementById('pastfilterPop').style.display = 'none';
  }

  constructor(public common: CommonService,
    public userService: UserService, public api: ApiService, public modalService: NgbModal,) {
    console.log('this.calendarOptions',this.calendarOptions)
    this.loggedInUser = this.userService._details.id;
    this.getAllAdmin();
    this.getUserGroupList();
    this.getMeetingListByType([0, 1]);
    this.getEntityDetails();
    this.getRoomList();
    this.common.refresh = this.refresh.bind(this);
  }

  ngOnInit() {
 console.log('calendarOptions',this.calendarOptions);
  }

  refresh() {
    this.getAllAdmin();
    this.getUserGroupList();
    this.getMeetingListByType([0, 1]);
    this.getRoomList();
  }

  propogateEvent(event) {
    event.stopPropagation();
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: this.createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  handleMouseEnter(event) {
    console.log(event, event.event._def);
    var tooltip = document.getElementById('tooltipText');
    tooltip.innerText = event.event._def.title;

    var ele = document.getElementById('tooltipPos');
    console.log(event.jsEvent.x, event.jsEvent.y)
    ele.style.top = `${event.jsEvent.y - 150}px`;
    ele.style.left = `${event.jsEvent.x - 150}px`;
    ele.style.visibility = 'visible';
  }

  handleMouseLeave(event) {
    var ele = document.getElementById('tooltipPos');
    ele.style.visibility = 'hidden';
  }

  createEventId() {
    let eventGuid = 0;
    return String(eventGuid++);
  }

  handleEventClick(clickInfo: EventClickArg) {
  console.log('clickInfo: ', clickInfo);
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
    console.log(clickInfo)
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    // events.
    console.log(this.currentEvents)
  }



  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(
      (res) => {
        if (res["code"] > 0) {
          let adminList = res["data"] || [];
          console.log('adminList',adminList);
          this.adminList = adminList.map((x) => {
            return { id: x.id, name: x.name + " - " + x.department_name };
          });
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

  getEntityDetails() {
    this.api.get('Entities/getEntityTypes').subscribe(res => {
      if (res['code'] == 1) {
        this.entityTypes = res['data'];
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.common.showError();
    });

    this.api.get('Entities/getEntities').subscribe(res => {
      if (res['code'] == 1) {
        this.allEntities = res['data'];
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.common.showError();
    });
  }

  getUserGroupList() {
    this.api.get('UserRole/getUserGroups')
      .subscribe(
        (res) => {
          console.log(" Group data", res["data"]);
          if (res["code"] > 0) {
            let groupList = res['data'] || [];
            this.groupList = groupList.map((x) => {
              return { id: x._id, name: x.name, groupId: x._id, groupuser: x._employee };
            });
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.showError();
          console.log("Error: ", err);
        });
  }

  getRoomList() {
    this.api.get('Admin/getMeetingRoomList')
      .subscribe(
        (res) => {
          console.log(" Group data", res["data"]);
          if (res["code"] > 0) {
            let meetingRooms = res['data'] || [];
            this.roomList = meetingRooms.map((x) => {
              return { id: x._id, name: x.room_name };
            });
            this.schedule.room = this.roomList[0];
            console.log(this.schedule.room, this.roomList)
          } else {
            this.common.showError(res["msg"]);
          }
        },
        (err) => {
          this.common.showError();
          console.log("Error: ", err);
        });
  }

  getDepartmentList() {
    this.api.get("Admin/getDepartmentList.json").subscribe(
      (res) => {
        if (res["code"] > 0) {
          this.departmentList = res["data"] || [];
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

  getMeetingsDefault() {
    this.meetingData = {
      startDate: this.common.getDate(-2),
      endDate: this.common.getDate(),
      pastData: [],
      upcomingData: []
    }
    this.getMeetingListByType([0, 1])
  }

  getMeetingListByType(type, startDate = null, endDate = null) {
    if (this.meetingData.startDate && this.meetingData.endDate) {
      startDate = this.common.dateFormatter(this.meetingData.startDate);
      endDate = this.common.dateFormatter(this.meetingData.endDate);
    }
    type.map(type => {
      // if (type == 1) startDate = endDate;
      this.getMeetings(type, startDate, endDate)
    });
  }

deleteMeeting(index:number){
this.meetingData.upcomingData.splice(index,1);
}


  // index = 0;
  getMeetings(type, startDate, endDate) {
    this.common.loading++;
    let params = "?type=" + type + "&startDate=" + ((type == 1) ? this.common.dateFormatter(this.currentDate) : startDate) + "&endDate=" + ((type == 1) ? this.common.dateFormatter(this.currentDate) : endDate);
    this.api.get("Admin/getMeetingListByType" + params).subscribe(
      (res) => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        if (!type) {
          this.meetingData.pastData = res['data'] || [];
          console.log('this.meetingData.pastData: ', this.meetingData.pastData);
        } else {
          this.meetingData.upcomingData = res['data'] || [];
        }

        let indexpastData = 0;
        let indexUpcomingData = 0;
        for (let i = 0; i < this.meetingData.pastData.length; i++) {
          this.meetingData.pastData[i]["task_subject"] = this.meetingData.pastData[i]["subject"];
          this.meetingData.pastData[i]["_task_desc"] = this.meetingData.pastData[i]["_desc"];
          this.meetingData.pastData[i]["colorCode"] = this.colorCodes.background[indexpastData];
          if (indexpastData == 3) { indexpastData = 0 } else { indexpastData = indexpastData + 1 };
        }

        for (let i = 0; i < this.meetingData.upcomingData.length; i++) {
          this.meetingData.upcomingData[i]["task_subject"] = this.meetingData.upcomingData[i]["subject"];
          this.meetingData.upcomingData[i]["_task_desc"] = this.meetingData.upcomingData[i]["_desc"];
          this.meetingData.upcomingData[i]["colorCode"] = this.colorCodes.background[indexUpcomingData];
          if (indexUpcomingData == 3) { indexUpcomingData = 0 } else { indexUpcomingData = indexUpcomingData + 1 };
        }
        this.meetingDataForFilter.pastData = this.meetingData.pastData;
        this.meetingDataForFilter.upcomingData = this.meetingData.upcomingData;
        this.filterEnabled = false;
      },
      (err) => {
        this.common.loading--;
        this.common.showError();
        console.log("Error: ", err);
      }
    );
  }

  addMetting(formType) {
    let title = "Add Meeting";
    let btn = "Save";
    this.common.params = {
      meetingData: null,
      userList: this.adminList,
      groupList: this.groupList,
      formType: `${formType}`,
      title: title,
      btn: btn
    };
    const activeModal = this.modalService.open(ApplyLeaveComponent, {
      size: "md",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        if (formType == 2) {
          this.getMeetingListByType([0, 1]);
        }
      }
    });
  }


  changeTicketStatusWithConfirm(ticket, type, status) {
    console.log(status, 'status')
    if (ticket._refid) {
      let preTitle = "Complete";
      if (!status) {
        preTitle = "Re-Active";
      } else if (status === -1) {
        preTitle = "Reject";
      } else if (status == 3) {
        preTitle = "Hold";
      } else if (ticket._status == 3) {
        preTitle = "Unhold";
      }
      this.common.params = {
        title: preTitle + " Task ",
        description:
          `<b>&nbsp;` + "Are You Sure To " + preTitle + " This Task" + `<b>`,
        isRemark: status == 3 ? true : false,
      };
      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        console.log("Confirm response:", data);
        if (data.response) {
          this.updateTicketStatus(ticket, type, status, data.remark);
        }
      });
    } else {
      this.common.showError("Task ID Not Available");
    }
  }

  editMeeting(ticket, type, isEdit) {
    console.log("🚀 ~ file: task.component.ts ~ line 3333 ~ TaskComponent ~ editMeeting ~ ticket", ticket)
    this.common.params = {
      isEdit: isEdit,
      meetingData: ticket,
      userList: this.adminList,
      groupList: this.groupList,
      formType: '2',
      title: isEdit ? (ticket._meeting_type != 2 ? 'Edit Meeting' : 'Edit ToDo') : 'Add Meeting',
      btn: 'Save'
    };
    const activeModal = this.modalService.open(ApplyLeaveComponent, {
      size: "md",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      if (data.response) {
        if (!isEdit && type != 0) {
          this.updateTicketStatus(ticket, type, 5);
        } else {
          this.getMeetingListByType([0, 1]);
        }
      }
    });
  }

  updateTicketStatus(ticket, type, status, remark = null) {
    console.log(this.advFldForMtngCmplt)
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        statusId: status,
        statusOld: ticket._status,
        remark: remark,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
        isExternal: this.advFldForMtngCmplt.is_external,
        mappedRefid: this.advFldForMtngCmplt.mapped_refid
      };
      // if (status != -1) this.collapseUnreadTaskUpdateStatus(type, ticket, status);
      // console.log("params:", params, ticket, this.unreadTaskForMeList); return false;
      // this.common.loading++;
      this.api.post("AdminTask/updateTicketStatus", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            this.getMeetingListByType([0, 1]);
          } else {
            this.common.showError(res["msg"]);
          }
          this.advFldForMtngCmplt = { is_external: false, mapped_refid: null }
        },
        (err) => {
          // this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  ticketMessage(ticket, type) {
    console.log('ticket', ticket)
    let ticketEditData = {
      ticketData: ticket,
      ticketId: ticket._tktid,
      statusId: ticket._status,
      lastSeenId: ticket._lastreadid,
      taskId:
        ticket._tktype == 101 || ticket._tktype == 102 ? ticket._refid : null,
      taskType: ticket._tktype,
      tabType: type,
      isChecked: ticket._is_star_mark
    };

    let subTitle = ticket.task_subject + ((ticket._task_desc) ? ":<br>" + ticket._task_desc : '');
    this.common.params = {
      ticketEditData,
      title: "Ticket Comment",
      button: "Save",
      subTitle: subTitle,
      userList: this.adminList,
      groupList: this.groupList,
      departmentList: this.departmentList
    };
    const activeModal = this.modalService.open(TaskMessageComponent, {
      size: "xl",
      container: "nb-layout",
      backdrop: "static",
    });
    activeModal.result.then((data) => {
      // if (ticket._cc_user_id && !ticket._cc_status) {
      //   this.updateMeetingStatus(ticket, type);
      // }
      this.getMeetingListByType([0, 1]);
    });
  }

  updateMeetingStatus(ticket, type, statusType) {
    console.log(ticket);
    if (type == 'upcoming') {
      if ((ticket._tktype == 110 && ticket._mp_status == 0) && (ticket._status == 0 && ticket._host == this.userService.loggedInUser.id)) {
        if (statusType == 'ack') {
          this.updateAsCcUser(ticket, 1);
          this.updateTicketStatus(ticket, 0, 2);
        } else if (statusType == 'reject') {
          this.updateAsCcUser(ticket, -1);
          this.updateTicketStatus(ticket, 0, -1);
        }
      } else {
        if (ticket._tktype == 110 && ticket._mp_status == 0) {
          if (statusType == 'ack') {
            this.updateAsCcUser(ticket, 1);
          } else if (statusType == 'reject') {
            this.updateAsCcUser(ticket, -1);
          }
        } else if (ticket._status == 0 && ticket._host == this.userService.loggedInUser.id) {
          if (statusType == 'ack') {
            this.updateTicketStatus(ticket, 0, 2);
          } else if (statusType == 'reject') {
            this.updateTicketStatus(ticket, 0, -1);
          }
        }
      }
    } else if (type == 'past') {
      if ((ticket._tktype == 110 && ticket._mp_status != -1) && (ticket._status != -1 && ticket._host == this.userService.loggedInUser.id)) {
        if (statusType == 'ack') {
          this.updateAsCcUser(ticket, 1);
          this.updateTicketStatus(ticket, 0, 2);
        } else if (statusType == 'reject') {
          this.updateAsCcUser(ticket, -1);
          this.updateTicketStatus(ticket, 0, -1);
        }
      } else {
        if (ticket._tktype == 110 && ticket._mp_status != -1) {
          if (statusType == 'ack') {
            this.updateAsCcUser(ticket, 1);
          } else if (statusType == 'reject') {
            this.updateAsCcUser(ticket, -1);
          }
        } else if (ticket._status != -1 && ticket._host == this.userService.loggedInUser.id) {
          if (statusType == 'ack') {
            this.updateTicketStatus(ticket, 0, 2);
          } else if (statusType == 'reject') {
            this.updateTicketStatus(ticket, 0, -1);
          }
        }
      }
    }


  }

  updateAsCcUser(ticket, status) {
    if (ticket._tktid) {
      let params = {
        ticketId: ticket._tktid,
        taskId: ticket._refid,
        ticketType: ticket._tktype,
        status: status,
        userName: this.userService.loggedInUser.name
      };
      this.api.post("AdminTask/ackTaskByCcUser", params).subscribe(
        (res) => {
          // this.common.loading--;
          if (res["code"] > 0) {
            this.getMeetingListByType([0, 1]);
          } else {
            this.common.showError(res["data"]);
          }
        },
        (err) => {
          // this.common.loading--;
          this.common.showError();
          console.log("Error: ", err);
        }
      );
    } else {
      this.common.showError("Ticket ID Not Available");
    }
  }

  attendanceFieldShow = false;
  getUserActivityUpdate(ticket, type, status) {
    this.holdForFollowUp = { ticket: ticket, type: type, status: status };
    this.common.params = {
      title: "Status Type",
      description: `<b>&nbsp;` + `${ticket._meeting_type != 2 ? 'Meeting is External?' : 'To-Do is External?'} ` + `<b>`,
      btn1: 'Yes',
      btn2: 'No'
    };

    const activeModal = this.modalService.open(ConfirmComponent, {
      size: "sm",
      container: "nb-layout",
      backdrop: "static",
      keyboard: false,
      windowClass: "accountModalClass",
    });
    activeModal.result.then((data) => {
      // return console.log(data)
      this.advFldForMtngCmplt.is_external = data.response;
      if (data.response) {
        if (ticket._meeting_type != 2) {
          this.attendanceFieldShow = true;
          this.checkStatus(ticket, type, status);
        } else {
          this.attendanceFieldShow = false;
          this.mapEntities(ticket, type, status);
        }
      } else {
        if (data.apiHit != -1) this.updateTicketStatus(ticket, type, status);
      }
    });
  }

  checkStatus(ticket, type, status) {
    let params = {
      ticketId: ticket._tktid,
      ticketType: 110
    }
    if (ticket._meeting_type != 2) {
      this.common.loading++;
      this.api.post('AdminTask/getAllUserByTask', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          let userListByTask = res['data'] || [];
          if (userListByTask) this.meetingAttendiesList = userListByTask['ccUsers'].map(user => {
            return {
              meetingId: ticket._refid,
              userId: user._cc_user_id,
              status: (user.status == 1) ? "Ack" : ((user.status == -1) ? "Declined" : "Pending"),
              presense: user.is_present ? '1' : '0',
              name: user.cc_user
            }
          });
          console.log(this.meetingAttendiesList);
          document.getElementById('meetingAttendance').style.display = 'block';
        } else {
          this.common.showError(res['msg'])
        }
      }, err => {
        this.common.showError();
      });
    } else {
      this.updateTicketStatus(ticket, type, status);
    }
  }

  mapEntities(ticket, type, status) {
    document.getElementById('meetingAttendance').style.display = 'block';
  }

  getEntitiesFilter(id) {
    let entities = JSON.parse(JSON.stringify(this.allEntities));
    this.filteredEnitity = entities.filter(entity => { return entity._entity_type_id == id });
    console.log(this.filteredEnitity)
  }


  closemeetingAttendanceMoadal(state) {
    document.getElementById('meetingAttendance').style.display = 'none';
    if (state) this.followUpMeeting(this.holdForFollowUp['ticket'], this.holdForFollowUp['type'], this.holdForFollowUp['status'])
  }

  closeCalenderMoadal() {
    document.getElementById('calender').style.display = 'none';
  }

  followUpMeeting(ticket, type, status) {
    if (ticket._meeting_type != 2) {
      this.common.params = {
        title: "Follow Up Meeting",
        description:
          `<b>&nbsp;` + `Press Yes to create a follow up meeting and No will close this meeting without any followup.`,
        isRemark: false,
        btn1: 'Yes',
        btn2: 'No'
      };
      const activeModal = this.modalService.open(ConfirmComponent, {
        size: "sm",
        container: "nb-layout",
        backdrop: "static",
        keyboard: false,
        windowClass: "accountModalClass",
      });
      activeModal.result.then((data) => {
        if (data.response) {
          this.editMeeting(ticket, type, false);
        } else {
          (!data.apiHit) ? this.updateTicketStatus(ticket, type, status) : null;
        }
      });
    } else {
      this.updateTicketStatus(ticket, type, status)
    }
  }

  saveMeetingAttendiesStatus(user) {
    // console.log("user", user); return;
    let params = {
      meetingId: user.meetingId,
      userId: user.userId,
      status: parseInt(user.presense)
    }
    this.api.post('Admin/updateMeetingParticipantPresence', params).subscribe(res => {
      if (res['code'] == 1) {
        this.common.showToast(res['msg']);
      } else {
        this.common.showError(res['msg'])
      }
    }, err => {
      this.common.showError();
    });
  }

  getFilteredData() {
    let keyToSearch = (this.searchTerm.trim()).toLowerCase();
    console.log(keyToSearch)
    if (!keyToSearch.length) {
      this.meetingData.pastData = this.meetingDataForFilter.pastData;
      this.meetingData.upcomingData = this.meetingDataForFilter.upcomingData;
    } else {
      this.filterPast(keyToSearch);
      this.filterUpcoming(keyToSearch);

      console.log('after', this.meetingData.pastData, this.meetingData.upcomingData)
    }
  }

  filterPast(keyToSearch) {
    let pastDataFiltered = JSON.parse(JSON.stringify(this.meetingDataForFilter.pastData));
    pastDataFiltered = pastDataFiltered.filter(element => {
      return (element.subject && (element.subject.toLowerCase()).match(keyToSearch)) || (element.host && (element.host.toLowerCase().match(keyToSearch))) || (element.schedule_time && (element.schedule_time.trim().match(keyToSearch))) || (element._mtype && (element._mtype.toLowerCase().match(keyToSearch)))
    });
    this.meetingData.pastData = pastDataFiltered;
  }

  filterUpcoming(keyToSearch) {
    let upcomingDataFiltered = JSON.parse(JSON.stringify(this.meetingDataForFilter.upcomingData));
    upcomingDataFiltered = upcomingDataFiltered.filter(element => {
      return (element.subject && (element.subject.toLowerCase()).match(keyToSearch)) || (element.host && (element.host.toLowerCase().match(keyToSearch))) || (element.schedule_time && (element.schedule_time.trim().match(keyToSearch))) || (element._mtype && (element._mtype.toLowerCase().match(keyToSearch)))
    });
    this.meetingData.upcomingData = upcomingDataFiltered;
  }

  checkAvailability() {
    // if (modalState) {
    //   this.schedule = {
    //     time: this.currentDate,
    //     endTime: this.currentDate,
    //     user: { id: this.userService._details.id, name: this.userService._details.name }
    //   }
    // }
    let params = {
      requestId: null,
      roomId: this.schedule.room.id,
      host: this.schedule.user.id,
      users: JSON.stringify([]),
      date: this.common.dateFormatter1(this.schedule.time),
      endDate: this.common.dateFormatter1(this.schedule.endTime)
    }

    if (this.scheduleType == '0') {
      params.roomId = null;
    } else if (this.scheduleType == '1') {
      params.host = null;
    }

    // return console.log(params,this.scheduleType)
    this.common.loading++;
    this.api.post('Admin/getCalendarSchedule', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] === 1) {
        let schedules = [];
        if (res['data'])
        console.log('res[data]', res['data']);
          res['data'].map(events => {
            schedules.push({
              start: events.meeting_time,
              end: events.meeting_end_time,
              title: `${events.title},Host:${events.meeting_host}`,
               color: events.m_type == 2 ? 'rgb(212 135 127)' : 'rgb(133 196 204)',
              description: events.title
             })
            // ,title:'fetching'
          })
        this.calendarOptions.events = schedules;
        console.log('this.calendarOptions.events: ', this.calendarOptions.events);
        this.calendarOptions.initialView = 'timeGridDay';
        console.log('cslender', this.calendarOptions);
        // if(modalState) document.getElementById('calender').style.display = 'block';
      }
    },
      (err) => {
        this.common.loading--;
        this.common.showError();
      });
  }


  myCalender() {

  }

  checkSchedule(type) {
    this.selectAvailability = type == 0?"Select User " : "Select Room";
    this.scheduleType = type;
    this.checkAvailability();
  }
}
