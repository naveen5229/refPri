import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProcessComponent } from '../../modals/process-modals/add-process/add-process.component';
import { DataMappingComponent } from '../../modals/campaign-modals/data-mapping/data-mapping.component';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { AddStateComponent } from '../../modals/process-modals/add-state/add-state.component';
import { AddActionComponent } from '../../modals/process-modals/add-action/add-action.component';
import { UserMappingComponent } from '../../modals/process-modals/user-mapping/user-mapping.component';
import { AddFieldComponent } from '../../modals/process-modals/add-field/add-field.component';
import { AddCategoryComponent } from '../../modals/process-modals/add-category/add-category.component';
import { AddDashboardFieldComponent } from '../../modals/process-modals/add-dashboard-field/add-dashboard-field.component';

@Component({
  selector: 'ngx-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss']
})
export class ProcessListComponent implements OnInit {
  processData = [];
  table = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

  // catFormTitle = "Add Primary Category";
  // catForm = {
  //   id: null,
  //   process_id: null,
  //   name: ""
  // };

  // catType = 1;
  // catList = [];
  // tableCatList = {
  //   data: {
  //     headings: {},
  //     columns: [],
  //   },
  //   settings: {
  //     hideHeader: true
  //   }
  // };

  adminList = [];

  constructor(public api: ApiService, public common: CommonService, public modalService: NgbModal) {
    this.getAllAdmin();
    this.getProcessList();
  }

  ngOnInit() { }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      console.log("data", res['data'])
      if (res['code'] > 0) {
        this.adminList = res['data'] || [];
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getProcessList() {
    this.common.loading++;
    this.api.get('Processes/getProcessList')
      .subscribe(res => {
        this.common.loading--;
        console.log("api data", res);
        if (!res['data']) return;
        this.processData = res['data'];
        this.processData.length ? this.setTable() : this.resetTable();

      }, err => {
        this.common.loading--;
        console.log(err);
      });
  }

  addProcess(processDate = null) {
    this.common.params = { title: "Add Process", button: "Next", editData: processDate, adminList: this.adminList };
    const activeModal = this.modalService.open(AddProcessComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        this.getProcessList();
      }
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
    for (var key in this.processData[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    let columns = [];
    this.processData.map(process => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIcons(process)
          };
        } else {
          column[key] = { value: process[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIcons(process) {
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.addProcess.bind(this, process) },
      { class: "fas fa-user", action: this.addProcessUsers.bind(this, process), title: "Add Users" },
      { class: "fas fa-grip-horizontal", action: this.addProcessState.bind(this, process), title: "Add State" },
      { class: "fas fa-list-alt pri_cat", action: this.openCatModal.bind(this, process, 1), title: "Primary Category Mapping" },
      { class: "fas fa-list-alt", action: this.openCatModal.bind(this, process, 2), title: "Secondary Category Mapping" },
      { class: "fas fa-list-alt process_type", action: this.openCatModal.bind(this, process, 3), title: "Type Mapping" },
      { class: "fas fa-handshake", action: this.addProcessAction.bind(this, process), title: "Add Action" },
      { class: "fas fa-plus-square", action: this.openFieldModal.bind(this, process, 2), title: "Add Transaction Form Field" },
      { class: "fas fa-plus-square text-primary", action: this.openFieldModal.bind(this, process, 3), title: "Add Primary Info Field" },
      { class: "fas fa-bars text-primary", action: this.openDashboardFieldModal.bind(this, process, 3), title: "Add Dashboard Field" }
    ];
    return icons;
  }

  openFieldModal(process, type) {
    let refData = {
      id: process._id,
      type: type
    }
    this.common.params = { ref: refData };
    const activeModal = this.modalService.open(AddFieldComponent, { size: (type == 2) ? 'xl' : 'lg', container: 'nb-layout', backdrop: 'static' });
  }

  addProcessUsers(process) {
    this.common.params = { process_id: process._id, adminList: this.adminList };
    const activeModal = this.modalService.open(UserMappingComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log("UserMappingComponent:", data.response);
      }
    });
  }

  addProcessState(process) {
    let param = {
      id: process._id,
      name: process.name
    }
    this.common.params = { process: param };
    const activeModal = this.modalService.open(AddStateComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log("AddStateComponent:", data.response);
      }
    });
  }

  addProcessAction(process) {
    let param = {
      process_id: process._id,
      process_name: process.name,
      state_id: null,
      state_name: null
    }
    this.common.params = { actionData: param };
    const activeModal = this.modalService.open(AddActionComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      if (data.response) {
        console.log("addProcessAction:", data.response);
      }
    });
  }

  openCatModal(process, type) {
    let actionData = {
      catType: type,
      process_id: process._id
    }
    this.common.params = { actionData };
    const activeModal = this.modalService.open(AddCategoryComponent, { size: 'md', container: 'nb-layout', backdrop: 'static' });
  }

  openDashboardFieldModal(process) {
    this.common.params = { processId: process._id, processName: process.name };
    const activeModal = this.modalService.open(AddDashboardFieldComponent, { size: 'lg', container: 'nb-layout', backdrop: 'static' });

  }

}
