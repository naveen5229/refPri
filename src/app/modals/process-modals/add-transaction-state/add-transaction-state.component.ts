import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

@Component({
  selector: 'ngx-add-transaction-state',
  templateUrl: './add-transaction-state.component.html',
  styleUrls: ['./add-transaction-state.component.scss']
})
export class AddTransactionStateComponent implements OnInit {
  title = "";
  button = "Add";
  standards = [];
  transState = {
    process: { id: null, name: "" },
    state: { id: null, name: "" },
    nextState: { id: null, name: "" },
    transId: null
  }
  stateDataList = [];
  nextStateDataList = [];

  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    console.log("params:", this.common.params);

    this.button = this.common.params.button ? this.common.params.button : 'Add';
    if (this.common.params && this.common.params.actionData) {
      this.transState.process.id = (this.common.params.actionData.processId > 0) ? this.common.params.actionData.processId : null;
      this.transState.process.name = (this.common.params.actionData.processId > 0) ? this.common.params.actionData.processName : null;
      this.transState.transId = (this.common.params.actionData.transId > 0) ? this.common.params.actionData.transId : null;
      this.transState.state.id = (this.common.params.actionData.rowData._state_id > 0) ? this.common.params.actionData.rowData._state_id : null;
      this.transState.state.name = (this.common.params.actionData.rowData._state_id > 0) ? this.common.params.actionData.rowData.state_name : null;

      if (this.transState.state.id > 0) {
        this.onSelectState();
      }
    };
    this.getStateList();
  }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  ngOnInit() { }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.transState.process.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let stateDataList = res['data'];
      this.stateDataList = stateDataList.map(x => { return { id: x._state_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  onSelectState() {
  }

  saveTransNextState() {
    if (!this.transState.state.id || !this.transState.nextState.id) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      const params = {
        requestId: null,
        transId: this.transState.transId,
        stateId: this.transState.state.id,
        nextStateId: (this.transState.nextState.id > 0) ? this.transState.nextState.id : null,
      };
      // console.log("saveTransNextAction:", params);
      this.common.loading++;
      this.api.post("Processes/addTransactionState ", params).subscribe(res => {
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
  }

}

