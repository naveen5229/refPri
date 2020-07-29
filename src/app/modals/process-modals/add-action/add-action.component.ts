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
    state: { id: null, name: "" },
    threshold: null,
    modes: [],
    nextAction: []
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
  constructor(public common: CommonService,
    public api: ApiService,
    public activeModal: NgbActiveModal,
    public modalService: NgbModal) {
    this.title = this.common.params.title ? this.common.params.title : this.title;
    this.button = this.common.params.button ? this.common.params.button : this.button;
    console.log("action common:", this.common.params);
    if (this.common.params && this.common.params.actionData) {
      this.actionForm.rowId = this.common.params.actionData.rowId ? this.common.params.actionData.rowId : null;
      this.actionForm.process.id = this.common.params.actionData.process_id;
      this.actionForm.process.name = this.common.params.actionData.process_name;
      this.actionForm.state.id = this.common.params.actionData.state_id;
      this.actionForm.state.name = this.common.params.actionData.state_name;
      // this.actionForm.name = this.common.params.targetActionData.name;
      // this.actionForm.modes = [];
    };
    this.getModeList();
    this.getActionList();
  }

  closeModal(res) {
    this.activeModal.close({ response: false });
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
    if (this.actionForm.name == null || this.actionForm.process.id == null) {
      this.common.showError('Please Fill All Mandatory Field');
    }
    else {
      const params = {
        requestId: this.actionForm.rowId,
        processId: this.actionForm.process.id,
        stateId: this.actionForm.state.id,
        name: this.actionForm.name,
        modes: (this.actionForm.modes && this.actionForm.modes.length) ? JSON.stringify(this.actionForm.modes) : null,
        threshold: this.actionForm.threshold,
        nextAction: (this.actionForm.nextAction && this.actionForm.nextAction.length) ? JSON.stringify(this.actionForm.nextAction) : null,
      };
      console.log("actionForm:", params);
      this.common.loading++;
      this.api.post("Processes/addProcessAction ", params).subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['code'] == 1) {
          this.common.showToast(res['msg']);
          this.resetData();
          this.getActionList();
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
      // { class: 'fas fa-trash-alt', title: "Delete Action", action: this.deleteAction.bind(this, action) },
      { class: "fas fa-edit", title: "Edit Action", action: this.editAction.bind(this, action) },
      { class: "fas fa-plus-square", title: "Add Form Field", action: this.openFieldModal.bind(this, action) },
    ];
    return icons;
  }

  openFieldModal(action) {
    let refData = {
      id: action._action_id,
      type: 0
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
  }

  deleteAction(row) {
    let params = {
      campTarActId: row._camptaractid,
    }
    if (row._camptaractid) {
      this.common.params = {
        title: 'Delete Record',
        description: `<b>&nbsp;` + 'Are Sure To Delete This Record' + `<b>`,
      }
      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('Processes/deleteAction', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getActionList();
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
  }

}
