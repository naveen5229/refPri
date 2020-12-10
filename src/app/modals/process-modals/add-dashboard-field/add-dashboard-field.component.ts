import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngx-add-dashboard-field',
  templateUrl: './add-dashboard-field.component.html',
  styleUrls: ['./add-dashboard-field.component.scss']
})
export class AddDashboardFieldComponent implements OnInit {
  btn1 = "Add";
  btn2 = "Reset";
  form = {
    requestId: null,
    process: { id: null, name: null },
    type: null,
    refId: null,
    refType: null,
    infoId: null,
    info: null,
    order: null
  }
  stateOrActionList = [];
  fieldDataList = [];
  dynFieldList = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  typeList=[
    {id:1,name:"State"},
    {id:2,name:"Action"},
    {id:3,name:"Transaction Form"},
    {id:4,name:"Primary Info Form"}
  ];
  fromPage=null; //null=process,1=ticket

  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
      // console.log("params:",this.common.params);
      this.fromPage = (this.common.params.fromPage) ? this.common.params.fromPage : null;
    if (this.common.params && this.common.params.processId) {
      this.form.process.id = (this.common.params.processId) ? this.common.params.processId : null;
      this.form.process.name = (this.common.params.processId) ? this.common.params.processName : null;
      this.getDynFieldList();
    }
    if(this.fromPage==1){
      this.typeList=[
        {id:-1,name:"All"},
        {id:1,name:"Ticket"},
        {id:2,name:"Closing Form"},
        {id:3,name:"Primary Info Form"}
      ];
    }
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  getDynFieldList() {
    let apiName = "Processes/getProcessDynamicFieldList?processId=" + this.form.process.id;
    if(this.fromPage==1){
      apiName = "Ticket/getSavedDynamicDashboardFieldList?tpId=" + this.form.process.id;
    }
    // console.log("apiName:",apiName);
    // return false;
    this.common.loading++;
    this.api.get(apiName).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        this.dynFieldList = res['data'] || [];
        this.dynFieldList.length ? this.setTable() : this.resetTable();
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
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
    for (var key in this.dynFieldList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.dynFieldList.map(row => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(row)
          };
        } else {
          column[key] = { value: row[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(row) {
    let icons = [
      { class: 'fas fa-trash-alt', title: "Delete Action", action: this.deleteField.bind(this, row) }
    ];
    return icons;
  }

  deleteField(row) {
    let params = {
      requestId: row._id,
      processId: row._process_id,
      refId: row._refid,
      refType: row._reftype,
      info: JSON.stringify({ param_type: row._param_type }),
      tpId:null
    }

    if (row._id) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          let apiName = "Processes/saveDashboardReportField";
          if(this.fromPage==1){
            params.tpId = row._tp_id;
            apiName = "Ticket/saveDynamicDashboardField";
          }
          // console.log("apiName:",apiName);
          // return false;
          this.common.loading++;
          this.api.post(apiName, params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['data'][0].y_msg);
                this.getDynFieldList();
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

  getStateList() {
    this.common.loading++;
    this.api.get("Processes/getProcessState?processId=" + this.form.process.id).subscribe(res => {
      this.common.loading--;
      let stateDataList = res['data'];
      this.stateOrActionList = stateDataList.map(x => { return { id: x._state_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getActionList() {
    this.common.loading++;
    this.api.get("Processes/getProcessAction?processId=" + this.form.process.id).subscribe(res => {
      this.common.loading--;
      let actionDataList = res['data'] || [];
      this.stateOrActionList = actionDataList.map(x => { return { id: x._action_id, name: x.name } });
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getFieldList() {
    let params = "?refId=" + this.form.refId + "&refType=" + this.form.refType;
    let apiName = "Processes/getProcessFormField";
    if(this.fromPage==1){
      params = "?refId=" + this.form.refId + "&refType=" + this.form.refType + "&tpId=" + this.form.process.id;
      apiName = "Ticket/getTicketProcessDynamicFieldList";
    }
    // console.log("apiName:",apiName);
    // return false;
    this.common.loading++;
    this.api.get(apiName + params).subscribe(res => {
      this.common.loading--;
      let fieldData = res['data'] || [];
      this.fieldDataList = fieldData.map(x => { return { id: x.r_colid, name: x.r_coltitle, r_colid: x.r_colid, r_isdynamic: x.r_isdynamic, r_selected: x.r_selected } });
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  resetData() {
    this.form.requestId = null;
    this.form.type = null;
    this.form.refId = null;
    this.form.refType = null;
    this.form.infoId = null;
    this.form.info = null;
    this.form.order = null;
    this.stateOrActionList = [];
    this.fieldDataList = [];
  }

  onSelectType() {
    this.form.refId = null;
    this.form.refType = null;
    this.stateOrActionList = [];
    this.fieldDataList = [];
    if (this.form.type == -1) {
      this.form.refType = -1;
      this.form.refId = this.form.process.id;
      this.getFieldList();
    } else if (this.form.type == 1) {
      this.form.refType = 0;
      if(this.fromPage==1){
        this.form.refId = this.form.process.id;
        this.getFieldList();
      }else{
        this.getStateList();
      }
    } else if (this.form.type == 2) {
      this.form.refType = 1;
      if(this.fromPage==1){
        this.form.refId = this.form.process.id;
        this.getFieldList();
      }else{
        this.getActionList();
      }
    } else if (this.form.type == 3) {
      this.form.refType = 2;
      this.form.refId = this.form.process.id;
      this.getFieldList();
    } else if (this.form.type == 4) {
      this.form.refType = 3;
      this.form.refId = this.form.process.id;
      this.getFieldList();
    }
  }

  onSelectRefId() {
    this.fieldDataList = [];
    this.getFieldList();
  }

  onSelectField() {
    if (this.form.infoId) {
      let selected = this.fieldDataList.find(x => { return x.id == this.form.infoId });
      if (selected) {
        this.form.info = { r_colid: selected.r_colid, r_isdynamic: selected.r_isdynamic, r_selected: selected.r_selected, r_colorder: (this.form.order) ? this.form.order : null };
      } else {
        this.form.info = null;
      }
    }
  }

  AddField() {
    let params = {
      requestId: this.form.requestId,
      processId: this.form.process.id,
      refId: this.form.refId,
      refType: this.form.refType,
      info: (this.form.info) ? JSON.stringify(this.form.info) : null,
      tpId: null
    }
    let apiName = "Processes/saveDashboardReportField";
    if(this.fromPage==1){
      params.tpId = this.form.process.id;
      apiName = "Ticket/saveDynamicDashboardField";
    }
    // console.log("params:", params);
    // console.log("apiName:",apiName);
    // return false;
    this.common.loading++;
    this.api.post(apiName, params).subscribe(res => {
      this.common.loading--;
      if (res['code'] == 1) {
        if (res['data'][0].y_id > 0) {
          this.common.showToast(res['data'][0].y_msg);
          this.resetData();
          this.getDynFieldList();
        } else {
          this.common.showError(res['data'][0].y_msg);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Err:', err);
    });
  }

}
