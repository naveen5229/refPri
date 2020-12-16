import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { UserService } from '../../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDataTableComponent } from '../../process-modals/form-data-table/form-data-table.component';

@Component({
  selector: 'ngx-ticket-closing-form',
  templateUrl: './ticket-closing-form.component.html',
  styleUrls: ['./ticket-closing-form.component.scss']
})
export class TicketClosingFormComponent implements OnInit {
  title = 'Ticket Closing Form';
  evenArray = [];
  oddArray = [];
  ticketFormFields;
  refId = null;
  refType = null;
  ticketId = null;
  requestId =null;
  info = null;
  isDisabled = false;

  constructor(public activeModal: NgbActiveModal,public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) { 
    this.title = this.common.params.title ? this.common.params.title : 'Ticket Closing Form';
    console.log("TicketClosingFormComponent -> constructor -> common", common)
    if (this.common.params && this.common.params.actionData) {
      this.ticketId = this.common.params.actionData.ticketId;
      this.refId = this.common.params.actionData.refId;
      this.refType = this.common.params.actionData.refType;
      // this.isDisabled = (this.common.params.actionData.isDisabled) ? true : false;

      this.getTicketFormField();
    }
  }

  ngOnInit() {
  }
  getTicketFormField() {
    const params = "refId=" + this.refId + "&refType=" + this.refType + "&ticketId=" + this.ticketId;
    console.log("params", params);
    this.common.loading++;
    this.api.get('Ticket/getTicketFormFieldById?' + params).subscribe(res => {
      this.common.loading--;
      console.log("resss", res);
      if (res['data']) {
        this.ticketFormFields = res['data'];
        this.formatArray();
      }
    }, err => {
      this.common.showError();
      this.common.loading--;
      console.error('Api Error:', err);
    });
  }

  formatArray() {
    this.evenArray = [];
    this.oddArray = [];
    this.ticketFormFields.map(dd => {
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
        console.log("date==", dd.r_value);
      }
      if (dd.r_coltype == 'checkbox') {
        dd.r_value = (dd.r_value == "true") ? true : false;
      }
      if (dd.r_fixedvalues) {
        dd.r_fixedvalues = dd.r_fixedvalues;
      }
      if (dd.r_colorder && dd.r_colorder % 2 == 0) {
        this.evenArray.push(dd);
      } else {
        this.oddArray.push(dd);
      }
    });
    console.log("evenArray", this.evenArray);
    console.log("oddArray", this.oddArray);
  }

  dismiss(res,isContinue) {
    this.activeModal.close({ response: res,isContinue:isContinue });
  }

  saveFromDetail(isContinue) {
     let detailsTemp = this.evenArray.concat(this.oddArray);
    let details = detailsTemp.map(detail => {
      let copyDetails = Object.assign({}, detail);
      if (detail['r_coltype'] == 'date' && detail['r_value']) {
        copyDetails['r_value'] = this.common.dateFormatter(detail['r_value'],null,false);
      }

      return copyDetails;
    });

    const params = {
      info: JSON.stringify(details),
      refId: this.refId,
      refType: this.refType,
      ticketId: this.ticketId,
      requestId: null
    }
    console.log("para......", params);

    this.common.loading++;
    this.api.post('Ticket/saveTicketFormByRefId', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            // this.common.showToast(res['data'][0].y_msg);
            this.dismiss(true,isContinue);
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.error('Api Error:', err);
      });
  }

  AdditionalForm(arraytype, i) {
    let additionalData = null;
    if (arraytype === 'oddArray') {
      additionalData = this.oddArray[i]._param_child;
    } else if (arraytype === 'evenArray') {
      additionalData = this.evenArray[i]._param_child;
    }
    console.log(additionalData, 'final data');
    this.common.params = { additionalform: (additionalData && additionalData.length > 0) ? additionalData : null };
    const activeModal = this.modalService.open(FormDataTableComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.data, 'response')
        if (data.data) {
          if (arraytype === 'oddArray') {
            this.oddArray[i]._param_child = data.data;
          } else if (arraytype === 'evenArray') {
            this.evenArray[i]._param_child = data.data;
          }
        }
      }
    });
  }
}
