import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';

@Component({
  selector: 'ngx-meeting-room',
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss']
})
export class MeetingRoomComponent implements OnInit {
  btn = "Submit";
  transId:any;
  id = null;
  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal) {
      this.id = null;
      this.getFoData(null);
      this.getOfficeDataForWifi(null);
     }
  meetingRoomName = null;
  meetingRoomList = [];
  wifiFoId = null;
  officeListId = null;
  officeDataForWifi = [];
  FoData = [];
  name="";

 resetDetails(){
    this.meetingRoomName = null;
    this.meetingRoomList = [];
    this.tableRoom.data = {
      headings: {},
      columns: [],
    };
    this.officeListId = null;
    this.name = "";
    this.btn = "submit";
    this.id = null;
 }

 foUsers(event) {
  console.log("Elogist Company:", event);
    this.wifiFoId = event.id;
    this.getMeetingRoomList(event.id);
    this.getOfficeDataForWifi(event.id); 
}

getOfficeDataForWifi(id) {
  this.officeDataForWifi = [];
  this.common.loading++;
  this.api.getTranstruck('Admin/getOfficeList?foUserId=' + id, 'I')
    .subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (!res['data']) return;
      this.officeDataForWifi = res['data'];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
}

getFoData(id) {
  this.common.loading++;
  this.api.getTranstruck('AxesUserMapping/getElogistCompany.json?elPartnerId=' + id)
    .subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (!res['data']) return;
      this.FoData = res['data'];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
}

getMeetingRoomList(id) {
  this.transId = id;
  this.meetingRoomList = [];
  this.common.loading++;
  this.api.get('Admin/getMeetingRoomList?foid='+id, 'I').subscribe(res => {
    this.common.loading--;
    if (res['code'] >0){
      this.meetingRoomList = res['data'] || [];
      console.log("meetingRoomList:",this.meetingRoomList);
      (this.meetingRoomList && this.meetingRoomList.length) ? this.setTableRoom() : null;
    }else{ 
      this.common.showError(res['msg']); 
    };
  }, err => {
    this.common.loading--;
    this.common.showError();
    console.log(err);
  });
}

setTableRoom() {
  this.tableRoom.data = {
    headings: this.generateHeadingsRoom(),
    columns: this.getTableColumnsRoom()
  };
  return true;
}

selectOffice(event) {
  console.log("OfficeDataforWifi:", event);
  this.officeListId = event._id;
}

tableRoom = {
  data: {
    headings: {},
    columns: [],
  },
  settings: {
    hideHeader: true
  }
};

generateHeadingsRoom() {
  let headings = {};
  for (var key in this.meetingRoomList[0]) {
    if (key.charAt(0) != "_") {
      headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
    }
  }
  let action = "Action";
  headings[action] = { title: action, placeholder: action }
  return headings;
}

actionIcons(param:any) {
  console.log("params",param);
  let Icons = [{
    class: "btn btn-primary cursor-pointer",
    action: this.editMeetingRoom.bind(this,param),
    txt: "Edit",
    title: "Edit",
  },
  {
    class: "btn btn-primary",
    action: this.deleteMeetingRoom.bind(this,param),
    txt: "Delete",
    title: "Delete",
  }];

  return Icons
}

getTableColumnsRoom() {
  let columns = [];
  this.meetingRoomList.map(campaign => {
    let column = {};
    for (let key in this.generateHeadingsRoom()) {
      if(key=="Action"){
        column[key] = {
          value: "",
          isHTML: true,
          action: null,
          icons: this.actionIcons(campaign),
        };
      }
      else{
      column[key] = { value: campaign[key], class: 'black', action: '' };
      }
    }
    columns.push(column);
  })
  return columns;
}

editMeetingRoom(param:any){
  for(const property in param) {
    if(property=="office_name"){
    let y = this.officeDataForWifi.find(x => x.name === param[property]);
    console.log("y",y);
    this.officeListId = y._id;
    this.name = y.name;
    }
    else if(property=="room_name"){
      this.meetingRoomName = param[property];
    }
    else
    this.id = param[property];
  } 
     this.wifiFoId = this.transId;
  
console.log("edit param", param);
this.btn = "update";
}

deleteMeetingRoom(param:{}){
let id:any;
  for(const property in param) {
    if(property.charAt(0)=="_")
           id = param[property];
  } 
  let params = {
    foid: this.wifiFoId,
  }
  let par: any = {
    id: id,
  }
  this.api.post('Admin/deleteMeetingRoom', par)
  .subscribe((res: any) => {
    this.common.loading--;
    if (res['code']>0) {
      this.getMeetingRoomList(params.foid);
    } else {
      this.common.showError("error");
    }
  }, (err: any) => {
    console.error('Error: ', err);
    this.common.loading--;
  });
console.log("delete id", id);
}

addMeetingRoom() {
  let param = {
    foid: this.wifiFoId,
    name: this.meetingRoomName,
    officeid: this.officeListId,
    nId:this.id,
    requestId: null
  }
  if(!param.foid){
    this.common.showError("FO-User is missing");
    return false;
  }
  if(!param.name || param.name.trim()==""){
    this.common.showError("Room Name is missing");
    return false;
  }
  // console.log('param:', param); return false;
  this.common.loading++;
  this.api.post("Admin/addMeetingRoom", param, "I")
    .subscribe(res => {
      this.common.loading--;
      if (res['code']>0) {
        this.resetDetails();
        this.common.showToast(res['msg']);
        this.getMeetingRoomList(param.foid);
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log(err);
    });
}


  ngOnInit() {
  }

}
