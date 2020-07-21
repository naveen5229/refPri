import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';

@Component({
  selector: 'ngx-form-data',
  templateUrl: './form-data.component.html',
  styleUrls: ['./form-data.component.scss']
})
export class FormDataComponent implements OnInit {
  formField = [];

  evenArray = [];
  oddArray = [];
  refId = null;
  refType = null;

  Details = [{
    detail_type: 1,
    param_value: null,
    param_date: new Date(),
    param_remarks: null,
  }]


  constructor(public activeModal: NgbActiveModal,
    public common: CommonService,
    private modalService: NgbModal,
    public api: ApiService) {
    console.log("id", this.common.params);
    this. refId= this.common.params.ref.id;
    this.refType = this.common.params.ref.type;
    this.common.handleModalSize('class', 'modal-lg', '650');
    this.getFormDetail();
  }

  ngOnInit() {
  }

  dismiss() {
    this.activeModal.close();
  }


  saveFromDetail() {
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
      refId: this.refId,
      refType: this.refType
    }
    console.log("para......", params);

    this.common.loading++;
    this.api.post('LorryReceiptsOperation/saveLrPodDetails', params)
      .subscribe(res => {
        this.common.loading--;
        console.log("--res", res['data'][0].r_id)
        if (res['data'][0].r_id > 0) {
          this.common.showToast("Successfully Eenterd");
        } else {
          this.common.showError(res['data'][0].r_msg);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError(err);
          console.error('Api Error:', err);
        });
    // }
  }

  getFormDetail() {
    const params = "refId=" + this.refId +
      "&refType=" + this.refType;
    console.log("params", params);
    this.common.loading++;
    this.api.get('Processes/getFormWrtRefId?' + params)
      .subscribe(res => {
        this.common.loading--;
        console.log("resss", res);
        if (res['data']) {
          this.formField = res['data'];
          this.formatArray();
        }
        
      },
        err => {
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