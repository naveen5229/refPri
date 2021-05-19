import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { UserService } from '../../Service/user/user.service';

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
    hostId: null,
    time: this.common.getDate(2),
    duration: null,
    buzz: false
  }
  meetingRoomList = [];

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
    }else if(this.formType==2){
      this.getMeetingRoomList();
    }
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

  addMeeting(){
    if (!this.meetingForm.subject) {
      return this.common.showError("Subject is missing");
    }
    if (!this.meetingForm.time) {
      return this.common.showError("Meeting time is missing");
    } else if (this.meetingForm.time && this.meetingForm.time < this.common.getDate()) {
      return this.common.showError("Meeting time must be Current/future date");
    } else if (!this.meetingForm.duration) {
      return this.common.showError("Meeting duration is missing");
    } else if (!this.meetingForm.cc || !this.meetingForm.cc.length) {
      return this.common.showError("User is missing");
    } else if (!this.meetingForm.hostId) {
      return this.common.showError("Host user is missing");
    } else if (this.meetingForm.type==1 && !this.meetingForm.link) {
      return this.common.showError("Online meeting link is missing");
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
      subject: this.meetingForm.subject,
      desc: this.meetingForm.desc,
      roomId: this.meetingForm.roomId,
      host: this.meetingForm.hostId.id,
      userId: JSON.stringify(CC),
      type: this.meetingForm.type,
      time: this.common.dateFormatter(this.meetingForm.time),
      duration: this.common.timeFormatter(this.meetingForm.duration),
      buzz: this.meetingForm.buzz
    }
    // console.log("add meeting:",params); return false;
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


}
