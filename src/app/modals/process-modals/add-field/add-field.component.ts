import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssignFieldsComponent } from '../assign-fields/assign-fields.component';
import { AddFieldTableComponent } from '../add-field-table/add-field-table.component';

@Component({
  selector: 'ngx-add-field',
  templateUrl: './add-field.component.html',
  styleUrls: ['./add-field.component.scss']
})
export class AddFieldComponent implements OnInit {
  // stateType = null;
  title = "Add Field";
  refId = null;
  refType = null;
  formType = null; //null=process, 11=ticket
  order = null;
  types = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
    { id: 'attachment', name: 'Attachment' },
    { id: 'table', name: 'Table' },
    { id: 'checkbox', name: 'Checkbox' }
  ];
  child_types = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
  ];
  // childArray = [{
  //   param: '',
  //   type: '',
  //   is_required: false,
  // }]
  childArray = [];
  fixValues = [{
    option: '',
    isNonBind: false
  }];
  fixValuesChild = [{
    option: ''
  }];
  isFixedValue = false;
  isFixedValueChild = false;
  isRequired = false;
  fieldId = null;
  typeId = null;
  name = null;

  data = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  globalFiledList = [];
  headings = [];
  valobj = {};
  entityTypeList = [];

  btn1 = "Add";
  btn2 = "Cancel";
  editable: true;
  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    this.refId = this.common.params.ref.id;
    this.refType = this.common.params.ref.type;
    this.formType = (this.common.params.formType) ? this.common.params.formType : null;
    // this.types = [
    //   { id: 'text', name: 'Text' },
    //   { id: 'number', name: 'Number' },
    //   { id: 'date', name: 'Date' }
    // ];

    if (this.formType == 11) {
      if (this.refType == 1) {
        this.title = "Add Ticket closing Form Field";
      } else {
        this.title = "Add Ticket Form Field";
      }
      this.types = [
        { id: 'text', name: 'Text' },
        { id: 'number', name: 'Number' },
        { id: 'date', name: 'Date' },
        { id: 'table', name: 'Table' },
        { id: 'checkbox', name: 'Checkbox' },
        { id: 'attachment', name: 'Attachment' },
        { id: 'entity', name: 'Entity' }
      ];
      this.getEntityType();
    } else if (!this.refType) {
      this.title = "Add State Form Field";
    } else if (this.refType == 1) {
      this.title = "Add Action Form Field";
    } else if (this.refType == 2) {
      this.title = "Add Transaction Form Field";
    } else if (this.refType == 3) {
      this.title = "Add Primary Info Form Field";
    }
    this.getFieldName();
    if (!this.formType && this.refType == 2) {
      this.getGlobalFormField('Processes/getGlobalFormField');
    } else if (this.formType == 11 && this.refType == 0) {
      this.getGlobalFormField('Ticket/getGlobalFormField');
    }
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes')
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] === 0) { this.common.showError(res['msg']); return false; };
        if (!res['data']) return;
        this.entityTypeList = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  getGlobalFormField(api) {
    this.globalFiledList = [];
    let params = "?refId=" + this.refId + "&refType=" + this.refType;
    this.common.loading++;
    this.api.get(api + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.globalFiledList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Err:', err);
    });
  }

  Add() {
    if (((this.name.toLowerCase()).match(/mobile/) || (this.name.toLowerCase()).match(/contact/)) && this.typeId.match(/number/)) {
      this.common.params = {
        title: 'Field Duplicacy',
        description: `<b>&nbsp;` + 'Please use Global Fields to add contact name or contact number.' +
          `<br>` + `Otherwise, it may occur problem in analytics.` +
          `<br>` + `Continue Anyway` + `<b>` + `.`,
        btn1: `Continue`,
        btn2: `Remove`
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'md', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.confirmAdd();
        } else {
          this.resetData();
        }
      });
    } else {
      this.confirmAdd();
    }
  }

  confirmAdd() {
    let childArray = (this.childArray && this.childArray.length > 0) ? this.childArray.map(x => { return { param: x.param, _param_name: x._param_name, type: x.type, order: x.order, is_required: x.is_required, drpOption: x._param_info, param_id: x._param_id } }) : null;
    let tmpJson = {
      param: this.name,
      type: this.typeId,
      drpOption: (this.isFixedValue) ? this.fixValues : null,
      is_required: this.isRequired,
      order: this.order,
      param_child: childArray
    }
    let params = {
      refid: this.refId,
      refType: this.refType,
      type: this.formType,
      info: JSON.stringify(tmpJson),
      requestId: (this.fieldId > 0) ? this.fieldId : null,
      isDelete: 0
    }

    let error_count = false;
    let error_multi_notbind = false;
    if (tmpJson.type === 'table') {
      tmpJson.param_child.forEach(ele => {
        if (ele.param.length == 0 || !ele.type.length) {
          error_count = true;
        }
      })
    } else if (tmpJson.drpOption) {
      let notbindList = tmpJson.drpOption.filter(x => x.isNonBind);
      if (notbindList && notbindList.length > 1) {
        error_multi_notbind = true;
      }
    }

    if (!this.name || !this.typeId) {
      this.common.showError('Field Name or Type is missing');
      return false;
    }
    if (error_count) {
      this.common.showError('Table Field Name or Type is missing');
      return false;
    }
    if (error_multi_notbind) {
      this.common.showError('Mark only single input-box for fixed value option');
      return false;
    }
    let apiName = (this.formType == 11) ? 'Ticket/addTicketProcessMatrix' : 'Processes/addProcessMatrix';
    // console.log("apiName:", apiName, params, tmpJson); return false;
    this.common.loading++;
    this.api.post(apiName, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] > 0) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast("Successfully added");
          this.resetData();
          this.getFieldName();
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      };
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Err:', err);
    });
  }

  getFieldName() {
    let params = "?refId=" + this.refId + "&refType=" + this.refType;
    let apiName = (this.formType == 11) ? 'Ticket/getTicketProcessMatrix' : 'Processes/getProcessMatrix';
    // console.log("apiName:", apiName); return false;
    this.common.loading++;
    this.api.get(apiName + params)
      .subscribe(res => {
        this.common.loading--;
        this.data = [];
        this.resetTable();
        this.headings = [];
        this.valobj = {};
        if (res['code'] > 0) {
          if (!res['data']) return;
          this.data = res['data'];
          this.data.length ? this.setTable() : this.resetTable();
          console.log(this.data)
        } else {
          this.common.showError(res['msg']); return false;
        };
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  resetTable() {
    this.table.data = {
      headings: {},
      columns: []
    };
  }

  setTable() {
    this.table.data = {
      headings: this.generateHeadings(),
      columns: this.getTableColumns()
    };
    return true;
  }

  generateHeadings() {
    let headings = {};
    for (var key in this.data[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.data.map(doc => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(doc)
          };
        } else if (key == 'param_info') {
          column[key] = { value: this.setStringData(doc[key]), class: 'black', action: '' };
        } else {
          column[key] = { value: doc[key], class: 'black', action: '' };
        }
      }
      if (doc._col_unassigned == 0) {
        column['style'] = { 'background': 'antiquewhite' };
      }
      columns.push(column);
    })

    return columns;
  }

  setStringData(arr) {
    let string = '';
    if (arr) {
      arr.map(ele => {
        string = string + ele.option + ',';
      });
    }
    return string;
  }

  actionIcons(row) {
    let icons = [];
    icons.push(
      { class: "fas fa-trash-alt", action: this.deleteRow.bind(this, row) },
      { class: "fas fa-edit edit", action: this.setData.bind(this, row) },
      // { class: "fas fa-plus", action: this.openOptionModal.bind(this, row) },
    )
    return icons;
  }

  deleteRow(row) {
    if (row._matrixid) {
      let params = {
        refid: this.refId,
        refType: this.refType,
        type: this.formType,
        info: JSON.stringify({ temp: null }),
        requestId: row._matrixid,
        isDelete: 1
      }
      this.common.params = {
        title: 'Delete  ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          let apiName = (this.formType == 11) ? 'Ticket/addTicketProcessMatrix' : 'Processes/addProcessMatrix';
          // console.log("apiName:", apiName,params); return false;
          this.common.loading++;
          this.api.post(apiName, params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['data'][0].y_msg);
                this.getFieldName();
              } else {
                this.common.showError(res['data'][0].y_msg);
              }
            } else {
              this.common.showError(res['msg']);
            }
          }, err => {
            this.common.loading--;
            this.common.showError();
            console.log('Error: ', err);
          });
        }
      });
    } else {
      this.common.showError("Invalid Request");
    }
  }

  addFixValue() {
    if (this.fixValues[this.fixValues.length - 1].option) {
      this.fixValues.push({ option: '', isNonBind: false })
    } else {
      this.common.showError('Enter Value First')
    }
  }

  setData(data) {
    this.typeId = data.param_type;
    this.name = data._param_name;
    if (data._param_child && data._param_child.length > 0) {
      data._param_child.map((ele, index) => {
        this.childArray.push({ param: '', type: '', order: null, is_required: false, _param_info: null, _param_id: null, _used_in: null });
        this.childArray[index]['param'] = ele.param_name;
        this.childArray[index]['_param_name'] = ele._param_name;
        this.childArray[index]['type'] = ele.param_type;
        this.childArray[index]['order'] = ele.param_order;
        this.childArray[index]['is_required'] = ele.is_required;
        this.childArray[index]['_param_info'] = ele._param_info ? ele._param_info : null;
        this.childArray[index]['_param_id'] = ele.param_id ? ele.param_id : null;
        this.childArray[index]['_used_in'] = ele._used_in ? ele._used_in : null;
      });
    }
    this.fixValues = data.param_info ? data.param_info : this.fixValues;
    this.isFixedValue = (data.param_info && data.param_info.length) ? true : false;
    this.isRequired = data.is_required;
    this.fieldId = data._matrixid;
    this.btn1 = "Update";
  }

  resetData() {
    this.typeId = null;
    this.name = null;
    this.isFixedValue = false;
    this.isRequired = false
    this.fieldId = null;
    this.fixValues = [{
      option: '',
      isNonBind: false
    }];
    this.btn1 = "Add";
    this.childArray = []
  }

  openAssignForm() {
    let ref = {
      id: this.refId,
      type: this.refType
    }
    this.common.params = { ref: ref, formType: this.formType };
    const activeModal = this.modalService.open(AssignFieldsComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.response);
      }
    });
  }

  openAddFieldTable() {
    console.log('childarray:', this.childArray)
    this.common.params = { data: (this.childArray && this.childArray.length > 0) ? this.childArray : null, formType: this.formType };
    const activeModal = this.modalService.open(AddFieldTableComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('added table:', data);
      if (data.response) {
        this.childArray = (data.data && data.data.length > 0) ? data.data : [];
      }
    });
  }

}

