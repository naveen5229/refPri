import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../Service/common/common.service';
import { ApiService } from '../../../Service/Api/api.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../confirm/confirm.component';

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
    modes: []
  }
  modeList = [];
  actionList = [];
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
    this.title = this.common.params.title ? this.common.params.title : 'Add Target Campaign';
    this.button = this.common.params.button ? this.common.params.button : 'Add';
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
      this.modeList = res['data'];
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
        processId: this.actionForm.process.id,
        stateId: this.actionForm.state.id,
        name: this.actionForm.name,
        modes: JSON.stringify(this.actionForm.modes.map(mode => { return { id: mode._mode_id } })),
        requestId: this.actionForm.rowId
      };
      console.log("actionForm:", params);
      this.common.loading++;
      this.api.post("Processes/addProcessAction ", params).subscribe(res => {
        this.common.loading--;
        console.log(res);
        if (res['success'] == true) {
          this.common.showToast(res['msg']);
          this.getActionList();
          this.resetData();
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
      this.actionList = res['data'];
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
            // icons: this.actionIcons(campaign)
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
      { class: 'fas fa-trash-alt ml-2', action: this.deleteAction.bind(this, action) }
    ];
    return icons;
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
    this.actionForm.modes = [];[];
  }

}
