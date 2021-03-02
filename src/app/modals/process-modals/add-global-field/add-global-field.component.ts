import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { AddFieldTableComponent } from '../add-field-table/add-field-table.component';

@Component({
  selector: 'ngx-add-global-field',
  templateUrl: './add-global-field.component.html',
  styleUrls: ['./add-global-field.component.scss']
})
export class AddGlobalFieldComponent implements OnInit {
  title = "Add Field";
  addBtn = "Add";
  cancelBtn = "Cancel";
  types = [
    { id: 'text', name: 'Text', title:'Add any text type field', icon:'fas fa-text' },
    { id: 'number', name: 'Number', title:'Add any number type field', icon:'fas fa-hashtag' },
    { id: 'date', name: 'Date', title:'Add any date type field', icon:'fas fa-calendar-week' },
    { id: 'attachment', name: 'Attachment', title:'Add any attachment type field', icon:'fas fa-paperclip' },
    { id: 'table', name: 'Table', title:'Add any table type field', icon:'fas fa-table' },
    { id: 'checkbox', name: 'Checkbox', title:'Add any checkbox type field', icon:'fas fa-check-square' },
    { id: 'pdf-versioning', name: 'PDF', title:'Add any PDF type field', icon:'fas fa-file-pdf' }
  ];

  restrictionForm = {
    matrixId : null,
    info: [
      {id:1, refType:2, name: "Transaction Form", isShow: false},
      {id:2, refType:3, name: "Primary Info Form", isShow: false},
      {id:3, refType:0, name: "State Form", isShow: false},
      {id:4, refType:1, name: "Action Form", isShow: false}
    ]
  };

  form = {
    processId:null,
    requestId:null,
    typeId: null,
    name: null,
    order:null,
    isFixedValue:false,
    fixValues: [{option: ''}],
    childArray: []
  };

  fixValuesTemp = [{option: ''}];

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };
  globalFieldList = [];
  isShowField = false;
  masterFiledList = [];
  fromPage = null; //null=process,1=ticket,3=entity

  constructor(public api: ApiService,public common: CommonService,public activeModal: NgbActiveModal,private modalService: NgbModal) {
    if(this.common.params){
      this.form.processId = (this.common.params.process.id) ? this.common.params.process.id : null;
      this.fromPage = (this.common.params.fromPage) ? this.common.params.fromPage : null;
      this.getProcessGlobalField();
      if(!this.fromPage){
        this.types.push({ id: 'entity', name: 'Entity', title:'Add any entity type field', icon:'fas fa-text' });
        this.getGlobalFormField();
      }
    }
   }

  ngOnInit() {}

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getGlobalFormField() {
    this.masterFiledList = [];
    let apiName = "Processes/getGlobalFormField";
    let params = "?refId=" + this.form.processId + "&refType=2";
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.masterFiledList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Err:', err);
    });
  }

  closeAddGlobalFieldModal(res){
    this.resetData();
    this.isShowField = false;
    this.title = "Add Field";
    // if(res){
    //   this.closeModal(true);
    // }
  }

  openAddFieldModal(type){
    if(type && type.id){
      this.form.typeId = type.id;
      this.isShowField = true;
      this.getEntityType();
    }else{
      this.common.showError();
    }
  };
  
  entityTypeList = [];
  getEntityType() {
    this.common.loading++;
    this.api.get('Entities/getEntityTypes')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (!res['data']) return;
        this.entityTypeList = res['data'] || [];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  openFieldInfoModal(row){
    if(row._matrixid){
      this.restrictionForm.matrixId = row._matrixid;
      if(row._col_visibility && row._col_visibility.length){
        row._col_visibility.forEach(element => {
          let selected = this.restrictionForm.info.find(x=>x.refType==element.form);
          console.log("selected:",selected);
          selected.isShow = (selected) ? true : false;
        });
      }
      document.getElementById("fieldInfoModal").style.display = "block";
    }
  };

  closeFieldInfoModal(res){
    this.restrictionForm.matrixId = null;
    this.restrictionForm.info.forEach(element => {
      element.isShow = false;
    });
    document.getElementById("fieldInfoModal").style.display = "none";
  }

  resetData() {
    this.form.requestId = null;
    this.form.typeId = null;
    this.form.name = null;
    this.form.order = null;
    this.form.isFixedValue = false;
    this.form.fixValues = [{option: ''}];
    this.form.childArray = [];
    this.addBtn = "Add";
  }

  
  addFieldConfirm() {
    if (((this.form.name.toLowerCase()).includes('mobile') || (this.form.name.toLowerCase()).includes('contact')) && this.form.typeId.includes('number')) {
      this.common.showError('Please use Global Fields to add contact name or contact number.');
      return false;
    }
    if (this.form.typeId=='pdf-versioning') {
      this.common.params = {
        title: 'Confirmation  ',
        description: `<b>&nbsp;` + 'This Field Showing On Transaction And Allow PDF File Only' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "pdfVersioningModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.AddField();
        }
      });
    } else {
      this.AddField();
    }
  }
  
  AddField() {
    
    let childArray = (this.form.childArray && this.form.childArray.length > 0) ? this.form.childArray.map(x => { return { param: x.param, type: x.type, order: x.order, is_required: x.is_required, drpOption: x._param_info, param_id: x._param_id } }) : null;
    let tmpJson = {
      param: this.form.name,
      type: this.form.typeId,
      drpOption: (this.form.isFixedValue) ? this.form.fixValues : null,
      is_required: false,
      order: this.form.order,
      param_child: childArray
    }
    let params = {
      refId: this.form.processId,
      info: JSON.stringify(tmpJson),
      requestId: (this.form.requestId > 0) ? this.form.requestId : null,
      isDelete: 0
    }

    let error_count = false;
    if (tmpJson.type === 'table') {
      if(tmpJson.param_child){
        tmpJson.param_child.forEach(ele => {
          if (ele.param.length == 0 || !ele.type.length) {
            error_count = true;
          }
        });
      }else{
        error_count = true;
      }
    }

    if (!this.form.name || !this.form.typeId) {
      this.common.showError('Field Name or Type is missing');
      return false;
    }
    if (error_count) {
      if(tmpJson.param_child){
        this.common.showError('Table Field Name or Type is missing');
      }else{
        this.common.showError('Table Field is missing');
      }
      return false;
    }
    let apiName = 'Processes/addProcessGlobalField';
    if(this.fromPage==3){
      apiName = "Entities/addEntityGlobalField";
    }
    // console.log("apiName:", apiName,params); return false;
    this.common.loading++;
    this.api.post(apiName, params).subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (res['data'][0].y_id > 0) {
          this.common.showToast("Successfully added");
          this.getProcessGlobalField();
          this.closeAddGlobalFieldModal(false);
        }else {
          this.common.showError(res['data'][0].y_msg);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Err:', err);
      });
  }

  getProcessGlobalField() {
    let params = "?processId=" + this.form.processId;
    let apiName = 'Processes/getProcessGlobalField';
    if(this.fromPage==3){
      apiName = "Entities/getEntityGlobalField";
    }
    // console.log("apiName:", apiName); return false;
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.globalFieldList =  res['data'] || [];
        (this.globalFieldList && this.globalFieldList.length) ? this.setTable() : this.resetTable();
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
    for (var key in this.globalFieldList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
      if (key === "addtime") {
        headings[key]["type"] = "date";
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.globalFieldList.map(doc => {
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
    if(!this.fromPage){
      icons.push(
        { class: "fas fa-info-circle", action: this.openFieldInfoModal.bind(this, row) },
      );
    }
    if(!row._used_in){
      icons.push(
        { class: "fas fa-trash-alt", action: this.deleteRow.bind(this, row) },
        { class: "fas fa-edit edit", action: this.setData.bind(this, row) },
      );
    }
    return icons;
  }

  deleteRow(row) {
    if (row._matrixid) {
      let params = {
        refId: this.form.processId,
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
          let apiName = 'Processes/addProcessGlobalField';
          if(this.fromPage==3){
            apiName = "Entities/addEntityGlobalField";
          }
          // console.log("apiName:", apiName,params); return false;
          this.common.loading++;
          this.api.post(apiName, params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['data'][0].y_msg);
                this.getProcessGlobalField();
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
    if (this.form.fixValues[this.form.fixValues.length - 1].option) {
      this.form.fixValues.push({ option: '' })
    } else {
      this.common.showError('Enter Value First')
    }
  }

  setData(data) {
    console.log("data edit:", data);
    this.form.typeId = data.param_type;
    this.form.name = data._param_name;
    this.form.order = (data.param_order) ? data.param_order : null;
    if (data._param_child && data._param_child.length > 0) {
      data._param_child.map((ele, index) => {
        this.form.childArray.push({ param: '', type: '', order: null, is_required: false, _param_info: null, _param_id: null, _used_in: null });
        this.form.childArray[index]['param'] = ele.param_name;
        this.form.childArray[index]['type'] = ele.param_type;
        this.form.childArray[index]['order'] = ele.param_order;
        this.form.childArray[index]['is_required'] = ele.is_required;
        this.form.childArray[index]['_param_info'] = ele._param_info ? ele._param_info : null;
        this.form.childArray[index]['_param_id'] = ele.param_id ? ele.param_id : null;
        this.form.childArray[index]['_used_in'] = ele._used_in ? ele._used_in : null;
      });
    }
    this.form.fixValues = data._param_info ? data._param_info : this.form.fixValues;
    this.form.isFixedValue = (data._param_info && data._param_info.length) ? true : false;
    this.form.requestId = data._matrixid;
    this.addBtn = "Update";
    console.log("form:", this.form);
    this.openAddFieldModal({id:this.form.typeId});
  }

  openAddFieldTable() {
    this.common.params = { data: (this.form.childArray && this.form.childArray.length > 0) ? this.form.childArray : null };
    const activeModal = this.modalService.open(AddFieldTableComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.form.childArray = (data.data && data.data.length > 0) ? data.data : [];
        console.log("AddFieldTableComponent:", data);
      }
    });
  };

  saveFieldRestriction(){
    console.log("saveFieldRestriction:",this.restrictionForm);
    if (this.restrictionForm.matrixId) {
      // let atleastOne = this.restrictionForm.info.find(x=>x.isShow);
      // console.log("atleastOne:",atleastOne);
      // if(!atleastOne){
      //   this.common.showError("Select atlease one form");
      // }
      let selected = this.restrictionForm.info.filter(x=>x.isShow==true);
      let info = (selected && selected.length) ? selected.map(y=>{return {form:y.refType} }) : null;
      let params = {
        processId: this.form.processId,
        matrixId: this.restrictionForm.matrixId,
        info: JSON.stringify(info)
      }
      let apiName = 'Processes/addProcessGlobalFieldRestriction';
      console.log("saveFieldRestriction:",params,apiName);
      // return false;
      this.common.loading++;
      this.api.post(apiName, params).subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            this.getProcessGlobalField();
            this.closeFieldInfoModal(true);
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
    } else {
      this.common.showError("Invalid Request");
    }
  }

}
