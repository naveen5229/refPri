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
    actionId: null,
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
    isNextAction: false
  }
  stateDataList = [];
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

    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.actionData) {
      this.transAction.process.id = (this.common.params.actionData.processId > 0) ? this.common.params.actionData.processId : null;
      this.transAction.process.name = (this.common.params.actionData.processId > 0) ? this.common.params.actionData.processName : null;
      this.transAction.transId = (this.common.params.actionData.transId > 0) ? this.common.params.actionData.transId : null;
      this.transAction.actionId = (this.common.params.actionData.actionId > 0) ? this.common.params.actionData.actionId : null;
      this.transAction.requestId = (this.common.params.actionData.requestId > 0) ? this.common.params.actionData.requestId : null;

    };
    this.adminList = (this.common.params.adminList.length > 0) ? this.common.params.adminList : [];
    this.getStateList();
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() { }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.transAction.process.id).subscribe(res => {
      this.common.loading--;
      let stateDataList = res['data'];
      this.stateDataList = stateDataList.map(x => { return { id: x._state_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
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
      this.modeList = res['data'] || [];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  saveTransAction() {
    if (this.transAction.state.id! > 0 || this.transAction.action.id! > 0) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      const params = {
        requestId: this.transAction.requestId,
        transId: this.transAction.transId,
        stateId: this.transAction.state.id,
        actionId: this.transAction.action.id,
        nextStateId: null,
        nexActId: null,
        nextActTarTime: null,
        remark: this.transAction.remark,
        modeId: (this.transAction.mode.id > 0) ? this.transAction.mode.id : null,
        actionOwnerId: null,
        isNextAction: null
      };
      console.log("saveTransAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            this.transAction.isNextAction = true;
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
    if (this.transAction.state.id! > 0 || this.transAction.nextAction.id! > 0) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      let targetTime = (this.transAction.targetTime) ? this.common.dateFormatter(this.transAction.targetTime) : null;
      const params = {
        requestId: null,
        transId: this.transAction.transId,
        stateId: this.transAction.state.id,
        actionId: this.transAction.action.id,
        nextStateId: (this.transAction.nextState.id > 0) ? this.transAction.nextState.id : null,
        nexActId: (this.transAction.nextAction.id > 0) ? this.transAction.nextAction.id : null,
        nextActTarTime: targetTime,
        remark: this.transAction.remark,
        modeId: null,
        actionOwnerId: (this.transAction.actionOwner.id > 0) ? this.transAction.actionOwner.id : null,
        isNextAction: true
      };
      console.log("saveTransAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            this.transAction.isNextAction = false;
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
    this.standards = [];
  }

}

