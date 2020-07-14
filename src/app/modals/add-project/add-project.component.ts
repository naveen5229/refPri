import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';

@Component({
  selector: 'ngx-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss']
})
export class AddProjectComponent implements OnInit {
  project = {
    projectId: 0,
    projectDesc: "",
    owner: {
      id: '',
      name: ''
    },
    users: []
  };
  btn = 'Save';
  userList = [];
  showLoading = true;

  projectList = [];
  tableProjectList = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public activeModal: NgbActiveModal,
    public api: ApiService,
    public common: CommonService, public modalService: NgbModal) {
    console.log("task list", this.common.params);
    if (this.common.params != null) {
      this.userList = this.common.params.userList;
    }
    this.getAllProjectList();
  }

  ngOnInit() {

  }

  closeModal(response) {
    this.activeModal.close({ response: response });
  }

  saveProject() {
    if (this.project.projectDesc == '') {
      return this.common.showError("Description is missing")
    }
    else if (this.project.owner.id == '') {
      return this.common.showError("Owner is missing")
    }
    else if (this.project.users.length == 0) {
      return this.common.showError("Assign atleast one user")
    }
    else {
      const params = {
        projectId: this.project.projectId,
        projectDesc: this.project.projectDesc,
        ownerId: this.project.owner.id,
        users: JSON.stringify(this.project.users.map(user => { return { user_id: user.id } })),
      }
      this.common.loading++;
      this.api.post('AdminTask/addProject', params).subscribe(res => {
        console.log(res);
        this.common.loading--;
        if (res['code'] > 0) {
          if (res['data'][0]['y_id'] > 0) {
            this.common.showToast(res['data'][0].y_msg)
            // this.closeModal(true);
            this.project = { projectId: 0, projectDesc: "", owner: { id: "", name: " " }, users: [] };
            this.getAllProjectList();
          } else {
            this.common.showError(res['data'][0].y_msg)
          }
        } else {
          this.common.showError(res['msg']);
        }
      },
        err => {
          this.common.loading--;
          this.common.showError();
          console.log('Error: ', err);
        });
    }
  }

  getAllProjectList() {
    this.showLoading = true;
    this.projectList = [];
    this.api.get('AdminTask/allProjectList').subscribe(res => {
      this.showLoading = false;
      console.log("messageList:", res['data']);
      if (res['code'] > 0) {
        this.projectList = res['data'] || [];
        this.setTableProjectList();
      } else {
        this.common.showError(res['msg'])
      }
    },
      err => {
        this.showLoading = false;
        this.common.showError();
        console.log('Error: ', err);
      });
  }

  formatTitle(strval) {
    let pos = strval.indexOf('_');
    if (pos > 0) {
      return strval.toLowerCase().split('_').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    } else {
      return strval.charAt(0).toUpperCase() + strval.substr(1);
    }
  }
  // start project list
  setTableProjectList() {
    this.tableProjectList.data = {
      headings: this.generateHeadingsProjectList(),
      columns: this.getTableColumnsProjectList()
    };
    return true;
  }

  generateHeadingsProjectList() {
    // console.log(this.dailyReportList);
    let headings = {};
    for (var key in this.projectList[0]) {
      // console.log(key.charAts(0));
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.formatTitle(key) };
      }
    }
    // console.log(headings);
    return headings;
  }
  getTableColumnsProjectList() {
    let columns = [];
    this.projectList.map(project => {
      let column = {};
      for (let key in this.generateHeadingsProjectList()) {
        if (key == 'Action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(project)
          };
        } else if (key == 'is_active') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (project[key]) ? [{ class: "fa fa-check text-success", action: null, title: "is active" }] : '',
            action: null,
            class: "text-center"
          };
        } else if (key == 'is_complete') {
          column[key] = {
            value: "",
            isHTML: true,
            icons: (project[key]) ? [{ class: "fa fa-check text-success", action: null, title: "is complete" }] : '',
            action: null,
            class: "text-center"
          };
        } else {
          column[key] = { value: project[key], class: 'black', action: '' };
        }
      }
      columns.push(column);
    });
    // console.log(columns);
    return columns;

  }
  // end project list

  actionIcons(project) {
    let icons = [
      { class: "fas fa-trash-alt", action: this.deleteProject.bind(this, project) },
      { class: "far fa-edit", action: this.editProject.bind(this, project) },
    ];
    return icons;
  }

  editProject(project) {
    console.log("edit project:", project);
    let userNames = project.userName.split(',');
    let userIds = project._userids.split(',');
    this.project = {
      projectId: project._project_id,
      projectDesc: project.project_desc,
      owner: {
        id: project._owner_id,
        name: project.owner
      },
      users: userIds.map((id, index) => {
        return { id, name: userNames[index] }
      })
    };

    console.log(this.project);

  }

  deleteProject(project) {
    // project._id = 11;
    console.log("delete project:", project);
    if (project._project_id) {
      let params = {
        projectId: project._project_id,
      }
      this.common.params = {
        title: 'Delete Project ',
        description: `<b>&nbsp;` + 'Are You Sure To Delete This Record' + `<b>`,
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.post('AdminTask/deleteProject.json', params)
            .subscribe(res => {
              this.common.loading--;
              this.common.showToast(res['msg']);
              this.getAllProjectList();
            }, err => {
              this.common.loading--;
              console.log('Error: ', err);
            });
        }
      });
    } else {
      this.common.showError("Project ID Not Available");
    }
  }

}
