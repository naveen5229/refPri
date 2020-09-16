import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Service/Api/api.service';
import { CommonService } from '../../Service/common/common.service';
import { NormalTask } from '../../classes/normal-task';
import { UserService } from '../../Service/user/user.service';
import { ConfirmComponent } from '../../modals/confirm/confirm.component';
import { group } from 'console';

@Component({
  selector: 'ngx-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent implements OnInit {
  buttonVisible = true;
  adminList = [];
  groupList = [];
  groupUsers;
  groupForm = {
    requestId: null,
    name: "",
    users: []
  };

  table = {
    data: {
      headings: {},
      columns: []
    },
    settings: {
      hideHeader: true
    }
  };

  constructor(public common: CommonService,
    public api: ApiService,
    public modalService: NgbModal) {
    this.common.refresh = this.refresh.bind(this);
    this.getAllAdmin();
    this.getUserGroupList();
  }

  ngOnInit() { }

  refresh() {
    this.resetForm();
    this.getAllAdmin();
    this.getUserGroupList();
  }

  getAllAdmin() {
    this.api.get("Admin/getAllAdmin.json").subscribe(res => {
      if (res['code'] > 0) {
        let adminList = res['data'] || [];
        this.adminList = adminList.map(x => { return { id: x.id, name: x.name + " - " + x.department_name } });
      } else {
        this.common.showError(res['msg']);
      }
    }, err => {
      this.common.showError();
      console.log('Error: ', err);
    });
  }

  getUserGroupList() {
    this.common.loading++;
    this.api.get('UserRole/getUserGroups')
      .subscribe(res => {
        this.common.loading--;
        this.groupList = res['data'] || [];
        this.groupList.length ? this.setTable() : this.resetTable();
      }, err => {
        this.common.loading--;
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
    for (var key in this.groupList[0]) {
      if (key.charAt(0) != "_") {
        headings[key] = { title: key, placeholder: this.common.formatTitle(key) };
      }
    }
    return headings;
  }

  getTableColumns() {
    // console.log(this.generateHeadings());
    let columns = [];
    this.groupList.map(row => {
      let column = {};
      for (let key in this.generateHeadings()) {
        if (key.toLowerCase() == 'action') {
          column[key] = {
            value: "",
            isHTML: true,
            action: null,
            icons: this.actionIcons(row)
          };
        } else {
          if (key == 'users') {
            column[key] = { value: row['_employee'].length, class: 'blue', action: this.openGroupUserModal.bind(this, row) };
          } else {
            column[key] = { value: row[key], class: 'black', action: '' };
          }
        }
      }
      columns.push(column);
    });
    return columns;

  }

  actionIcons(row) {
    let icons = [
      { class: "fa fa-edit", action: this.editGroup.bind(this, row) },
      // { class: "fa fa-trash", action: this.deleteGroup.bind(this, row) },
    ];
    return icons;
  }

  resetForm() {
    this.groupForm = {
      requestId: null,
      name: "",
      users: []
    }
  }

  addGroup() {
    console.log("groupForm:", this.groupForm);
    let params = {
      requestId: (this.groupForm.requestId > 0) ? this.groupForm.requestId : null,
      name: this.groupForm.name,
      users: (this.groupForm.users && this.groupForm.users.length) ? JSON.stringify(this.groupForm.users) : null
    };
    console.log(params);
    this.common.loading++;
    this.api.post('UserRole/addUserGroup', params)
      .subscribe(res => {
        this.common.loading--;
        if (res['code'] == 1) {
          if (res['data'][0].y_id > 0) {
            this.common.showToast(res['msg']);
            this.resetForm();
            this.getUserGroupList();
          } else {
            this.common.showError(res['msg']);
          }
        } else {
          this.common.showError(res['msg']);
        }
      }, err => {
        this.common.loading--;
        console.log('Error: ', err);
      });
  }

  editGroup(row) {
    if (row._id) {
      this.groupForm.requestId = row._id;
      this.groupForm.name = row.name;
      this.groupForm.users = (row._employee && row._employee.length > 0) ? row._employee.map(x => { return { id: x._id, name: x.name } }) : null;
    }
  }



  deleteGroup(row) {
    if (row._id) {
      let params = '?requestId=' + row._id
      this.common.params = {
        title: 'Delete Installer',
        description: '<b>Are You Sure To Delete This Record<b>',
      }

      const activeModal = this.modalService.open(ConfirmComponent, { size: 'sm', container: 'nb-layout', backdrop: 'static', keyboard: false, windowClass: "accountModalClass" });
      activeModal.result.then(data => {
        if (data.response) {
          this.common.loading++;
          this.api.get('UserRole/deleteUserGroup' + params).subscribe(res => {
            this.common.loading--;
            if (res['code'] == 1) {
              if (res['data'][0].y_id > 0) {
                this.common.showToast(res['msg']);
                this.getUserGroupList();
              } else {
                this.common.showError(res['msg']);
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

  selectedGroupUsers = null;
  openGroupUserModal(row) {
    console.log("openUserModal:", row);
    this.selectedGroupUsers = row._employee;
    document.getElementById("groupUserModal").style.display = "block";
  }
  closeGroupUserModal() {
    this.selectedGroupUsers = null;
    document.getElementById("groupUserModal").style.display = "none";
  }

}
