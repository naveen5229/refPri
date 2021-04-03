import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { FormDataTableComponent } from '../../../modals/process-modals/form-data-table/form-data-table.component';
import { GenericModelComponent } from '../../generic-model/generic-model.component';

@Component({
  selector: 'ngx-form-data',
  templateUrl: './form-data.component.html',
  styleUrls: ['./form-data.component.scss']
})
export class FormDataComponent implements OnInit {
  title = 'Form Data';
  formField = [];
  evenArray = [];
  oddArray = [];
  refId = null;
  refType = null;
  transId = null;
  buttonType = false;

  Details = [{
    detail_type: 1,
    param_value: null,
    param_date: new Date(),
    param_remarks: null,
  }];
  isDisabled = false;
  // fieldsVisi = false;
  attachmentFile = [{ name: null, file: null }];

  constructor(public activeModal: NgbActiveModal,
    public common: CommonService,
    private modalService: NgbModal,
    public api: ApiService) {
    // console.log("id", this.common.params);
    this.title = this.common.params.title ? this.common.params.title : 'Form Data';
    this.buttonType = this.common.params.buttonType ? this.common.params.buttonType : false;
    // this.fieldsVisi = this.common.params.fieldsVisi ? this.common.params.fieldsVisi : false;
    if (this.common.params && this.common.params.actionData) {
      this.transId = this.common.params.actionData.transId;
      this.refId = this.common.params.actionData.refId;
      this.refType = this.common.params.actionData.refType;
      this.isDisabled = (this.common.params.actionData.isDisabled) ? true : false;

      this.getFormDetail();
    }
    if (!this.refType) {
      this.title = "State Form";
    } else if (this.refType == 1) {
      this.title = "Action Form";
    } else if (this.refType == 2) {
      this.title = "Transaction Form";
    } else if (this.refType == 3) {
      this.title = "Primary Info Form";
    }
  }

  ngOnInit() { }

  dismiss(res, saveType?) {
    this.activeModal.close({ response: res, saveType: saveType });
  }

  saveFromDetail(saveType) {
    this.Details = this.evenArray.concat(this.oddArray);
    let details = this.Details.map(detail => {
      let copyDetails = Object.assign({}, detail);
      if (detail['r_coltype'] == 'date' && detail['r_value']) {
        copyDetails['r_value'] = this.common.dateFormatter(detail['r_value']);
      }
      return copyDetails;
    });
    const params = {
      info: JSON.stringify(details),
      refId: this.refId,
      refType: this.refType,
      transId: this.transId
    }
    // console.log("para......", params);
    this.common.loading++;
    this.api.post('Processes/saveFormWrtRefId', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.dismiss(true, saveType);
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
    // }
  }

  getFormDetail() {
    const params = "refId=" + this.refId + "&refType=" + this.refType + "&transId=" + this.transId;
    this.common.loading++;
    this.api.get('Processes/getFormWrtRefId?' + params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (res['data']) {
        this.formField = res['data'];
        this.formatArray();
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.error('Api Error:', err);
    });
  }

  AdditionalForm(arraytype, i) {
    let additionalData;
    if (arraytype === 'oddArray') {
      additionalData = this.oddArray[i]._param_child;
    } else if (arraytype === 'evenArray') {
      additionalData = this.evenArray[i]._param_child;
    }
    console.log(additionalData, 'final data')
    this.common.params = { additionalform: additionalData }
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


  formatArray() {
    this.evenArray = [];
    this.oddArray = [];
    this.formField.map(dd => {
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
      }
      if (dd.r_coltype == 'checkbox') {
        dd.r_value = (dd.r_value == "true") ? true : false;
      }
      if (dd.r_coltype == 'entity'){
        if(dd.r_value>0 && dd.r_fixedvalues && dd.r_fixedvalues.length) {
          let entity_value = dd.r_fixedvalues.find(x=>{return x._id==dd.r_value});
          dd['entity_value'] = (entity_value) ? entity_value.option : null;
        }else{
          dd['entity_value'] = null;
        }
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
    // console.log("evenArray", this.evenArray);
    // console.log("oddArray", this.oddArray);
  }

  handleFileSelection(event, i,arrayType) {
    this.common.handleFileSelection(event,null).then(res=>{
      console.log("res", res)
      this.attachmentFile[i]= { name: res['name'], file: res['file'] };
      this.uploadattachFile(arrayType,i);
    },err=>{
      this.common.showError();
    });
  }

  uploadattachFile(arrayType, i) {
    if (!this.attachmentFile[i] || !this.attachmentFile[i].file) {
      this.common.showError("Browse a file first");
      return false;
    }
    let refId = null;
    if (arrayType == 'oddArray') {
      refId = this.oddArray[i].r_colid;
    } else {
      refId = this.evenArray[i].r_colid;
    }
    let params = {
      refId: (refId > 0) ? refId : null,
      name: this.attachmentFile[i].name,
      attachment: this.attachmentFile[i].file
    }
    // console.log('params',params);
    // return;
    this.common.loading++;
    this.api.post('Processes/uploadAttachment', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0]['r_id'] > 0) {
          this.common.showToast(res['msg']);
          this.attachmentFile[i].name = null;
          this.attachmentFile[i].file = null;
          if (arrayType == 'oddArray') {
            this.oddArray[i].r_value = res['data'][0]['r_id'];
          } else {
            this.evenArray[i].r_value = res['data'][0]['r_id'];
          }
        } else {
          this.common.showError(res['msg']);
        }
      } else {
        this.common.showError(res['msg']);
      }
      // console.log("evenArray:::", this.evenArray[i]);
      // console.log("oddArray:::", this.oddArray[i]);
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.error('Api Error:', err);
    });
  }

  getParamAllValues(row) {
    if(this.transId>0){
      let dataparams = {
        view: {
          api: 'Processes/getParamAllValues',
          param: {
            transId: this.transId,
            colId: row.r_colid,
            isDynamic: row.r_isdynamic
          }
        },
        title: "Field Value History"
      }
      this.common.params = { data: dataparams };
      const activeModal = this.modalService.open(GenericModelComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    }
  }

}