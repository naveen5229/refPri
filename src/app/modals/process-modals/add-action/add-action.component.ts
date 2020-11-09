import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';
import { AddFieldComponent } from '../add-field/add-field.component';

@Component({
  selector: 'ngx-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss']
})
export class AddActionComponent implements OnInit {
  title = "Add Action";
  button = "Add";
  actionForm = {
    rowId: null,
    name: "",
    process: { id: null, name: "" },
    states: [],
    nextState: [],
    threshold: null,
    modes: [],
    nextAction: [],
    autoStateChange: null
    // isDefault: false,
    // defaultOwner: { id: null, name: null }
  }
  modeList = [];
  actionList = [];
  nextActionList = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };
  adminList = [];
  states = [];
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = this.common.params.title ? this.common.params.title : this.title;
    this.button = this.common.params.button ? this.common.params.button : this.button;
    console.log("action common:", this.common.params);
    this.adminList = this.common.params.adminList;
    if (this.common.params && this.common.params.actionData) {
      this.actionForm.rowId = this.common.params.actionData.rowId ? this.common.params.actionData.rowId : null;
      this.actionForm.process.id = this.common.params.actionData.process_id;
      this.actionForm.process.name = this.common.params.actionData.process_name;
      // this.actionForm.state.id = this.common.params.actionData.state_id;
      // this.actionForm.state.name = this.common.params.actionData.state_name;
      // this.actionForm.name = this.common.params.targetActionData.name;
      // this.actionForm.modes = [];
    };
    this.getModeList();
    this.getActionList();
    this.getStates();
  }

  getStates() {
    this.common.loading++;
    let params = "processId=" + this.actionForm.process.id;
    this.api.get('Processes/getProcessState?' + params)
      .subscribe(res => {
        this.common.loading--;
        if (!res['data']) return;
        let data = res['data'] || [];
        this.states = data.map(x => { return { id: x._state_id, name: x.name } });
      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  closeModal(res) {
    this.activeModal.close({ response: false });
  }

  switchButton() {
    if (this.button === 'Add') {
      this.closeModal(false);
    } else if (this.button === 'Update') {
      this.resetData();
      this.button = 'Add';
    }
  }

  ngOnInit() { }

  getModeList() {
    this.common.loading++;
    this.api.get("CampaignModules/getModes").subscribe(res => {
      this.common.loading--;
      let modeList = res['data'];
      this.modeList = (modeList && modeList.length) ? modeList.map(x => { return { id: x._mode_id, name: x.name } }) : [];
    }, err => {
      this.common.loading--;
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  saveProcessAction() {
    let autoStateChange = (this.actionForm.nextState.length == 1) ? this.actionForm.autoStateChange : null;
    if (this.actionForm.name == null || this.actionForm.process.id == null) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      const params = {
        requestId: this.actionForm.rowId,
        processId: this.actionForm.process.id,
        stateId: (this.actionForm.states && this.actionForm.states.length) ? JSON.stringify(this.actionForm.states) : null,
        name: this.actionForm.name,
        modes: (this.actionForm.modes && this.actionForm.modes.length) ? JSON.stringify(this.actionForm.modes) : null,
        threshold: this.actionForm.threshold,
        nextAction: (this.actionForm.nextAction && this.actionForm.nextAction.length) ? JSON.stringify(this.actionForm.nextAction) : null,
        nextState: (this.actionForm.nextState && this.actionForm.nextState.length) ? JSON.stringify(this.actionForm.nextState) : null,
        autoStateChange: autoStateChange,
        // isDefault: this.actionForm.isDefault,
        // defaultOwner: (this.actionForm.isDefault && this.actionForm.defaultOwner.id) ? this.actionForm.defaultOwner.id : null
      };
      console.log("actionForm:", params);
      this.common.loading++;
      this.api.post("Processes/addProcessAction ", params).subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['data'][0].y_msg);
            this.resetData();
            this.getActionList();
          } else {
            this.common.showError(res['data'][0].y_msg);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log(err);
      });
    }
  }

  getActionList() {
    this.common.loading++;
    this.api.get("Processes/getProcessAction?processId=" + this.actionForm.process.id).subscribe(res => {
      this.common.loading--;
      this.actionList = res['data'] || [];
      this.nextActionList = this.actionList.map(x => { return { id: x._action_id, name: x.name } });
      this.actionList.length ? this.setTable() : this.resetTable();
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
    for (var key in this.actionList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.actionList.map(campaign => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(campaign)
          };
        } else {
          column[key] = { value: campaign[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(action) {
    let icons = [
      { class: 'fas fa-trash-alt', title: "Delete Action", action: this.deleteAction.bind(this, action) },
      { class: "fas fa-edit", title: "Edit Action", action: this.editAction.bind(this, action) },
      { class: "fas fa-plus-square", title: "Add Action Form Field", action: this.openFieldModal.bind(this, action) },
    ];
    return icons;
  }

  openFieldModal(action) {
    let refData = {
      id: action._action_id,
      type: 1
    }
    this.common.params = { ref: refData };
    const activeModal = this.modalService.open(AddFieldComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log(data.response);
      }
    });
  }

  editAction(action) {
    this.actionForm.rowId = action._action_id;
    this.actionForm.name = action.name;
    this.actionForm.threshold = (action.threshold) ? action.threshold : null;
    this.actionForm.modes = (action._modeid && action._modeid.length) ? action._modeid.map(x => { return { id: x._modeid, name: x.name } }) : [];
    this.actionForm.nextAction = (action._next_action && action._next_action.length) ? action._next_action.map(x => { return { id: x._id, name: x.name } }) : [];
    this.actionForm.states = (action._state && action._state.length) ? action._state.map(x => { return { id: x._id, name: x.name } }) : [];
    this.actionForm.nextState = (action._next_state && action._next_state.length) ? action._next_state.map(x => { return { id: x._id, name: x.name } }) : [];
    this.actionForm.autoStateChange = action.auto_state_change;

    this.button = 'Update';
    // this.actionForm.isDefault = (action._is_default) ? true : false;
    // if (action._default_owner_id > 0) {
    //   let selectedUser = this.adminList.find(x => (x.id == action._default_owner_id));
    // this.actionForm.defaultOwner.id = action._default_owner_id;
    // this.actionForm.defaultOwner.name = (selectedUser) ? selectedUser.name : 'Inactive User';
    // }
  }

  deleteAction(row) {
    let params = {
      processId: this.actionForm.process.id,
      requestId: row._action_id,
    }
    if (row._action_id) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteProcessAction', params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['data'][0].y_msg);
                this.getActionList();
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
    }
  }

  resetData() {
    this.actionForm.rowId = null;
    this.actionForm.name = "";
    this.actionForm.modes = [];
    this.actionForm.nextAction = [];
    this.actionForm.threshold = null;
    this.actionForm.states = [];
    this.actionForm.nextState = [];
    this.actionForm.autoStateChange = null;
    // this.actionForm.isDefault = null;
    // this.actionForm.defaultOwner = { id: null, name: null };
  }

}
