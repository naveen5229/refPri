import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { UserService } from '../../../Service/user/user.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssignFieldsComponent } from '../assign-fields/assign-fields.component';

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
  formType = null;
  order = null;
  types = [
    { id: 'text', name: 'Text' },
    { id: 'number', name: 'Number' },
    { id: 'date', name: 'Date' },
    { id: 'attachment', name: 'Attachment' }
  ];
  fixValues = [{
    option: ''
  }];
  isFixedValue = false;
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

  btn1 = "Add";
  btn2 = "Cancel";
  editable: true;
  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    this.refId = this.common.params.ref.id;
    this.refType = this.common.params.ref.type;
    // this.types = [
    //   { id: 'text', name: 'Text' },
    //   { id: 'number', name: 'Number' },
    //   { id: 'date', name: 'Date' }
    // ];

    if (!this.refType) {
      this.title = "Add State Form Field";
    } else if (this.refType == 1) {
      this.title = "Add Action Form Field";
    } else if (this.refType == 2) {
      this.title = "Add Transaction Form Field";
    } else if (this.refType == 3) {
      this.title = "Add Primary Info Form Field";
    }
    this.getFieldName();
    if (this.refType == 2) {
      this.getGlobalFormField();
    }
  }

  ngOnInit() {
  }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getGlobalFormField() {
    this.globalFiledList = [];
    let params = "?refId=" + this.refId + "&refType=" + this.refType;
    this.common.loading++;
    this.api.get('Processes/getGlobalFormField' + params).subscribe(res => {
      this.common.loading--;
      console.log("getGlobalFormField", res);
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
    let tmpJson = {
      param: this.name,
      type: this.typeId,
      drpOption: (this.isFixedValue) ? this.fixValues : null,
      is_required: this.isRequired,
      order: this.order

    }
    console.log("type:", this.typeId);
    let params = {
      refid: this.refId,
      refType: this.refType,
      type: this.formType,
      info: JSON.stringify(tmpJson),
      requestId: (this.fieldId > 0) ? this.fieldId : null
    }
    console.log("params", params);
    this.common.loading++;
    this.api.post('Processes/addProcessMatrix', params)
      .subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['data'][0].y_id > 0) {
          this.common.showToast("Successfully added");
          this.resetData();
          this.getFieldName();
        }
        else {
          this.common.showError(res['data'][0].y_msg);
        }

      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Err:', err);
      });
  }

  getFieldName() {
    this.common.loading++;
    let params = "refId=" + this.refId + "&refType=" + this.refType;

    this.api.get('Processes/getProcessMatrix?' + params)
      .subscribe(res => {
        this.common.loading--;
        this.data = [];
        this.resetTable();
        this.headings = [];
        this.valobj = {};

        if (!res['data']) return;
        this.data = res['data'];
        this.data.length ? this.setTable() : this.resetTable();
        // let first_rec = this.data[0];
        // for (var key in first_rec) {
        //   if (key.charAt(0) != "_") {
        //     this.headings.push(key);
        //     let headerObj = { title: this.formatTitle(key), placeholder: this.formatTitle(key) };
        //     this.table.data.headings[key] = headerObj;
        //   }
        // }
        // let action = { title: this.formatTitle('action'), placeholder: this.formatTitle('action'), hideHeader: true };
        // this.table.data.headings['action'] = action;
        // this.table.data.columns = this.getTableColumns();

      }, err => {
        this.common.loading--;
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
    // let action = { title: this.common.formatTitle('action'), placeholder: this.common.formatTitle('action'), hideHeader: true };
    // this.table.data.headings['action'] = action;
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
        } else {
          column[key] = { value: doc[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  // formatTitle(title) {
  //   return title.charAt(0).toUpperCase() + title.slice(1);
  // }

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
        id: row._matrixid,
      }
      this.common.params = {
        title: 'Delete  ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteProcessMatrix', params).subscribe(res => {
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
            console.log('Error: ', err);
          });
        }
      });
    } else {
      this.common.showError("Invalid Request");
    }
  }

  addFixValue() {
    this.fixValues.push({
      option: ''
    });
  }

  setData(data) {
    // this.typeId = data.col_type;
    // this.name = data.col_title;
    // this.fixValues = data.newvalues ? JSON.parse(data.newvalues) : this.fixValues;
    // this.isFixedValue = data.is_active;
    // this.isRequired = data.is_autocalculate;
    // this.btn1 = "Update";
    console.log("data edit:", data);
    this.typeId = data.param_type;
    this.name = data.param_name;
    this.fixValues = data._param_info ? data._param_info : this.fixValues;
    this.isFixedValue = (data._param_info && data._param_info.length) ? true : false;
    this.isRequired = data.is_required;
    this.fieldId = data._matrixid;
    this.btn1 = "Update";
    console.log("isFixedValue:", this.isFixedValue);
    console.log("fixValues:", this.fixValues);
  }

  resetData() {
    this.typeId = null;
    this.name = null;
    this.isFixedValue = false;
    this.isRequired = false
    this.fieldId = null;
    this.fixValues = [{
      option: ''
    }];
    this.btn1 = "Add";
  }

  openAssignForm() {
    let ref = {
      id: this.refId,
      type: this.refType
    }
    this.common.params = { ref: ref };
    const activeModal = this.modalService.open(AssignFieldsComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.response);
      }
    });
  }

  closeOptionModal() {
    document.getElementById("optionModal").style.display = "none";
  }

  openOptionModal(row) {
    document.getElementById("optionModal").style.display = "block";
  }

}

