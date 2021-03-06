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
  process_Info = null;
  stateDataList = [];
  actionDataList = [];
  PreFilledData = [];
  // showOtherFields: Boolean = false;
  stateId = null;

  allowStateChangeValues = [
    // { id: 4, name: 'auto' },
    { id: 3, name: 'only admin' },
    { id: 0, name: 'PO and admin' },
    { id: 1, name: 'admin, PO and action owner' },
    { id: 2, name: 'admin, PO and action owner with txn complete' },
  ];

  txnNotification = [
    { id: 0, name: 'None' },
    { id: 1, name: 'On Start' },
    { id: 2, name: 'On End' },
    { id: 3, name: 'Both' }];

  txnDelet = [
    { id: 0, name: 'None' },
    { id: 1, name: 'Only Admin' },
    { id: 5, name: 'All Users' }];


  transaction = {
    primary_Owner: { id: null, name: '' },
    default_State: { id: null, name: '' },
    default_Action: { id: null, name: '' },
    action_Owner: { id: null, name: '' },
    self: false,
    acktoaddUser: false,
    isIdentity: false,
    isEditable: false,
    isModeApplicable: false,
    isClaimApplicable: false,
    isEndByActionOwn: { id: null, name: '' },
    isDeleted: { id: null, name: '' },
    txnNoti: { id: null, name: '' }
  }

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal,
    public userService: UserService) {

    this.userList = this.common.params.userList;
    this.process_Info = this.common.params.process_info;
    this.getPreFilledData()
    this.getStateList();
  }

  ngOnInit() {
  }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.process_Info._id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let stateDataList = res['data'] || [];
      stateDataList = stateDataList.filter(x => (x._type_id == 1));
      if (stateDataList && stateDataList.length) {
        this.stateDataList = stateDataList.map(x => { return { id: x._state_id, name: x.name, _nextstate: x._nextstate, _state_form: (x._state_form) ? x._state_form : 0 } });
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getActionList(event) {
    // this.showOtherFields = true;
    this.common.loading++;
    this.api.get("Processes/getProcessActionByState?processId=" + this.process_Info._id + "&stateId=" + event.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let actionDataList = res['data'] || [];
      this.actionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name, threshold: x._threshold } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getPreFilledData() {
    this.common.loading++;
    this.api.get("Processes/getProcessSetting?processId=" + this.process_Info._id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.PreFilledData = res['data'] || [];
      this.setData();
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  setData() {
    this.transaction.primary_Owner = { id: this.PreFilledData[0]._default_po, name: this.PreFilledData[0].pri_owner };
    this.transaction.default_State = { id: this.PreFilledData[0]._default_state, name: this.PreFilledData[0].default_state };
    this.transaction.default_Action = { id: this.PreFilledData[0]._default_action, name: this.PreFilledData[0].default_action };
    this.transaction.isDeleted = { id: this.PreFilledData[0]._delete_txn, name: this.PreFilledData[0].delete_txn };
    this.transaction.txnNoti = { id: this.PreFilledData[0]._txn_notification, name: this.PreFilledData[0].txn_notification };
    this.transaction.isEndByActionOwn = { id: this.PreFilledData[0]._state_change, name: this.PreFilledData[0].state_change };
    if (this.transaction.default_State.id > 0) {
      this.stateId = this.transaction.default_State;
      this.getActionList(this.stateId)
    }

    if (this.PreFilledData[0]._default_action_owner > 0) {
      this.transaction.action_Owner = { id: this.PreFilledData[0]._default_action_owner, name: this.PreFilledData[0].default_action_owner };
    } else if (this.PreFilledData[0]._default_action_owner == -99) {
      this.transaction.self = true;
    } else {
      this.transaction.action_Owner = { id: null, name: '' };
    }

    this.transaction.acktoaddUser = (this.PreFilledData[0]._ack_to_aduser == 1) ? true : false;
    this.transaction.isIdentity = (this.PreFilledData[0]._default_identity == 1) ? true : false;
    this.transaction.isEditable = (this.PreFilledData[0]._txn_editable == 1) ? true : false;
    this.transaction.isModeApplicable = (this.PreFilledData[0]._is_mode_applicable) ? true : false;
    this.transaction.isClaimApplicable = (this.PreFilledData[0]._claim_txn) ? true : false;

  }

  saveProcess() {
    let actionOwner = null;
    if (this.transaction.self) {
      actionOwner = -99;
    } else {
      if (this.transaction.action_Owner) {
        actionOwner = this.transaction.action_Owner.id;
      }
    }

    let params = {
      processId: this.process_Info._id,
      poId: this.transaction.primary_Owner.id,
      isAckToAddUser: (this.transaction.acktoaddUser) ? 1 : 0,
      stateId: this.transaction.default_State.id,
      actionId: this.transaction.default_Action.id,
      actionOwnerId: actionOwner,
      isIdentity: (this.transaction.isIdentity) ? 1 : 0,
      isEditable: (this.transaction.isEditable) ? 1 : 0,
      isModeApplicable: (this.transaction.isModeApplicable) ? 1 : null,
      isClaimApplicable: (this.transaction.isClaimApplicable) ? 1 : null,
      stateChange: this.transaction.isEndByActionOwn.id,
      isDeleted: this.transaction.isDeleted.id,
      txnNotification: this.transaction.txnNoti.id
    }
    this.common.loading++;
    this.api.post("Processes/addProcessSetting", params).subscribe(res => {
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
      this.common.showError();
      console.log(err);
    });
  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  resetData() {
    this.transaction = {
      primary_Owner: { id: null, name: '' },
      default_State: { id: null, name: '' },
      default_Action: { id: null, name: '' },
      action_Owner: { id: null, name: '' },
      self: false,
      acktoaddUser: false,
      isIdentity: false,
      isEditable: false,
      isModeApplicable: false,
      isClaimApplicable: false,
      isEndByActionOwn: { id: null, name: '' },
      isDeleted: { id: null, name: '' },
      txnNoti: { id: null, name: '' }
    }
    this.stateId = null;
  }

  clearFields() {
    this.transaction.default_State = { id: null, name: '' };
    this.transaction.default_Action = { id: null, name: '' };
    this.transaction.action_Owner = { id: null, name: '' };
  }

  // onUnselectState(event) {
  //   this.transaction.default_State.id = null;
  //   this.transaction.default_Action = { id: null, name: '' }
  // }

  // onUnselectPO(event) {
  //   this.transaction.primary_Owner.id = null;
  // }

}
