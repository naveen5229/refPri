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
    action: { id: null, name: "" },
    nextAction: { id: null, name: "" },
    standardRemarkId: [],
    remark: null,
    targetTime: new Date(),
    transId: null
  }
  stateDataList = [];
  actionDataList = [];
  nextactionDataList = [];
  remarkDataList = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    // this.common.handleModalSize('class', 'modal-lg', '1300', 'px');

    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.actionData) {
      this.transAction.actionId = this.common.params.actionData.actionId ? this.common.params.actionData.actionId : null;

    };
    this.getStateList();
    this.getActionList();
    this.getnextActionList();
    this.getRemarkList();
  }

  closeModal() {
    this.activeModal.close({ response: false });
  }

  ngOnInit() {
  }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessStateList?processId=" + this.transAction.process.id).subscribe(res => {
      this.common.loading--;
      this.stateDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getActionList() {
    this.common.loading++;
    this.api.get("Processes/getProcessActionList??processId=" + this.transAction.process.id).subscribe(res => {
      this.common.loading--;
      this.actionDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }
  getnextActionList() {
    this.common.loading++;
    this.api.get("Processes/getProcessesActionList?processId=" + this.transAction.process.id).subscribe(res => {
      this.common.loading--;
      this.nextactionDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }


  getRemarkList() {
    this.common.loading++;
    this.api.get("CampaignSuggestion/getRemarkList").subscribe(res => {
      this.common.loading--;
      this.remarkDataList = res['data'];
    },
      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  unselected(variable) {
    if (this.transAction[variable].id) {
      document.getElementById(variable)['value'] = '';
      this.transAction[variable].id = null;
    }
  }

  onselectNextAction(nextActionId) {
    if (nextActionId == 16) {
      this.transAction.targetTime = null;
    } else {
      this.transAction.targetTime = new Date();
    }
  }

  selectStandardRemarks(event) {
    console.log("event", event);
    if (event && event.length) {
      this.transAction.standardRemarkId = event.map(remark => { return { remarkId: remark.id } });
      console.log("ID", this.transAction.standardRemarkId);
    }

  }

  saveCampaignTargetAction() {
    if (this.transAction.state.id == null || this.transAction.action.id == null || this.transAction.nextAction.id == null) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      let targetTime = (this.transAction.targetTime) ? this.common.dateFormatter(this.transAction.targetTime) : null;
      const params = {
        campTargetId: this.transAction.requestId,
        stateId: this.transAction.state.id,
        actionId: this.transAction.action.id,
        nextActId: this.transAction.nextAction.id,
        nextActTarTime: targetTime,
        remark: this.transAction.remark,
        remarkIdList: this.standards.map(remark => { return { remarkId: remark.id } }),
        userCallLogId: null
      };
      console.log("saveCampaignTargetAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionAction ", params)
        .subscribe(res => {
          this.common.loading--;
          console.log(res);
          if (res['success'] == true) {
            this.common.showToast(res['msg']);
            this.resetData();
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
    this.transAction.action = { id: null, name: "" };
    this.transAction.state = { id: null, name: "" };
    this.transAction.action = { id: null, name: "" };
    this.transAction.nextAction = { id: null, name: "" };
    this.transAction.standardRemarkId = [];
    this.transAction.remark = "";
    this.transAction.targetTime = new Date();
    this.standards = [];
  }

}

