import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../Service/common/common.service';
import { ApiService } from '../../Service/Api/api.service';
import { UserService } from '../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDataTableComponent } from '../process-modals/form-data-table/form-data-table.component';

@Component({
  selector: 'ngx-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss']
})
export class EntityFormComponent implements OnInit {
  title = 'Entity Form';
  evenArray = [];
  oddArray = [];
  formFields;
  refId = null;
  refType = 0;
  entityId =null;
  info = null;
  isDisabled = false;
  attachmentFile = [{ name: null, file: null }];

  constructor(public activeModal: NgbActiveModal,public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) { 
    this.title = this.common.params.title ? this.common.params.title : 'Entity Form';
    console.log("common:", common)
    if (this.common.params && this.common.params.entity) {
      this.refId = this.common.params.entity.entity_type_id;
      this.entityId = this.common.params.entity.id;
      this.isDisabled = (this.common.params.entity.isDisabled) ? true : false;
      this.getEntityFormField();
    }
  }

  ngOnInit() {}

  getEntityFormField() {
    const params = "refId=" + this.refId + "&refType=" + this.refType + "&requestId="+this.entityId;
    this.common.loading++;
    this.api.get('Entities/getFormWrtRefId?' + params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (res['data']) {
        this.formFields = res['data'];
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
    this.formFields.map(dd => {
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
        console.log("date==", dd.r_value);
      }
      if (dd.r_coltype == 'checkbox') {
        dd.r_value = (dd.r_value == "true") ? true : false;
      }else if (dd.r_coltype == 'number') {
        dd.r_value = (dd.r_value) ? Number(dd.r_value) : dd.r_value;
      }
      if (dd.r_fixedvalues) {
        dd.r_fixedvalues = dd.r_fixedvalues;
      }
      // if (dd.r_colorder && dd.r_colorder % 2 == 0) {
      //   this.evenArray.push(dd);
      // } else {
        this.oddArray.push(dd);
      // }
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
      refId: this.entityId,
      refType: this.refType,
    }
    this.common.loading++;
    this.api.post('Entities/saveFormWrtRefId', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
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

  handleFileSelection(event, i) {
    this.common.handleFileSelection(event,null).then(res=>{
      console.log("handleFileSelection:",res);
      this.attachmentFile[i]= { name: res['name'], file: res['file'] };
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
    this.common.loading++;
    this.api.post('Entities/uploadAttachment', params).subscribe(res => {
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

}
