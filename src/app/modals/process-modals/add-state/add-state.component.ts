import { Component, OnInit } from '@angular/core';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { ApiService } from '../../../Service/Api/api.service';
import { CommonService } from '../../../Service/common/common.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddFieldComponent } from '../add-field/add-field.component';
import { AddActionComponent } from '../add-action/add-action.component';
import { AssignFieldsComponent } from '../assign-fields/assign-fields.component';

@Component({
  selector: 'ngx-add-state',
  templateUrl: './add-state.component.html',
  styleUrls: ['./add-state.component.scss']
})
export class AddStateComponent implements OnInit {
  states = [];
  nextStates = [];
  userTag = { id: null, name: null }
  // nextState = null;
  typeId = null;
  stateName = null;
  processId = null;
  processName = null;
  requestId = null;
  threshold = null;
  adminList = null;
  // isDefault = false;

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
  headings = [];
  valobj = {};

  btn1 = "Add";
  btn2 = "Cancel";
  editable: true;
  constructor(public api: ApiService,
    public common: CommonService,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal) {
    this.processId = this.common.params.process.id;
    this.processName = this.common.params.process.name;
    const adminList = [...this.common.params.adminList];
    this.adminList = adminList.map(admin => {
      return { id: admin.id, name: admin.name }
    })
    this.getStates();
  }

  ngOnInit() { }

  closeModal(res) {
    this.activeModal.close({ response: res });
  }

  Add() {
    console.log("type:", this.typeId);
    // let ns = [];
    let params = {
      processId: this.processId,
      name: this.stateName,
      type: this.typeId,
      nextStates: (this.nextStates && this.nextStates.length) ? JSON.stringify(this.nextStates) : null,
      requestId: this.requestId,
      threshold: this.threshold,
      stateOwnerId: this.userTag.id
      // isDefault: this.isDefault,
    }
    // console.log("params", params);
    // return
    this.common.loading++;
    this.api.post('Processes/addProcessState', params)
      .subscribe(res => {
        this.common.loading--;
        // console.log(res);
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            this.getStates();
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

  getStates() {
    this.common.loading++;
    let params = "processId=" + this.processId;
    this.api.get('Processes/getProcessState?' + params)
      .subscribe(res => {
        this.common.loading--;
        this.data = [];
        this.table = {
          data: {
            headings: {},
            columns: []
          },
          settings: {
            hideHeader: true
          }
        };
        this.headings = [];
        this.valobj = {};

        if (!res['data']) return;
        this.data = res['data'];
        this.states = (this.data && this.data.length) ? this.data.map(x => { return { id: x._state_id, name: x.name } }) : [];
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
      headings: [],
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
    this.data.map(cat => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(cat)
          };
        } else {
          column[key] = { value: cat[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  // getTableColumns() {
  //   let columns = [];
  //   this.data.map(doc => {
  //     this.valobj = {};
  //     for (let i = 0; i < this.headings.length; i++) {
  //       this.valobj[this.headings[i]] = { value: doc[this.headings[i]], class: 'black', action: '' };
  //     }
  //     this.valobj['action'] = { class: '', icons: this.Delete(doc) };
  //     columns.push(this.valobj);
  //   });
  //   return columns;
  // }

  // formatTitle(title) {
  //   return title.charAt(0).toUpperCase() + title.slice(1);
  // }

  actionIcons(row) {
    let icons = [];
    icons.push(
      { class: "fas fa-edit edit", title: "Edit State", action: this.setData.bind(this, row) },
      { class: "fas fa-trash-alt", title: "Delete State", action: this.deleteRow.bind(this, row) },
      { class: "fas fa-plus-square", title: "Add Form Field", action: this.openFieldModal.bind(this, row) },
      // { class: "fas fa-handshake", title: "Add Action", action: this.addProcessAction.bind(this, row) },
    )
    return icons;
  };

  deleteRow(row) {
    let params = {
      stateId: row._state_id,
    }
    if (row._state_id) {
      this.common.params = {
        title: 'Delete  ',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteProcessState', params)
            .subscribe(res => {
              this.common.loading--;
              console.log("Result:", res['data'][0].y_msg);
              if (res['data'][0].y_id > 0) {
                this.common.showToast("Delete SuccessFully");
                this.getStates();
              } else {
                this.common.showError(res['data'][0].y_msg);
              }

            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    }
  }

  setData(data) {
    this.typeId = data._type_id;
    this.stateName = data.name;
    this.nextStates = data._nextstate && (data._nextstate.length) ? data._nextstate.map(x => { return { id: x._state_id, name: x.name } }) : [];
    this.processId = this.processId;
    this.requestId = data._state_id;
    this.threshold = (data._threshold) ? data._threshold : null;
    this.userTag = { id: data._state_owner_id, name: data.state_owner }
    // this.isDefault = (data._is_default) ? true : false;
    this.btn1 = "Update";
    // this.nextStates = this.nextStates
  }

  resetData() {
    this.typeId = null;
    this.stateName = null;
    this.nextStates = null;
    // this.nextState = null;
    this.requestId = null;
    this.threshold = null;
    this.userTag = { id: null, name: null }
    // this.isDefault = false;
    this.btn1 = "Add";
  }

  addNextState(event) {
    if (event && event.length) {
      this.nextStates = event.map(ns => {
        console.log("---", ns);
        return { id: ns._state_id }
      });
    } else {
      this.nextStates = [];
    }
    console.log("nextStates", this.nextStates)
  }

  openFieldModal(data) {
    let refData = {
      id: data._state_id,
      type: 0
    }
    this.common.params = { ref: refData };
    const activeModal = this.modalService.open(AddFieldComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.response);
      }
    });

    // let ref = {
    //   id: data._state_id,
    //   type: 0
    // }
    // let title = "State Form Assignment";
    // this.common.params = { ref: ref, processId: this.processId, title: title };
    // const activeModal = this.modalService.open(AssignFieldsComponent, { size: 'xl', container: 'nb-layout', backdrop: 'static' });
  }

  addProcessAction(row) {
    if (row._state_id > 0) {
      let param = {
        process_id: this.processId,
        process_name: this.processName,
        state_id: row._state_id,
        state_name: row.name
      }
      this.common.params = { actionData: param };
      const activeModal = this.modalService.open(AddActionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
      activeModal.result.then(data => {
        if (data.response) {
          console.log("addProcessAction:", data.response);
        }
      });
    } else {
      this.common.showError("State is missing");
    }
  }

}