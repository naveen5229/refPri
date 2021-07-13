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
  expandTable = null;
  title = 'Ticket Closing Form';
  evenArray = [];
  oddArray = [];
  ticketFormFields;
  refId = null;
  refType = null;
  ticketId = null;
  requestId = null;
  info = null;
  isDisabled = false;
  attachmentFile = [{ name: null, file: null }];

  constructor(public activeModal: NgbActiveModal, public common: CommonService, public api: ApiService, public modalService: NgbModal, public userService: UserService) {
    this.title = this.common.params.title ? this.common.params.title : 'Ticket Closing Form';
    console.log("TicketClosingFormComponent -> constructor -> common", common)
    if (this.common.params && this.common.params.actionData) {
      this.ticketId = this.common.params.actionData.ticketId;
      this.refId = this.common.params.actionData.refId;
      this.refType = this.common.params.actionData.refType;
      this.isDisabled = (this.common.params.actionData.isDisabled) ? true : false;

      this.getTicketFormField();

setTimeout(() => {
        this.checkAllExpandedTables();
}, 200);


    }
  }



//  AddTableRow() {
//     let temp = JSON.parse(JSON.stringify(this.tableHeader));
//     temp.forEach(e => {
//       e.param_value = (e.param_type == 'date') ? new Date() : null;
//     });
//     this.additionalFields.push(temp);
//   }

//   addTransaction() {
//     console.log("additionalFields:", this.additionalFields);
//     this.additionalFields.forEach(element => {
//       element.forEach(element2 => {
//         if (element2['isNotBindFixedvalue']) {
//           element2['param_value'] = element2['notBindFixedvalue'];
//         }
//       });
//     });
//     this.tableUpdate.next(this.additionalFields);
//     // this.tableUpdate.next(details);
//   }


  submitFormDetail(){

  console.log('oddArray',this.oddArray);
  console.log('evenArray',this.evenArray);

  }

  getTicketFormField() {
    const params = "refId=" + this.refId + "&refType=" + this.refType + "&ticketId=" + this.ticketId;
    console.log("params", params);
    this.common.loading++;
    this.api.get('Ticket/getTicketFormFieldById?' + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
      if (res['data']) {
        let ticketFormFields = res['data'];
        this.ticketFormFields = ticketFormFields.map(data => { data.isExpand = false;
        return data })
        this.formatArray();
      }
    }, err => {
      this.common.showError();
      this.common.loading--;
      console.error('Api Error:', err);
    });
  }

  onSelectNotBind(event, row) {
    let selectEl = event.target;
    let testval = selectEl.options[selectEl.selectedIndex].getAttribute('isNotBind');
    row.isNotBindFixedvalue = false;
    if (JSON.parse(testval)) {
      row.isNotBindFixedvalue = true;
    }
  }

  formatArray() {
    this.evenArray = [];
    this.oddArray = [];
    this.ticketFormFields.map(dd => {
      dd["isNotBindFixedvalue"] = false;
      dd["notBindFixedvalue"] = null;
      if (dd.r_coltype == 'date') {
        dd.r_value = dd.r_value ? new Date(dd.r_value) : new Date();
        console.log("date==", dd.r_value);
      }
      if (dd.r_coltype == 'checkbox') {
        dd.r_value = (dd.r_value == "true") ? true : false;
      }
      if (dd.r_coltype == 'entity') {
        if (dd.r_value > 0 && dd.r_fixedvalues && dd.r_fixedvalues.length) {
          let entity_value = dd.r_fixedvalues.find(x => { return x._id == dd.r_value });
          dd['entity_value'] = (entity_value) ? entity_value.option : null;
        } else {
          dd['entity_value'] = null;
        }
      }
      if (dd.r_value && dd.r_fixedvalues && dd.r_fixedvalues.length) { // for not bind dropdown
        let notBindFixedvalue = dd.r_fixedvalues.find(x => { return x.option == dd.r_value });
        if (!notBindFixedvalue) {
          let notBindOption = dd.r_fixedvalues.find(x => x.isNonBind);
          dd["isNotBindFixedvalue"] = true;
          dd["notBindFixedvalue"] = dd.r_value;
          dd["r_value"] = (notBindOption && notBindOption.option) ? notBindOption.option : null;
        }
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

  dismiss(res, isContinue) {
    this.activeModal.close({ response: res, isContinue: isContinue });
  }

  saveFromDetail(isContinue) {
    let detailsTemp = this.evenArray.concat(this.oddArray);
    console.log('detailsTemp: ', detailsTemp);
    let details = detailsTemp.map(detail => {
      let copyDetails = Object.assign({}, detail);
      if (detail['r_coltype'] == 'date' && detail['r_value']) {
        copyDetails['r_value'] = this.common.dateFormatter(detail['r_value']);
      } else if (detail['isNotBindFixedvalue']) {
        copyDetails['r_value'] = detail['notBindFixedvalue'];
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
    // console.log("para......", params,detailsTemp);return false;
    this.common.loading++;
    this.api.post('Ticket/saveTicketFormByRefId', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            // this.common.showToast(res['data'][0].y_msg);
            this.dismiss(true, isContinue);
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

  handleFileSelection(event, i, arrayType) {
    this.common.handleFileSelection(event, null).then(res => {
      console.log("handleFileSelection:", res);
      this.attachmentFile[i] = { name: res['name'], file: res['file'] };
      this.uploadattachFile(arrayType, i)
    }, err => {
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
    this.api.post('Ticket/uploadAttachment', params).subscribe(res => {
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

  tableEvents(event, i, tableType) {
    console.log("tableEvents - event", event, tableType);
    if (tableType === 'even') {
      this.evenArray[i]._param_child = JSON.parse(JSON.stringify(event));
      this.evenArray[i].isExpand = false;
    } else {
      this.oddArray[i]._param_child = JSON.parse(JSON.stringify(event));
      this.oddArray[i].isExpand = false;
    }
    }

  checkAllExpandedTables() {
    this.oddArray.forEach(obj => { obj.isExpand = true; });
    console.log('this.oddArray: ', this.oddArray);
    this.evenArray.forEach(obj => { obj.isExpand = true; });
    console.log('this.evenArray: ', this.evenArray);

  //  setTimeout(() => {
  //  let submit = document.querySelectorAll('ngx-table-view .submit-btn');
  //  submit.forEach(item=>  item.remove());
  //  }, 100);



    // if (arrayType === 'odd') {
    //   let index = this.oddArray.findIndex(ele => {
    //     return ele.r_colid === checkedOf.r_colid
    //   });
    //   this.oddArray[index].isExpand = status
    //   console.log(index, status)
    // } else {
    //   let index = this.evenArray.findIndex(ele => {
    //     return ele.r_colid === checkedOf.r_colid
    //   });
    //   this.evenArray[index].isExpand = status;
    //   console.log(index, status)
    // }
  }

  ngOnInit() {
  this.checkAllExpandedTables();
  }

}


