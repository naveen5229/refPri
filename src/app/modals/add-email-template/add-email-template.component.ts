import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../@core/mock/users.service';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-add-email-template',
  templateUrl: './add-email-template.component.html',
  styleUrls: ['./add-email-template.component.scss']
})
export class AddEmailTemplateComponent implements OnInit {
  name:any;
  isEdit = false;
  title = "Add Template";
  userList = [];
  btn = 'Add';
  currentDate = this.common.getDate();
  nextDate = this.common.getDate(1);
  formType = null;
  leaveArray = {
    startDate: this.currentDate,
    endDate: this.currentDate,
    To: null,
    cc: [],
    reason: '',
    type: 0
  }

  config = {
    uiColor: '#ffffff',
    toolbarGroups: [
    { name: 'document', groups: ['mode', 'document', 'doctools'] },
    { name: 'clipboard', groups: ['clipboard', 'undo'] },
    { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
    { name: 'forms' },
	  '/',
    { name: 'links' },
    { name: 'insert' },
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'] },
    '/',
    { name: 'styles' },
    { name: 'colors' },
    { name: 'tools' },
    { name: 'others' },
    { name: 'about' }
  ],
    skin: 'kama',
    resize_enabled: false,
    removePlugins: 'elementspath,save,magicline',
    extraPlugins: 'divarea,smiley,justify,indentblock,colordialog',
    colorButton_foreStyle: {
       element: 'font',
       attributes: { 'color': '#(color)' }
    },
    height: 300,
    removeDialogTabs: 'image:advanced;link:advanced',
    removeButtons: 'Subscript,Superscript,Anchor,Source,Table',
    format_tags: 'p;h1;h2;h3;pre;div'
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

  selectedTime = { from: { hh: null, mm: null }, to: { hh: null, mm: null } };
  showHours = false;
  hours = [];
  minutes = [];
  busySchedules = [];
  isSaveWithChat = null;
  isBuzzandButton = true;
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
    this.title = (this.common.params.title) ? this.common.params.title : "Apply WFH";
    this.btn = (this.common.params.btn) ? this.common.params.btn : "Apply";
    this.getLastWFHRequestData();
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

  getLastWFHRequestData() {
    this.common.loading++;
    this.api.get("AdminTask/getLastWFHRequestData").subscribe(res => {
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

  requestWFH() {
    console.log("leaveArray:", this.leaveArray)
    let startDate = null;
    let endDate = null;
    if (this.leaveArray.type == 211) {
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
    this.api.post('AdminTask/addWFHRequest', params).subscribe(res => {
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

}

