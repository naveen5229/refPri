import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})
export class ModulesComponent implements OnInit {
  modules = {
    projectId: null,
    name: null,
    projectName: ''
  }
  projectName = [];
  filteredItems = [];
  module_id = null
  modulesData1 = [];

  constructor(public api: ApiService,
    public common: CommonService,
    public modalService: NgbModal, ) {
    this.getModule();
    this.projectList();
    this.common.refresh = this.refresh.bind(this);


  }

  ngOnInit() {
  }

  refresh() {
    this.getModule();
    this.projectList();
  }

  projectList() {
    this.common.loading++;
    this.api.get('Suggestion/getProjectList')
      .subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        this.projectName = res['data'];
      }, err => {
        this.common.loading--;
        this.common.showError();
        console.log(err);
      });
  }

  changeRefernceType(type) {
    console.log("type", type)
    this.modules.projectId = type.id
    this.modules.projectName = type.name
    this.filterItem();
    return this.modules.name;
  }

  saveModule() {
    console.log(this.modules);
    if (this.modules.projectId == null) {
      return this.common.showError("Project name is missing")
    } else if (!this.modules.name) {
      return this.common.showError("Module name is missing")
    }
    else if (this.module_id) {
      this.updateModule()
    }
    else if (this.module_id == null) {
      const params = {
        project_id: this.modules.projectId,
        name: this.modules.name,
        module_id: null
      }
      this.common.loading++;
      this.api.post('Modules/addModules', params).subscribe(res => {
        this.common.loading--;
        if(res['code']===0) { this.common.showError(res['msg']); return false;};
        if (res['data'][0].z_id > 0) {
          this.common.showToast(res['data'][0].z_msg);
          this.getModule();
        }
        else {
          this.common.showToast(res['data'][0].z_msg);
          this.modules = {
            projectId: null,
            name: null,
            projectName: ''
          }
          this.module_id = null;
          this.getModule()
        }

      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }
  }

  updateModule() {
    const params = {
      project_id: this.modules.projectId,
      name: this.modules.name,
      module_id: this.module_id,
    }

    this.common.loading++;
    this.api.post('Modules/addModules', params).subscribe(res => {
      this.common.loading--;
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      if (res['data'][0].z_id > 0) {
        this.common.showToast(res['data'][0].z_msg);
        this.getModule();
      }
      else {
        this.common.showToast(res['data'][0].z_msg);
        this.modules = {
          projectId: null,
          name: null,
          projectName: ''
        }
        this.getModule()
      }
    },

      err => {
        this.common.loading--;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  getModule() {
    this.api.get("Modules/getAllModules").subscribe(res => {
      if(res['code']===0) { this.common.showError(res['msg']); return false;};
      this.modulesData1 = res['data'] || [];
      this.filterItem();
    },err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  editModule(modulesData) {
    console.log("modata", modulesData)
    this.modules.projectName = modulesData.project_name
    this.modules.projectId = modulesData.project_id
    this.modules.name = modulesData.name
    this.module_id = modulesData.id
  }

  deleteModule(userId, rowIndex) {
    this.common.params = {
      title: 'Delete Task',
      description: 'Are you sure you want to delete this module?',
      btn2: "No",
      btn1: 'Yes'
    };
    const activeModal = this.modalService.open(ConfirmComponent, { size: "sm", container: 'nb-layout', backdrop: 'static' });
    activeModal.result.then(data => {
      console.log('res', data);
      if (data.response) {
        let params = {
          module_id: userId
        }
        console.log("user", params)
        this.common.loading++;
        this.api.post('Modules/deleteModule', params)
          .subscribe(res => {
            this.common.loading--;
            if(res['code']===0) { this.common.showError(res['msg']); return false;};
            if (res['data'][0].z_id > 0) {
              this.common.showToast(res['data'][0].z_msg);
              this.getModule();
            }
            else {
              this.common.showError(res['data'][0].z_msg);
            }

          }, err => {
            this.common.loading--;
            console.log(err);
            this.common.showError();
          });

      }
    });
  }

  filterItem(search?) {
    console.log("module Id", this.modulesData1);
    if (!this.modules.name && !this.modules.projectName) {
      this.filteredItems = this.modulesData1;
      return;
    }
    let txt = search || this.modules.projectName;
    this.filteredItems = this.modulesData1.filter(item => {
      if (search)
        return item.name.toLowerCase().includes(txt.trim().toLowerCase())
      else
        return item.project_name.toLowerCase().includes(txt.toLowerCase())
    });
  }

  unselectProject() {
    console.log("module Id");
    if (this.modules.projectName) {
      document.getElementById('projectName')['value'] = '';
      this.modules.projectId = null;
      this.modules.projectName = null;
      this.filterItem();
    }
  }

}
