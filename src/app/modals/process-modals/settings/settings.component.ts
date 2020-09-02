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
  PreFilledData = [];
  showOtherFields:Boolean = false;
  stateId = null;

  transaction = {
    primary_Owner: {id:null,name:''},
    default_State:{id:null,name:''},
    default_Action:{id:null,name:''},
    action_Owner:{id:null,name:''},
    self:false,
    acktoaddUser:false,
    isIdentity:false,
    isEditable:false
  }
  

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {

      this.userList = this.common.params.userList;
      this.process_Info = this.common.params.process_info;
      console.log(this.process_Info._id)
      this.getPreFilledData()
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
    this.showOtherFields = true;
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

  getPreFilledData(){
    this.common.loading++;
    this.api.get("Processes/getProcessSetting?processId=" + this.process_Info._id).subscribe(res => {
      this.common.loading--;
      this.PreFilledData = res['data'] || [];
      this.setData();
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  setData(){
    this.transaction.primary_Owner = {id: this.PreFilledData[0]._default_po ,name: this.PreFilledData[0].pri_owner};
    this.transaction.default_State = {id: this.PreFilledData[0]._default_state ,name: this.PreFilledData[0].default_state};
    this.transaction.default_Action = {id: this.PreFilledData[0]._default_action ,name: this.PreFilledData[0].default_action};

    
    if(this.transaction.default_State.id > 0){
        this.showOtherFields = true;
        this.stateId = this.transaction.default_State;
        this.getActionList(this.stateId)
    }
   
    if(this.PreFilledData[0]._default_action_owner > 0){
    this.transaction.action_Owner = {id: this.PreFilledData[0]._default_action_owner ,name: this.PreFilledData[0].default_action_owner};
    }else if(this.PreFilledData[0]._default_action_owner == -99){
      this.transaction.self = true;
    }else{
      this.transaction.action_Owner = {id:null ,name: ''};
    }

    if(this.PreFilledData[0]._ack_to_aduser == 1){
    this.transaction.acktoaddUser = true;
    }else{
      this.transaction.acktoaddUser = false;
    }

    if(this.PreFilledData[0]._default_identity == 1){
    this.transaction.isIdentity = true;
    }else{
      this.transaction.isIdentity = false;
    }

    if(this.PreFilledData[0]._txn_editable == 1){
      this.transaction.isEditable = true;
      }else{
        this.transaction.isEditable = false;
      }
  }
  
  saveProcess(){
        console.log(this.transaction,'transaction')
        let actionOwner = null;
        let acktoaddUser = null;
        let defidentity = null;
        let iseditable = null;
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

        if(this.transaction.isEditable){
          iseditable = 1;
        }else{
          iseditable = 0;
        }

        let params = {
          processId: this.process_Info._id,
          poId: this.transaction.primary_Owner.id,
          isAckToAddUser: acktoaddUser,
          stateId: this.transaction.default_State.id,
          actionId: this.transaction.default_Action.id,
          actionOwnerId: actionOwner,
          isIdentity: defidentity,
          isEditable: iseditable
        }

        console.log(params,'params')
        // return;

        this.common.loading++;
        this.api.post("Processes/addProcessSetting ", params).subscribe(res => {
          this.common.loading--;
          if (res['code'] == 1) {
            if (res['data'][0].y_id > 0) {
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
          console.log(err);
        });
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

}
