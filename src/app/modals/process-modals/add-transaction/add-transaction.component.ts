import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { FormDataTableComponent } from '../../../modals/process-modals/form-data-table/form-data-table.component';
import { ChatboxComponent } from '../chatbox/chatbox.component';
import { GenericModelComponent } from '../../generic-model/generic-model.component';

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
    requestId: null,
    showDynField: false,
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
    isAutoIdentity: 0,
    emailStatic: null,
    mobileno: null,
    priCat: {
      id: null,
      name: ""
    },
    secCat: {
      id: null,
      name: ""
    },
    type: {
      id: null,
      name: ""
    },
    location: {
      id: null,
      name: "",
      lat: null,
      long: null
    },
    address: ""
  };
  processList = [];
  typeList = [];
  adminList = [];
  isDisabled = false;
  attachmentFile = [{ name: null, file: null }];

  constructor(public activeModal: NgbActiveModal,
    public common: CommonService,
    private modalService: NgbModal,
    public api: ApiService) {
    console.log("common params:", this.common.params);
    if (this.common.params) {
      this.processList = (this.common.params.processList && this.common.params.processList.length) ? this.common.params.processList.map(x => { return { id: x._id, name: x.name, _default_identity: x._default_identity } }) : [];
      this.adminList = this.common.params.adminList;
    }
    if (this.common.params && this.common.params.rowData) {
      this.transForm.requestId = this.common.params.rowData.transId;
      this.transForm.process.id = this.common.params.rowData.processId;
      this.transForm.process.name = this.common.params.rowData.processName;
      this.transForm.identity = this.common.params.rowData.identity;
      this.transForm.priOwn.id = this.common.params.rowData.priOwnId;
      this.isDisabled = (this.common.params.rowData.isDisabled) ? true : false;
    }
    if (this.common.params && this.common.params.processList){
      for (var i=0; i<this.common.params.processList.length; i++){
        if(this.transForm.process.id==this.common.params.processList[i]._id){
        console.log(this.common.params.processList[i]);
          this.transForm.isAutoIdentity = this.common.params.processList[i]._default_identity
        }

     }
      console.log("this.transForm.isAutoIdentity",this.transForm.isAutoIdentity);
      // this.onSelectProcess();
    }
  }

  ngOnInit() { }

  close(res) {
    this.activeModal.close({ response: res });
  }

  onSelectProcess() {
    if (this.transForm.process.id > 0) {
      this.getPrimaryCatList();
      this.getSecondaryCatList();
      this.getProcessTypeList();
      this.getFormDetail();
      this.transForm.showDynField = true;
    } else {
      this.common.showError("Process is missing");
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
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let priCatList = res['data'];
      this.priCatList = priCatList.map(x => { return { id: x._id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
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
    this.common.params = { additionalform: (additionalData && additionalData.length > 0) ? additionalData : null, isDisabled:this.isDisabled };
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

  getSecondaryCatList() {
    this.secCatList = [];
    if (!(this.transForm.process.id > 0)) {
      this.common.showError("Process is missing");
      return false;
    }
    this.common.loading++;
    this.api.get("Processes/getProcessSecCat?processId=" + this.transForm.process.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let secCatList = res['data'];
      this.secCatList = secCatList.map(x => { return { id: x._id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getProcessTypeList() {
    this.secCatList = [];
    if (!(this.transForm.process.id > 0)) {
      this.common.showError("Process is missing");
      return false;
    }
    this.common.loading++;
    this.api.get("Processes/getProcessType?processId=" + this.transForm.process.id).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      let typeList = res['data'];
      this.typeList = typeList.map(x => { return { id: x._id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  addTransaction(isChat = null) {
    this.Details = this.evenArray.concat(this.oddArray);
    let details = this.Details.map(detail => {
      let copyDetails = Object.assign({}, detail);
      if (detail['r_coltype'] == 'date' && detail['r_value']) {
        copyDetails['r_value'] = this.common.dateFormatter(detail['r_value']);
      }
      return copyDetails;
    });
    // console.log(details, 'updated details from add transaction')
    const params = {
      processId: this.transForm.process.id,
      processName: this.transForm.process.name,
      name: this.transForm.name,
      identity: this.transForm.identity,
      priOwnId: this.transForm.priOwn.id,
      mobileno: this.transForm.mobileno,
      email: this.transForm.emailStatic,
      additionalInfo: JSON.stringify(details),
      requestId: (this.transForm.requestId > 0) ? this.transForm.requestId : null,
    }
    // console.log("params:",params);return false;
    this.common.loading++;
    this.api.post('Processes/addTransaction', params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.close(true);
          if (isChat == 1) {
            let editData = {
              transactionid: res['data'][0].y_id,
              lastSeenId: null,
              tabType: -99,
              priOwnId: (params.priOwnId > 0) ? params.priOwnId : null,
              rowData: { _transactionid: res['data'][0].y_id, _processid: params.processId, _processname: params.processName, identity: params.identity, _pri_own_id: (params.priOwnId > 0) ? params.priOwnId : null }
            }
            this.common.params = {
              editData, title: "Transaction Comment", button: "Save", subTitle: params.identity, fromPage: 'process',
              userList: this.adminList,
              groupList: null,
              departmentList: null
            };
            const activeModal = this.modalService.open(ChatboxComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });

          }
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

  getFormDetail() {
    const params = "refId=" + this.transForm.process.id + "&refType=" + this.refType + "&transId=" + this.transForm.requestId;
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
    console.log("evenArray", this.evenArray);
    console.log("oddArray", this.oddArray);
  }

  handleFileSelection(event, i,arrayType) {
    this.common.loading++;
    this.common.getBase64(event.target.files[0]).then((res: any) => {
      this.common.loading--;
      let file = event.target.files[0];
      console.log("Type:", file, res);
      var ext = file.name.split('.').pop();
      let formats = ["jpeg", "jpg", "png", 'xlsx', 'xls', 'docx', 'doc', 'pdf', 'csv'];
      if (formats.includes(ext)) {
      } else {
        this.common.showError("Valid Format Are : jpeg, png, jpg, xlsx, xls, docx, doc, pdf,csv");
        return false;
      }
      this.attachmentFile[i] = { name: file.name, file: res };
      this.uploadattachFile(arrayType,i);
      console.log("attachmentFile-" + i + " :", this.attachmentFile)
    }, err => {
      this.common.loading--;
      console.error('Base Err: ', err);
    })
  }

  handleFileSelectionForPdf(event, i, arrayType) {
    this.common.handleFileSelection(event,["pdf"]).then(res=>{
      console.log("handleFileSelection:",res);
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
    if(this.transForm.requestId>0){
      let dataparams = {
        view: {
          api: 'Processes/getParamAllValues',
          param: {
            transId: this.transForm.requestId,
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
