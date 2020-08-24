import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-dashboard-field',
  templateUrl: './add-dashboard-field.component.html',
  styleUrls: ['./add-dashboard-field.component.scss']
})
export class AddDashboardFieldComponent implements OnInit {
  btn1 = "Add";
  btn2 = "Reset";
  form = {
    requestId: null,
    process: { id: null, name: null },
    type: null,
    refId: null,
    refType: null,
    infoId: null,
    info: null
  }
  stateOrActionList = [];
  fieldDataList = [];

  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    if (this.common.params && this.common.params.processId) {
      this.form.process.id = (this.common.params.processId) ? this.common.params.processId : null;
      this.form.process.name = (this.common.params.processId) ? this.common.params.processName : null;
    }
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.form.process.id).subscribe(res => {
      this.common.loading--;
      let stateDataList = res['data'];
      this.stateOrActionList = stateDataList.map(x => { return { id: x._state_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getActionList() {
    this.common.loading++;
    this.api.get("Processes/getProcessAction?processId=" + this.form.process.id).subscribe(res => {
      this.common.loading--;
      let actionDataList = res['data'] || [];
      this.stateOrActionList = actionDataList.map(x => { return { id: x._action_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getFieldList() {
    this.common.loading++;
    let params = "refId=" + this.form.refId + "&refType=" + this.form.refType;
    this.api.get('Processes/getProcessFormField?' + params).subscribe(res => {
      this.common.loading--;
      let fieldData = res['data'] || [];
      this.fieldDataList = fieldData.map(x => { return { id: x.r_colid, name: x.r_coltitle, r_colid: x.r_colid, r_isdynamic: x.r_isdynamic, r_selected: x.r_selected } });
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  resetData() {
    this.form = {
      requestId: null,
      process: { id: null, name: null },
      type: null,
      refId: null,
      refType: null,
      infoId: null,
      info: null
    };
    this.stateOrActionList = [];
    this.fieldDataList = [];
  }

  onSelectType() {
    this.form.refId = null;
    this.form.refType = null;
    this.stateOrActionList = [];
    this.fieldDataList = [];
    console.log("onSelectType:", this.form);
    if (this.form.type == 1) {
      this.form.refType = 0;
      this.getStateList();
    } else if (this.form.type == 2) {
      this.form.refType = 1;
      this.getActionList();
    } else if (this.form.type == 3) {
      this.form.refType = 2;
      this.form.refId = this.form.process.id;
      this.getFieldList();
    } else if (this.form.type == 4) {
      this.form.refType = 3;
      this.form.refId = this.form.process.id;
      this.getFieldList();
    }
  }

  onSelectRefId() {
    this.fieldDataList = [];
    console.log("onSelectRefId:", this.form);
    this.getFieldList();
  }

  onSelectField() {
    if (this.form.infoId) {
      let selected = this.fieldDataList.find(x => { return x.id == this.form.infoId });
      console.log("selected:", selected);
      if (selected) {
        this.form.info = { r_colid: selected.r_colid, r_isdynamic: selected.r_isdynamic, r_selected: selected.r_selected };
      } else {
        this.form.info = null;
      }
    }
  }

  AddField() {
    console.log("AddField:", this.form);
    let params = {
      requestId: this.form.requestId,
      processId: this.form.process.id,
      refId: this.form.refId,
      refType: this.form.refType,
      info: (this.form.info) ? JSON.stringify(this.form.info) : null
    }
    this.common.loading++;
    this.api.post('Processes/saveDashboardReportField', params).subscribe(res => {
      this.common.loading--;
      // console.log(res);
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.resetData();
        } else {
          this.common.showError(res['data'][0].y_msg);
        }

      } else {
        this.common.showError(res['msg']);
      }

    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Err:', err);
    });
  }

}
