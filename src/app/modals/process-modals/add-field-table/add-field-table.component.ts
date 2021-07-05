import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-field-table',
  templateUrl: './add-field-table.component.html',
  styleUrls: ['./add-field-table.component.scss']
})
export class AddFieldTableComponent implements OnInit {
  formType = null;
  title = "Add Table Columns";
  types = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'attachment', name: 'Attachment' },
    { id: 'entity', name: 'Entity' }
  ];
  childArray = {
    index: null,
    param: '',
    _param_name: '',
    type: '',
    order: null,
    is_required: false,
    _param_info: null,
    _param_id: null,
    _used_in: null
  };
  entityTypeList = [];
  finalArray = [];
  isFixedValue = false;
  fixValues = [{
    // option: ''
    option: '',
    isNonBind: false
  }];

  // data = [];
  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  valobj = {};

  btn1 = "Add";
  btn2 = "Cancel";
  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    console.log("params:", this.common.params);
    this.formType = this.common.params.formType;
    this.getEntityType();
    if (this.common.params && this.common.params.data) {
      this.finalArray = this.common.params.data;
      this.getFieldName();
    }
  }

  ngOnInit() {
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

  AddTable(child_name) {
    if (child_name.length == 0) {

    } else {
      this.finalArray.push(this.childArray);
    }
    console.log(this.childArray, 'childArray')
  }

  closeModal(res) {
    this.activeModal.close({ response: res, data: (this.finalArray && this.finalArray.length > 0) ? this.finalArray : null });
  }

  Add() {
    console.log("Add:", this.childArray);
    this.entityTypeList.map(ele => {
      if (ele._id == this.childArray._param_name) this.childArray.param = ele.type;
    })
    if (!this.childArray.param || !this.childArray.type) {
      this.common.showError('Field Name or Type is missing');
      return false;
    }
    let temp = JSON.parse(JSON.stringify(this.childArray));
    console.log(" ~ temp", temp)
    let error_multi_notbind = false;
    if (this.isFixedValue && this.fixValues && this.fixValues.length > 0) {
      let notbindList = this.fixValues.filter(x => x.isNonBind);
      if (notbindList && notbindList.length > 1) {
        error_multi_notbind = true;
      }
    }
    if (error_multi_notbind) {
      this.common.showError('Mark only single input-box for fixed value option');
      return false;
    }
    if (temp.index != null) {
      let index = temp.index;
      this.finalArray[index].param = temp.param;
      this.finalArray[index].type = temp.type;
      this.finalArray[index].order = temp.order;
      this.finalArray[index].is_required = temp.is_required;
      this.finalArray[index]._param_info = (this.isFixedValue) ? this.fixValues : null;
      this.finalArray[index]._param_id = (temp._param_id) ? temp._param_id : null;
    } else {
      delete temp['index'];
      temp['_param_info'] = (this.isFixedValue) ? this.fixValues : null;
      this.finalArray.push(temp);
    }
    console.log("finalArray:", this.finalArray);
    this.resetData();
    this.getFieldName();

  }

  getFieldName() {
    this.finalArray.length ? this.setTable() : this.resetTable();
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
    for (var key in this.finalArray[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    headings['action'] = { title: 'action', placeholder: this.common.formatTitle('action') };
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.finalArray.map((doc, index) => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(doc, index)
          };
        } else {
          column[key] = { value: doc[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(row, index) {
    let icons = [];
    icons.push(
      { class: "fas fa-edit edit", title: "Edit Column", action: this.setData.bind(this, row, index) },
    )
    if (!row._used_in) {
      icons.push(
        { class: "fas fa-trash-alt", title: "Remove Column", action: this.deleteRow.bind(this, row, index) }
      )
    }
    return icons;
  }

  deleteRow(row, index) {
    this.finalArray.splice(index, 1);
    this.getFieldName();
  }

  addFixValue(fixvalue) {
    // if (fixvalue.length == 0) {
    // } else {
    //   this.fixValues.push({
    //     // option: ''
    //     option: '',
    //     isNonBind: false
    //   });
    // }
    if (this.fixValues[this.fixValues.length - 1].option) {
      this.fixValues.push({ option: '', isNonBind: false })
    } else {
      this.common.showError('Enter Value First')
    }
  }

  setData(data, index) {
    this.childArray = {
      index: index,
      param: data.param,
      _param_name: data._param_name,
      type: data.type,
      order: data.order,
      is_required: data.is_required,
      _param_info: (data._param_info && data._param_info.length) ? data._param_info : null,
      _param_id: (data._param_id) ? data._param_id : null,
      _used_in: (data._used_in) ? data._used_in : null
    }

    this.fixValues = data._param_info ? data._param_info : this.fixValues;
    this.isFixedValue = (data._param_info && data._param_info.length) ? true : false;
    this.btn1 = "Update";
    console.log("fixValues:", this.fixValues);
  }

  resetData() {
    this.isFixedValue = false;
    this.fixValues = [{
      // option: ''
      option: '',
      isNonBind: false
    }];
    this.btn1 = "Add";
    this.childArray = {
      index: null,
      param: '',
      _param_name: '',
      type: '',
      order: null,
      is_required: false,
      _param_info: null,
      _param_id: null,
      _used_in: null
    }
  }

}
