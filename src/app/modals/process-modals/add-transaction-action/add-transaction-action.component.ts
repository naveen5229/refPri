import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'ngx-add-transaction-action',
  templateUrl: './add-transaction-action.component.html',
  styleUrls: ['./add-transaction-action.component.scss']
})
export class AddTransactionActionComponent implements OnInit {
  title = "";
  button = "Add";
  standards = [];
  transAction = {
    requestId: null,
    process: { id: null, name: "" },
    state: { id: null, name: "" },
    nextState: { id: null, name: "" },
    mode: { id: null, name: "" },
    action: { id: null, name: "" },
    nextAction: { id: null, name: "" },
    actionOwner: { id: null, name: "" },
    remark: null,
    targetTime: new Date(),
    transId: null,
    isCompleted: false,
    formType: 0 //0=action,1=state,2=next-action
  }
  stateDataList = [];
  nextStateDataList = [];
  actionDataList = [];
  nextActionDataList = [];
  remarkDataList = [];
  modeList = [];
  adminList = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    console.log("params:", this.common.params);
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    this.adminList = (this.common.params.adminList.length > 0) ? this.common.params.adminList : [];
    if (this.common.params && this.common.params.actionData) {
      this.transAction.requestId = (this.common.params.actionData.requestId > 0) ? this.common.params.actionData.requestId : null;
      this.transAction.formType = (this.common.params.actionData.formType) ? this.common.params.actionData.formType : 0;
      this.transAction.process.id = (this.common.params.actionData.processId > 0) ? this.common.params.actionData.processId : null;
      this.transAction.process.name = (this.common.params.actionData.processId > 0) ? this.common.params.actionData.processName : null;
      this.transAction.transId = (this.common.params.actionData.transId > 0) ? this.common.params.actionData.transId : null;
      this.transAction.action.id = (this.common.params.actionData.actionId > 0) ? this.common.params.actionData.actionId : null;
      this.transAction.action.name = (this.common.params.actionData.actionId > 0) ? this.common.params.actionData.actionName : null;
      this.transAction.state.id = (this.common.params.actionData.stateId > 0) ? this.common.params.actionData.stateId : null;
      this.transAction.state.name = (this.common.params.actionData.stateId > 0) ? this.common.params.actionData.stateName : null;
      if (this.common.params.actionData.actionOwnerId > 0) {
        let actionOwner = this.adminList.find(x => x.id == this.common.params.actionData.actionOwnerId);
        console.log("actionOwner:", actionOwner);
        if (actionOwner) {
          this.transAction.actionOwner = actionOwner;
        }
      }

      if (this.transAction.formType == 2) {
        this.title = 'Add Transaction Next Action';
      } else if (this.transAction.formType == 1) {
        this.title = 'Add Transaction Next State';
      } else {
        this.title = 'Update Transaction Action';
        this.transAction.isCompleted = true;
      }
      if (this.transAction.action.id > 0) {
        this.getActionModeList();
      }
      if (this.transAction.state.id > 0) {
        this.getActionList();
      }
    };
    this.getStateList();
  }

  closeModal(res, nextFormType = null) {
    this.activeModal.close({ response: res, nextFormType: nextFormType });
  }

  ngOnInit() { }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.transAction.process.id).subscribe(res => {
      this.common.loading--;
      let stateDataList = res['data'];
      this.stateDataList = stateDataList.map(x => { return { id: x._state_id, name: x.name, _nextstate: x._nextstate } });
      this.checkNextStateList();
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  checkNextStateList() {
    if (this.transAction.state.id > 0) {
      let selectedState = this.stateDataList.find(x => x.id == this.transAction.state.id);
      console.log("selectedState:", selectedState);
      if (selectedState && selectedState._nextstate && selectedState._nextstate.length) {
        this.nextStateDataList = selectedState._nextstate.map(x => { return { id: x._state_id, name: x.name } });
        console.log("nextStateDataList1:", this.nextStateDataList);
      } else {
        this.nextStateDataList = this.stateDataList;
        console.log("nextStateDataList2:", this.nextStateDataList);
      }
    } else {
      this.nextStateDataList = this.stateDataList;
      console.log("nextStateDataList3:", this.nextStateDataList);
    }
    console.log("nextStateDataList4:", this.nextStateDataList);
  }

  onSelectState() {
    this.transAction.action = { id: null, name: "" };
    this.transAction.mode = { id: null, name: "" };
    this.transAction.nextState = { id: null, name: "" };
    this.getActionList();
  }

  onSelectAction() {
    this.transAction.mode = { id: null, name: "" };
    this.getActionModeList();
  }

  onSelectNextAction() {
    this.transAction.targetTime = new Date();
  }

  getActionList() {
    console.log("transAction:", this.transAction);
    this.common.loading++;
    this.api.get("Processes/getProcessActionByState?processId=" + this.transAction.process.id + "&stateId=" + this.transAction.state.id).subscribe(res => {
      this.common.loading--;
      let actionDataList = res['data'] || [];
      this.actionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name } });
      this.nextActionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getNextActionList() {
    this.common.loading++;
    this.api.get("Processes/getProcessActionByState?processId=" + this.transAction.process.id + "&stateId=" + this.transAction.state.id).subscribe(res => {
      this.common.loading--;
      let actionDataList = res['data'] || [];
      this.nextActionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getActionModeList() {
    this.common.loading++;
    this.api.get("Processes/getProcessActionModeList?processId=" + this.transAction.process.id + "&actionId=" + this.transAction.action.id).subscribe(res => {
      this.common.loading--;
      let modeList = res['data'] || [];
      this.modeList = modeList.map(x => { return { id: x.mode_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  saveTransAction() {
    if (!this.transAction.state.id || !this.transAction.action.id) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      const params = {
        requestId: this.transAction.requestId,
        transId: this.transAction.transId,
        stateId: this.transAction.state.id,
        actionId: this.transAction.action.id,
        nexActId: null,
        nextActTarTime: null,
        remark: this.transAction.remark,
        modeId: (this.transAction.mode.id > 0) ? this.transAction.mode.id : null,
        actionOwnerId: (this.transAction.actionOwner.id > 0) ? this.transAction.actionOwner.id : null,
        isNextAction: null,
        isCompleted: (this.transAction.isCompleted) ? true : false
      };
      console.log("saveTransAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            // this.transAction.formType = 1;
            this.closeModal(true, 2);
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
  }

  saveTransNextAction() {
    console.log("saveTransNextAction:", this.transAction);
    if (!this.transAction.state.id || !this.transAction.nextAction.id) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      let targetTime = (this.transAction.targetTime) ? this.common.dateFormatter(this.transAction.targetTime) : null;
      const params = {
        requestId: null,
        transId: this.transAction.transId,
        stateId: this.transAction.state.id,
        actionId: this.transAction.action.id,
        nexActId: (this.transAction.nextAction.id > 0) ? this.transAction.nextAction.id : null,
        nextActTarTime: targetTime,
        remark: this.transAction.remark,
        modeId: null,
        actionOwnerId: (this.transAction.actionOwner.id > 0) ? this.transAction.actionOwner.id : null,
        isNextAction: true,
        isCompleted: false
      };
      console.log("saveTransNextAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            // this.transAction.formType = 0;
            this.closeModal(true, null);
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
  }

  saveTransNextState() {
    if (!this.transAction.nextState.id) {
      this.common.showError('Next state is missing');
    }
    else {
      const params = {
        requestId: null,
        transId: this.transAction.transId,
        stateId: this.transAction.nextState.id,
        actionId: null,
        nexActId: null,
        nextActTarTime: null,
        remark: null,
        modeId: null,
        actionOwnerId: null,
        isNextAction: null,
        isCompleted: false
      };
      console.log("saveTransAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            // this.transAction.formType = 1;
            this.closeModal(true, 1);
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
  }

  resetData() {
    this.transAction.mode = { id: null, name: "" };
    this.transAction.action = { id: null, name: "" };
    this.transAction.nextState = { id: null, name: "" };
    this.transAction.nextAction = { id: null, name: "" };
    this.transAction.actionOwner = { id: null, name: "" };
    this.transAction.remark = "";
    this.transAction.targetTime = new Date();
    this.transAction.isCompleted = false;
    this.standards = [];
  }

}

