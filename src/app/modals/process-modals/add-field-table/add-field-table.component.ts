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
  title = "Add Table Columns";
  types = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
    { id: 'checkbox', name: 'Checkbox' }
  ];
  childArray = {
    index: null,
    param: '',
    type: '',
    order: null,
    is_required: false,
    _param_info: null,
    _param_id: null,
    _used_in: null
  };
  finalArray = [];
  isFixedValue = false;
  fixValues = [{
    option: ''
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
    if (this.common.params && this.common.params.data) {
      this.finalArray = this.common.params.data;
      this.getFieldName();
    }
  }

  ngOnInit() {
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
    if (!this.childArray.param || !this.childArray.type) {
      this.common.showError('Field Name or Type is missing');
      return false;
    }
    let temp = JSON.parse(JSON.stringify(this.childArray));
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
    if (fixvalue.length == 0) {
    } else {
      this.fixValues.push({
        option: ''
      });
    }
  }

  setData(data, index) {
    this.childArray = {
      index: index,
      param: data.param,
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
      option: ''
    }];
    this.btn1 = "Add";
    this.childArray = {
      index: null,
      param: '',
      type: '',
      order: null,
      is_required: false,
      _param_info: null,
      _param_id: null,
      _used_in: null
    }
  }

}
