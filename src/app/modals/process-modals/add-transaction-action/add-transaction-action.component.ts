import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { FormDataComponent } from '../form-data/form-data.component';

@Component({
  selector: 'ngx-add-transaction-action',
  templateUrl: './add-transaction-action.component.html',
  styleUrls: ['./add-transaction-action.component.scss']
})
export class AddTransactionActionComponent implements OnInit {
  isCompleteVisi = true;
  currentDate = this.common.getDate();
  title = "";
  button = "Add";
  standards = [];
  transAction = {
    requestId: null,
    process: { id: null, name: "" },
    state: { id: null, name: "" },
    nextState: { id: null, name: "", type: null },
    mode: { id: null, name: "" },
    action: { id: null, name: "" },
    nextAction: { id: null, name: "" },
    actionOwner: { id: null, name: "" },
    remark: null,
    targetTime: new Date(),
    transId: null,
    isCompleted: false,
    formType: 0, //0=action,1=state,2=next-action
    isModeApplicable: 0,
    onSiteImageId: null
  }
  stateDataList = [];
  nextStateDataList = [];
  actionDataList = [];
  nextActionDataList = [];
  remarkDataList = [];
  modeList = [];
  adminList = [];
  isFormHere = 0;
  nextStateForm = 0;
  isMarkTxnComplete = null;

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    console.log("params:", this.common.params);
    this.isCompleteVisi = this.common.params.isComplete;
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    this.adminList = (this.common.params.adminList.length > 0) ? this.common.params.adminList : [];
    // let threashold = new Date();
    this.transAction.targetTime.setHours(23, 59);
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
      this.transAction.mode.id = (this.common.params.actionData.modeId > 0) ? this.common.params.actionData.modeId : null;
      this.transAction.mode.name = (this.common.params.actionData.modeId > 0) ? this.common.params.actionData.modeName : null;
      this.transAction.remark = (this.common.params.actionData.remark) ? this.common.params.actionData.remark : null;
      this.transAction.isModeApplicable = (this.common.params.actionData.isModeApplicable) ? this.common.params.actionData.isModeApplicable : 0;
      this.isMarkTxnComplete = (this.common.params.actionData.isMarkTxnComplete) ? this.common.params.actionData.isMarkTxnComplete : null;
      this.transAction.onSiteImageId = (this.common.params.actionData.onSiteImageId) ? this.common.params.actionData.onSiteImageId : null;
      console.log("isMarkTxnComplete:", this.isMarkTxnComplete);
      if (this.common.params.actionData.actionOwnerId > 0) {
        let actionOwner = this.adminList.find(x => x.id == this.common.params.actionData.actionOwnerId);
        if (actionOwner) {
          this.transAction.actionOwner = actionOwner;
        }
      }

      if (this.transAction.formType == 2) {
        this.title = 'Add Transaction Next Action';
        this.isFormHere = 0;
      } else if (this.transAction.formType == 1) {
        this.title = 'Add Transaction Next State';
        this.isFormHere = 0;
      } else {
        this.title = 'Update Transaction Action';
        this.transAction.isCompleted = true;
        this.isFormHere = this.common.params.actionData.isActionForm;
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
    this.activeModal.close({ response: res, nextFormType: nextFormType, isFormHere: (!this.transAction.formType) ? 0 : this.isFormHere, state: this.transAction.state });
  }

  ngOnInit() { }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.transAction.process.id).subscribe(res => {
      this.common.loading--;
      let stateDataList = res['data'];
      this.stateDataList = stateDataList.map(x => { return { id: x._state_id, name: x.name, _nextstate: x._nextstate, _state_form: (x._state_form) ? x._state_form : 0, type: x._type_id } });
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
      if (selectedState && selectedState._nextstate && selectedState._nextstate.length) {
        this.nextStateDataList = selectedState._nextstate.map(x => { return { id: x._state_id, name: x.name, _state_form: (x._state_form) ? x._state_form : 0, type: x._type_id } });
      } else {
        this.nextStateDataList = this.stateDataList;
      }
    } else {
      this.nextStateDataList = this.stateDataList;
    }
  }

  onSelectState() {
    this.transAction.action = { id: null, name: "" };
    this.transAction.mode = { id: null, name: "" };
    this.transAction.nextState = { id: null, name: "", type: null };
    this.getActionList();
  }

  onSelectAction() {
    this.transAction.mode = { id: null, name: "" };
    this.getActionModeList();
  }

  onSelectNextAction(event) {
    let threashold = new Date();
    if (event.threshold > 0) {
      let cHours = threashold.getHours();
      threashold.setHours(cHours + event.threshold);
      this.transAction.targetTime = threashold;
    } else {
      threashold.setHours(23, 59);
      this.transAction.targetTime = threashold;
    }
  }

  getActionList() {
    // console.log("transAction:", this.transAction);
    this.common.loading++;
    this.api.get("Processes/getProcessActionByState?processId=" + this.transAction.process.id + "&stateId=" + this.transAction.state.id).subscribe(res => {
      this.common.loading--;
      let actionDataList = res['data'] || [];
      this.actionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name, threshold: x._threshold } });
      this.nextActionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name, threshold: x._threshold } });
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
      this.nextActionDataList = actionDataList.map(x => { return { id: x._action_id, name: x.name, threshold: x._threshold } });
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

  confirmSaveTransAction(fieldsVisi) {
    // if (this.transAction.formType == 0) {
    if (this.isFormHere == 1) {
      let actionData = {
        processId: this.transAction.process.id,
        processName: this.transAction.process.name,
        transId: this.transAction.transId,
        refId: this.transAction.action.id,
        refType: 1,
        formType: 2,
        isDisabled: fieldsVisi
      };

      this.common.params = { actionData, title: 'Action Form', button: "Save", buttonType: true, fieldsVisi: fieldsVisi };
      const activeModal = this.modalService.open(FormDataComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.saveType == 2) {
          this.saveTransAction();
        }
      });
    } else {
      this.saveTransAction();
    }
  }

  saveTransAction() {
    let isCompleted = null;
    if (this.isCompleteVisi) {
      isCompleted = (this.transAction.isCompleted) ? 1 : 0;
    } else {
      isCompleted = -1;
    }
    
    console.log('condition Print', isCompleted);

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
        isCompleted: isCompleted,
        onSiteImageId: (this.transAction.onSiteImageId > 0) ? this.transAction.onSiteImageId : null
      };
      console.log("saveTransAction:", params);
      // return;
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
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
    // }
    // });
  }
  // }

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
      this.api.post("Processes/addTransactionAction", params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
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
            this.transAction.state = this.transAction.nextState;
            this.isFormHere = this.nextStateForm;
            let stateType = this.transAction.nextState.type;
            this.resetData();
            this.closeModal(true, 1);
            console.log("on save nxt state:", this.isMarkTxnComplete, stateType);
            if (this.isMarkTxnComplete == 1 && stateType == 2) {
              setTimeout(() => {
                this.markTxnComplete(params.transId);
              }, 1000);
            }
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
    this.transAction.nextState = { id: null, name: "", type: null };
    this.transAction.nextAction = { id: null, name: "" };
    this.transAction.actionOwner = { id: null, name: "" };
    this.transAction.remark = "";
    this.transAction.targetTime = new Date();
    this.transAction.isCompleted = false;
    this.transAction.onSiteImageId = null;
    this.standards = [];
  }

  markTxnComplete(transId) {
    console.log("confrm transId:", transId);
    this.common.params = {
      title: 'Mark Txn Complete',
      description: '<b>Are you sure to complete this Transaction ?<b>'
    }
    const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
    activeModal.result.then(data => {
      if (data.response) {
        this.updateTransactionStatus(transId, 5);
      }
    });
  }

  updateTransactionStatus(transId, status) {
    if (transId) {
      let params = {
        transId: transId,
        status: status
      }
      this.common.loading++;
      this.api.post('Processes/updateTransactionStatus', params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Transaction ID Not Available");
    }
  }

}

