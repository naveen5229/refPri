import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';

@Component({
  selector: 'ngx-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss']
})
export class AddTransactionComponent implements OnInit {
  formField = [];
  evenArray = [];
  oddArray = [];
  refId = null;
  refType = 2;

  Details = [{
    detail_type: 1,
    param_value: null,
    param_date: new Date(),
    param_remarks: null,
  }];

  priCatList = [];
  secCatList = [];

  transForm = {
    process: {
      id: null,
      name: ""
    },
    name: "",
    priOwn: {
      id: null,
      name: ""
    },
    identity: null,
    mobileno: null,
    priCat: {
      id: null,
      name: ""
    },
    secCat: {
      id: null,
      name: ""
    },
    type: null,
    locationId: null
  };
  processList = [];

  constructor(public activeModal: NgbActiveModal,
    public common: CommonService,
    private modalService: NgbModal,
    public api: ApiService) {
    console.log("common params:", this.common.params);
    if (this.common.params) {
      this.processList = this.common.params.processList.map(x => { return { id: x._id, name: x.name } });
    }
  }

  ngOnInit() { }

  close(res) {
    this.activeModal.close({ response: res });
  }

  onSelectProcess(procesId) {
    console.log("procesId:", procesId, this.transForm);

    if (procesId) {
      this.getPrimaryCatList();
      this.getSecondaryCatList();
      this.getFormDetail();
    }
  }

  getPrimaryCatList() {
    this.priCatList = [];
    if (!(this.transForm.process.id > 0)) {
      this.common.showError("Process is missing");
      return false;
    }
    this.common.loading++;
    this.api.get("Processes/getProcessPriCat?processId=" + this.transForm.process.id).subscribe(res => {
      this.common.loading--;
      this.priCatList = res['data'];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getSecondaryCatList() {
    this.secCatList = [];
    if (!(this.transForm.process.id > 0)) {
      this.common.showError("Process is missing");
      return false;
    }
    this.common.loading++;
    this.api.get("Processes/getProcessSecCat?processId=" + this.transForm.process.id).subscribe(res => {
      this.common.loading--;
      this.secCatList = res['data'];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  addTransaction() {
    this.Details = this.evenArray.concat(this.oddArray);
    let details = this.Details.map(detail => {
      let copyDetails = Object.assign({}, detail);
      if (detail['r_coltype'] == 'date' && detail['r_value']) {
        copyDetails['r_value'] = this.common.dateFormatter1(detail['r_value']);
      }
      return copyDetails;
    });

    const params = {
      formDetails: JSON.stringify(details),
      refId: this.transForm.process.id,
      refType: this.refType
    }
    console.log("para......", params);

    this.common.loading++;
    this.api.post('Processes/addTransaction', params).subscribe(res => {
      this.common.loading--;
      console.log("--res", res['data'][0].r_id)
      if (res['data'][0].r_id > 0) {
        this.common.showToast("Successfully Eenterd");
      } else {
        this.common.showError(res['data'][0].r_msg);
      }
    }, err => {
      this.common.loading--;
      this.common.showError(err);
      console.error('Api Error:', err);
    });
  }

  getFormDetail() {
    const params = "refId=" + this.transForm.process.id + "&refType=" + this.refType;
    this.common.loading++;
    this.api.get('Processes/getFormWrtRefId?' + params).subscribe(res => {
      this.common.loading--;
      console.log("resss", res);
      if (res['data']) {
        this.formField = res['data'];
        this.formatArray();
      }
    }, err => {
      this.common.loading--;
      console.error('Api Error:', err);
    });
    // }
  }

  formatArray() {
    this.evenArray = [];
    this.oddArray = [];
    this.formField.map(dd => {
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
        console.log("date==", dd.r_value);
      }
      if (dd.r_fixedvalues) {
        dd.r_fixedvalues = dd.r_fixedvalues;
      }
      if (dd.r_colorder % 2 == 0) {
        this.evenArray.push(dd);
      } else {
        this.oddArray.push(dd);
      }
    });
    console.log("evenArray", this.evenArray);
    console.log("oddArray", this.oddArray);
  }

}
