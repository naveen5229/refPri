import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { UserService } from '../../../Service/user/user.service';

@Component({
  selector: 'ngx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  title = "Settings";
  userList = [];
  btn = "Save";
  process_Info= null;
  stateDataList = [];
  actionDataList = [];

  transaction = {
    primary_Owner: {id:'',name:''},
    default_State:{id:'',name:''},
    default_Action:{id:'',name:''},
    action_Owner:{id:'',name:''},
    self:false,
    acktoaddUser:false,
    isIdentity:false,
  }
  

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {

      this.userList = this.common.params.userList;
      this.process_Info = this.common.params.process_info;
      console.log(this.process_Info._id)
      this.getStateList();
     }

  ngOnInit() {
  }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.process_Info._id).subscribe(res => {
      this.common.loading--;
      let stateDataList = res['data'];
      this.stateDataList = stateDataList.map(x => { return { id: x._state_id, name: x.name, _nextstate: x._nextstate, _state_form: (x._state_form) ? x._state_form : 0 } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }
  
  getActionList(event) {
    // console.log("transAction:", this.transAction);
    console.log(event,'event for action')
    this.common.loading++;
    this.api.get("Processes/getProcessActionByState?processId=" + this.process_Info._id + "&stateId=" + event.id).subscribe(res => {
      this.common.loading--;
      let actionDataList = res['data'] || [];
      this.actionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name, threshold: x._threshold } });
      // this.nextActionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name, threshold: x._threshold } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }
  
  requestLeave(){
        console.log(this.transaction,'transaction')
        let actionOwner = null;
        let acktoaddUser = null;
        let defidentity = null;
        if(this.transaction.self){
          actionOwner = -99;
        }else{
          if(this.transaction.action_Owner){
          actionOwner = this.transaction.action_Owner.id;
          }
        }

        if(this.transaction.acktoaddUser){
          acktoaddUser = 1;
        }else{
          acktoaddUser = 0;
        }

        if(this.transaction.isIdentity){
          defidentity = 1;
        }else{
          defidentity = 0;
        }

        let params = {
          processId: this.process_Info._id,
          poId: this.transaction.primary_Owner.id,
          isAckToAddUser: acktoaddUser,
          stateId: this.transaction.default_State.id,
          actionId: this.transaction.default_Action.id,
          actionOwnerId: actionOwner,
          isIdentity: defidentity
        }

        this.common.loading++;
        this.api.post("Processes/addProcessSetting ", params).subscribe(res => {
          this.common.loading--;
        }, err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

}
