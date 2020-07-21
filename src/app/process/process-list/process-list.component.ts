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

  catFormTitle = "Add Primary Category";
  catForm = {
    id: null,
    process_id: null,
    name: ""
  };

  catType = 1;
  catList = [];
  tableCatList = {
    data: {
      headings: {},
      columns: [],
    },
    settings: {
      hideHeader: true
    }
  };

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
    this.common.params = { title: "Add Process", button: "Next", editData: processDate };
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
      { class: "fas fa-user ml-2", action: this.addProcessUsers.bind(this, process), title: "Add Users" },
      { class: "fas fa-grip-horizontal ml-2", action: this.addProcessState.bind(this, process), title: "Add State" },
      { class: "fas fa-list-alt pri_cat ml-2", action: this.openCatModal.bind(this, process, 1), title: "Primary Category Mapping" },
      { class: "fas fa-list-alt ml-2", action: this.openCatModal.bind(this, process, 2), title: "Secondary Category Mapping" },
      { class: "fas fa-handshake ml-2", action: this.addProcessAction.bind(this, process), title: "Add Action" },
    ];
    return icons;
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
      id: process._id
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

  closeCatModal() {
    this.resetCatForm();
    document.getElementById("catModal").style.display = "none";
  }

  resetCatForm() {
    this.catForm.id = null;
    this.catForm.name = "";
  }

  openCatModal(process, type) {
    this.catType = type;
    this.catForm.process_id = process._id;
    this.getProcessCat();
    document.getElementById("catModal").style.display = "block";
  }

  getProcessCat() {
    this.resetTableCatList();
    let apiName = "Processes/getProcessPriCat?processId=" + this.catForm.process_id;
    if (this.catType == 1) {
      this.catFormTitle = "Add Primary Category";
      apiName = "Processes/getProcessPriCat?processId=" + this.catForm.process_id;
    } else {
      this.catFormTitle = "Add Secondary Category";
      apiName = "Processes/getProcessSecCat?processId=" + this.catForm.process_id;
    }
    this.common.loading++;
    this.api.get(apiName).subscribe(res => {
      this.common.loading--;
      console.log("api data", res);
      if (!res['data']) return;
      this.catList = res['data'];
      console.log("catList:", this.catList);
      this.catList.length ? this.setTableCatList() : this.resetTableCatList();

    }, err => {
      this.common.loading--;
      console.log(err);
    });
    document.getElementById("catModal").style.display = "block";
  }

  resetTableCatList() {
    this.tableCatList.data = {
      headings: [],
      columns: []
    };
  }

  setTableCatList() {
    this.tableCatList.data = {
      headings: this.generateHeadingsCatList(),
      columns: this.getTableColumnsCatList()
    };
    return true;
  }

  generateHeadingsCatList() {
    let headings = {};
    for (var key in this.catList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumnsCatList() {
    let columns = [];
    this.catList.map(cat => {
      let column = {};
      for (let key in this.generateHeadingsCatList()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: false,
            action: null,
            icons: this.actionIconsCatList(cat)
          };
        } else {
          column[key] = { value: cat[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    })

    return columns;
  }

  actionIconsCatList(cat) {
    let icons = [
      { class: "far fa-edit", title: "Edit", action: this.editProcessCat.bind(this, cat) },
      { class: "far fa-trash-alt", title: "Delete", action: this.deleteProcessCat.bind(this, cat) }
    ];
    return icons;
  }

  editProcessCat(cat) {
    this.catForm.id = cat._id;
    this.catForm.name = cat.name;
  }

  addProcessCat() {
    let apiName = "Processes/addProcessPriCat";
    if (this.catType == 1) {
      this.catFormTitle = "Add Primary Category";
      apiName = "Processes/addProcessPriCat";
    } else {
      this.catFormTitle = "Add Secondary Category";
      apiName = "Processes/addProcessSecCat";
    }
    let params = {
      processId: this.catForm.process_id,
      name: this.catForm.name,
      requestId: this.catForm.id
    }
    this.common.loading++;
    this.api.post(apiName, params).subscribe(res => {
      this.common.loading--;
      console.log("api data", res);
      if (res['code'] == 1) {
        if (res['data'][0]['y_id'] > 0) {
          this.resetCatForm();
          this.common.showToast(res['msg']);
          this.getProcessCat();
        } else {
          this.common.showError(res['msg']);
        }
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.loading--;
      console.log(err);
    });
  }

  deleteProcessCat(cat) {
    this.common.params = {
      title: 'Delete Category',
      description: 'Are you sure you want to delete this Category?'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {
        let apiName = "Processes/deleteProcessPriCat";
        if (this.catType == 1) {
          apiName = "Processes/deleteProcessPriCat";
        } else {
          apiName = "Processes/deleteProcessSecCat";
        }
        let params = {
          id: cat._id
        };
        this.common.loading++;
        this.api.post(apiName, params).subscribe(res => {
          this.common.loading--;
          console.log("api data", res);
          if (res['code'] == 1) {
            if (res['data'][0]['y_id'] > 0) {
              this.common.showToast(res['msg']);
              this.getProcessCat();
            } else {
              this.common.showError(res['msg']);
            }
          } else {
            this.common.showError(res['msg']);
          }
        }, err => {
          this.common.loading--;
          console.log(err);
        });
      }
    });
  }

}
